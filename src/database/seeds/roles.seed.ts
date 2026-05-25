import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';

import { roles } from '../schema/auth/roles.schema';

const DEFAULT_ROLES = [
  {
    name: 'ADMINISTRADOR',
    description: 'Administrador del sistema con acceso total',
    requiresApproval: true,
  },
  {
    name: 'RECEPCIONISTA',
    description: 'Personal de recepción',
    requiresApproval: true,
  },
  {
    name: 'VETERINARIO',
    description: 'Veterinario con acceso a historiales médicos',
    requiresApproval: true,
  },
  {
    name: 'CLIENTE',
    description: 'Cliente propietario de mascotas',
    requiresApproval: false,
  },
] as const;

async function seedRoles() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
  });

  const db = drizzle(connection);

  for (const roleData of DEFAULT_ROLES) {
    const existing = await db
      .select()
      .from(roles)
      .where(eq(roles.name, roleData.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(roles).values({
        name: roleData.name,
        description: roleData.description,
        requires_approval: roleData.requiresApproval,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log(`Role created: ${roleData.name}`);
    } else {
      await db
        .update(roles)
        .set({
          description: roleData.description,
          requires_approval: roleData.requiresApproval,
          updated_at: new Date(),
        })
        .where(eq(roles.name, roleData.name));
      console.log(`Role updated: ${roleData.name}`);
    }
  }

  await connection.end();
}

seedRoles().catch((err: unknown) => {
  console.error('Roles seed error:', err);
  process.exit(1);
});
