#!/bin/sh
set -e

# Wait for MySQL specific database to be ready
MAX_RETRIES=30
RETRY_COUNT=0

echo "Waiting for MySQL database '${DB_NAME}' to be ready..."
until node -e "
  const mysql = require('mysql2/promise');
  mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
  }).then(conn => {
    return conn.execute('SELECT 1').then(() => {
      conn.end();
      process.exit(0);
    });
  }).catch(() => process.exit(1));
" 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "Error: MySQL database did not become ready after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "MySQL database not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES), retrying in 2s..."
  sleep 2
done

echo "MySQL database is ready!"

# Check if migrations have already been applied by looking at __drizzle_migrations table
MIGRATIONS_TABLE_EXISTS=$(node -e "
  const mysql = require('mysql2/promise');
  mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
  }).then(conn => {
    return conn.execute(\"SHOW TABLES LIKE '__drizzle_migrations'\").then(([rows]) => {
      conn.end();
      process.exit(rows.length > 0 ? 0 : 1);
    });
  }).catch(() => process.exit(1));
" 2>/dev/null && echo "yes" || echo "no")

if [ "$MIGRATIONS_TABLE_EXISTS" = "yes" ]; then
  echo "Migrations table exists. Checking if migrations are up to date..."
  # Run migrate - it will skip already applied migrations
  echo "Running database migrations..."
  if ./node_modules/.bin/drizzle-kit migrate; then
    echo "Migrations completed successfully."
  else
    echo "Warning: Migration command returned non-zero exit code. Checking database state..."
    # If migrate fails, check if our key tables exist anyway (partial migration on MySQL)
    TABLES_EXIST=$(node -e "
      const mysql = require('mysql2/promise');
      mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || '',
      }).then(conn => {
        return conn.execute(\"SHOW TABLES LIKE 'users'\").then(([rows]) => {
          conn.end();
          process.exit(rows.length > 0 ? 0 : 1);
        });
      }).catch(() => process.exit(1));
    " 2>/dev/null && echo "yes" || echo "no")

    if [ "$TABLES_EXIST" = "yes" ]; then
      echo "Database tables already exist. Assuming migrations were partially applied. Continuing..."
    else
      echo "Error: Database tables do not exist and migrations failed. This is a critical error."
      exit 1
    fi
  fi
else
  # No migrations table - fresh database
  # Generate initial migration only if no migrations exist on disk
  if [ ! -f "/app/drizzle/meta/_journal.json" ]; then
    echo "No migrations found. Generating initial migration..."
    ./node_modules/.bin/drizzle-kit generate
  fi

  echo "Running database migrations..."
  if ./node_modules/.bin/drizzle-kit migrate; then
    echo "Migrations completed successfully."
  else
    echo "Error: Initial migration failed. Checking database state..."
    # On MySQL, partial DDL can leave tables created without journal entry
    TABLES_EXIST=$(node -e "
      const mysql = require('mysql2/promise');
      mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || '',
      }).then(conn => {
        return conn.execute(\"SHOW TABLES LIKE 'users'\").then(([rows]) => {
          conn.end();
          process.exit(rows.length > 0 ? 0 : 1);
        });
      }).catch(() => process.exit(1));
    " 2>/dev/null && echo "yes" || echo "no")

    if [ "$TABLES_EXIST" = "yes" ]; then
      echo "Warning: Tables exist but migration journal is incomplete (MySQL partial DDL). Continuing..."
    else
      echo "Error: Migration failed and no tables were created."
      exit 1
    fi
  fi
fi

echo "Seeding default roles..."
node dist/database/seeds/roles.seed.js

echo "Seeding admin user..."
node dist/database/seeds/admin.seed.js

echo "Seeding reference data (specialties, categories, measurement units, supplies)..."
node dist/database/seeds/reference-data.seed.js

echo "Seeding vet user..."
node dist/database/seeds/vet.seed.js

echo "Seeding default services..."
node dist/database/seeds/services.seed.js

echo "Starting application..."
exec node dist/main
