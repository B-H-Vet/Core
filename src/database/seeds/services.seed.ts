import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';

import { services } from '../schema/services/services.schema';

const DEFAULT_SERVICES = [
  {
    name: 'Consulta General',
    description:
      'Evaluación clínica completa del estado de salud de la mascota',
    price: '45000.00',
    duration_minutes: 30,
  },
  {
    name: 'Vacunación',
    description: 'Aplicación de vacunas según el calendario veterinario',
    price: '55000.00',
    duration_minutes: 20,
  },
  {
    name: 'Desparasitación',
    description: 'Administración de antiparasitarios internos y externos',
    price: '35000.00',
    duration_minutes: 20,
  },
  {
    name: 'Cirugía Menor',
    description:
      'Procedimientos quirúrgicos de baja complejidad (esterilización, extracciones, etc.)',
    price: '180000.00',
    duration_minutes: 60,
  },
  {
    name: 'Baño y Estética',
    description:
      'Baño medicado, corte de pelo, corte de uñas y limpieza de oídos',
    price: '40000.00',
    duration_minutes: 45,
  },
  {
    name: 'Examen de Laboratorio',
    description:
      'Análisis de sangre, orina, heces y otros exámenes diagnósticos',
    price: '75000.00',
    duration_minutes: 30,
  },
  {
    name: 'Radiografía',
    description:
      'Estudios de imagen por rayos X para diagnóstico ortopédico y torácico',
    price: '95000.00',
    duration_minutes: 30,
  },
  {
    name: 'Ecografía',
    description:
      'Estudio de imagen por ultrasonido para evaluación de órganos internos',
    price: '110000.00',
    duration_minutes: 30,
  },
  {
    name: 'Hospitalización (día)',
    description: 'Cuidado intensivo y monitoreo de mascotas durante el día',
    price: '150000.00',
    duration_minutes: 0,
  },
  {
    name: 'Odontología Veterinaria',
    description:
      'Limpieza dental, extracciones y tratamiento de enfermedades bucales',
    price: '85000.00',
    duration_minutes: 45,
  },
] as const;

async function seedServices(db: MySql2Database): Promise<void> {
  for (const serviceData of DEFAULT_SERVICES) {
    const existing = await db
      .select()
      .from(services)
      .where(eq(services.name, serviceData.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(services).values({
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        duration_minutes: serviceData.duration_minutes,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log(`Service created: ${serviceData.name}`);
    } else {
      console.log(`Service already exists: ${serviceData.name}`);
    }
  }
}

async function seedServicesMain() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
  });

  const db = drizzle(connection);

  await seedServices(db);

  await connection.end();
  console.log('Services seed completed successfully.');
}

seedServicesMain().catch((err: unknown) => {
  console.error('Services seed error:', err);
  process.exit(1);
});
