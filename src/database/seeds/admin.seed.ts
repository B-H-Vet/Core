import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';

import { roles } from '../schema/auth/roles.schema';
import { userRoles } from '../schema/auth/user-roles.schema';
import { users } from '../schema/auth/users.schema';

async function seedAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
  });

  const db = drizzle(connection);

  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? 'admin@breaze-harold.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  const adminName = process.env.ADMIN_SEED_NAME ?? 'Administrador Sistema';

  if (!adminPassword) {
    console.error('ADMIN_SEED_PASSWORD environment variable is required');
    await connection.end();
    process.exit(1);
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existingUser.length > 0) {
    console.log(`Admin user already exists: ${adminEmail}`);
    await connection.end();
    return;
  }

  const adminRoleResult = await db
    .select()
    .from(roles)
    .where(eq(roles.name, 'ADMINISTRADOR'))
    .limit(1);

  const adminRole = adminRoleResult[0];

  if (!adminRole) {
    console.error('ADMINISTRADOR role not found. Please run migrations first.');
    await connection.end();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await db.insert(users).values({
    name: adminName,
    email: adminEmail,
    password_hash: passwordHash,
    email_verified_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  });

  const [newUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (!newUser) {
    console.error('Failed to create admin user');
    await connection.end();
    process.exit(1);
  }

  await db.insert(userRoles).values({
    user_id: newUser.id,
    role_id: adminRole.id,
    approved_at: new Date(),
    assigned_at: new Date(),
  });

  console.log(`Admin user created successfully: ${adminEmail}`);
  await connection.end();
}

seedAdmin().catch((err: unknown) => {
  console.error('Seed error:', err);
  process.exit(1);
});
