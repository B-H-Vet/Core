import { randomUUID } from 'crypto';

import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';

import { roles } from '../schema/auth/roles.schema';
import { userRoles } from '../schema/auth/user-roles.schema';
import { users } from '../schema/auth/users.schema';
import { specialties } from '../schema/specialties/specialties.schema';
import { vetSpecialties } from '../schema/vets/vet-specialties.schema';
import { vets } from '../schema/vets/vets.schema';

interface SeedConfig {
  email: string;
  password: string;
  name: string;
  licenseNumber: string;
  specialtyNames?: string[];
}

function getSeedConfig(): SeedConfig {
  const password = process.env.VET_SEED_PASSWORD;
  if (!password) {
    throw new Error('VET_SEED_PASSWORD environment variable is required');
  }

  return {
    email: process.env.VET_SEED_EMAIL ?? 'vet@breaze-harold.com',
    password,
    name: process.env.VET_SEED_NAME ?? 'Dr. Harold Breaze',
    licenseNumber: process.env.VET_SEED_LICENSE ?? 'VET-2024-001',
    specialtyNames: process.env.VET_SEED_SPECIALTIES
      ? process.env.VET_SEED_SPECIALTIES.split(',').map((s) => s.trim())
      : ['Medicina Interna', 'Cirugía General'],
  };
}

async function seedVet() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
  });

  const db = drizzle(connection);
  const config = getSeedConfig();

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, config.email))
    .limit(1);

  if (existingUser.length > 0) {
    console.log(`Vet user already exists: ${config.email}`);
    await connection.end();
    return;
  }

  const vetRoleResult = await db
    .select()
    .from(roles)
    .where(eq(roles.name, 'VETERINARIO'))
    .limit(1);

  const vetRole = vetRoleResult[0];

  if (!vetRole) {
    console.error('VETERINARIO role not found. Please run roles seed first.');
    await connection.end();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(config.password, 10);
  const newUserId = randomUUID();

  await db.insert(users).values({
    id: newUserId,
    name: config.name,
    email: config.email,
    password_hash: passwordHash,
    email_verified_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  });

  await db.insert(userRoles).values({
    user_id: newUserId,
    role_id: vetRole.id,
    approved_at: new Date(),
    assigned_at: new Date(),
  });

  await db.insert(vets).values({
    user_id: newUserId,
    license_number: config.licenseNumber,
    created_at: new Date(),
    updated_at: new Date(),
  });

  const [newVet] = await db
    .select()
    .from(vets)
    .where(eq(vets.user_id, newUserId))
    .limit(1);

  if (!newVet) {
    console.error('Failed to create vet profile');
    await connection.end();
    process.exit(1);
  }

  if (config.specialtyNames && config.specialtyNames.length > 0) {
    const allSpecialties = await db.select().from(specialties);
    const specialtyMap = new Map(allSpecialties.map((s) => [s.name, s.id]));

    for (const specialtyName of config.specialtyNames) {
      const specialtyId = specialtyMap.get(specialtyName);

      if (!specialtyId) {
        console.warn(`Specialty not found: ${specialtyName}`);
        continue;
      }

      await db.insert(vetSpecialties).values({
        vet_id: newVet.id,
        specialty_id: specialtyId,
      });
      console.log(`Assigned specialty "${specialtyName}" to vet`);
    }
  }

  console.log(`Vet user created successfully: ${config.email}`);
  console.log(`  Name: ${config.name}`);
  console.log(`  License: ${config.licenseNumber}`);
  console.log(`  Specialties: ${(config.specialtyNames ?? []).join(', ')}`);
  await connection.end();
}

seedVet().catch((err: unknown) => {
  console.error('Vet seed error:', err);
  process.exit(1);
});
