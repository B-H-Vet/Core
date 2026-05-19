import { Module, Global } from '@nestjs/common';
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';

import * as schema from './schema';

export type Database = MySql2Database<typeof schema>;

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async (): Promise<Database> => {
        const connection = await mysql.createConnection({
          host: process.env.DB_HOST ?? 'localhost',
          port: Number(process.env.DB_PORT ?? '3306'),
          user: process.env.DB_USERNAME ?? 'root',
          password: process.env.DB_PASSWORD ?? '',
          database: process.env.DB_NAME ?? '',
        });
        return drizzle(connection, { schema, mode: 'default' });
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
