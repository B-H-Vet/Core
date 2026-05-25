import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';

import { categories } from '../schema/inventory/categories.schema';
import { measurementUnits } from '../schema/inventory/measurement-units.schema';
import { supplies } from '../schema/inventory/supplies.schema';
import { specialties } from '../schema/specialties/specialties.schema';

const DEFAULT_MEASUREMENT_UNITS = [
  { unit: 'Unidad' },
  { unit: 'Mililitro' },
  { unit: 'Litro' },
  { unit: 'Gramo' },
  { unit: 'Kilogramo' },
  { unit: 'Tableta' },
  { unit: 'Cápsula' },
  { unit: 'Ampolla' },
  { unit: 'Frasco' },
  { unit: 'Paquete' },
] as const;

const DEFAULT_CATEGORIES = [
  { name: 'Medicamentos' },
  { name: 'Vacunas' },
  { name: 'Alimentos' },
  { name: 'Accesorios' },
  { name: 'Material Quirúrgico' },
  { name: 'Productos de Higiene' },
  { name: 'Suplementos' },
  { name: 'Equipo Médico' },
] as const;

const DEFAULT_SPECIALTIES = [
  {
    name: 'Cirugía General',
    description: 'Procedimientos quirúrgicos generales',
  },
  { name: 'Dermatología', description: 'Enfermedades de la piel y anexos' },
  {
    name: 'Cardiología',
    description: 'Enfermedades del corazón y sistema circulatorio',
  },
  { name: 'Odontología', description: 'Salud bucal y dental' },
  {
    name: 'Medicina Interna',
    description: 'Diagnóstico y tratamiento de enfermedades internas',
  },
  { name: 'Oncología', description: 'Diagnóstico y tratamiento del cáncer' },
  { name: 'Neurología', description: 'Enfermedades del sistema nervioso' },
  {
    name: 'Traumatología y Ortopedia',
    description: 'Lesiones musculoesqueléticas',
  },
  { name: 'Anestesiología', description: 'Manejo del dolor y anestesia' },
  { name: 'Radiología e Imágenes', description: 'Diagnóstico por imágenes' },
] as const;

interface SupplySeedData {
  name: string;
  price: string;
  minStock: number;
  stock: number;
  unitName: string;
  categoryName: string;
  expiringDate?: Date;
}

const DEFAULT_SUPPLIES: readonly SupplySeedData[] = [
  {
    name: 'Amoxicilina 500mg',
    price: '25.00',
    minStock: 50,
    stock: 200,
    unitName: 'Tableta',
    categoryName: 'Medicamentos',
    expiringDate: new Date('2026-12-01'),
  },
  {
    name: 'Vacuna Antirrábica',
    price: '45.00',
    minStock: 20,
    stock: 100,
    unitName: 'Unidad',
    categoryName: 'Vacunas',
    expiringDate: new Date('2026-06-15'),
  },
  {
    name: 'Shampoo Antipulgas 250ml',
    price: '18.50',
    minStock: 30,
    stock: 80,
    unitName: 'Frasco',
    categoryName: 'Productos de Higiene',
    expiringDate: new Date('2027-03-20'),
  },
  {
    name: 'Alimento Premium Perro Adulto',
    price: '85.00',
    minStock: 10,
    stock: 40,
    unitName: 'Kilogramo',
    categoryName: 'Alimentos',
    expiringDate: new Date('2026-08-10'),
  },
  {
    name: 'Guantes Quirúrgicos Estériles',
    price: '12.00',
    minStock: 100,
    stock: 500,
    unitName: 'Paquete',
    categoryName: 'Material Quirúrgico',
  },
  {
    name: 'Jeringa Desechable 10ml',
    price: '3.50',
    minStock: 200,
    stock: 1000,
    unitName: 'Unidad',
    categoryName: 'Equipo Médico',
  },
  {
    name: 'Complejo B Inyectable',
    price: '15.00',
    minStock: 40,
    stock: 150,
    unitName: 'Ampolla',
    categoryName: 'Suplementos',
    expiringDate: new Date('2026-11-30'),
  },
  {
    name: 'Gasas Estériles 10x10cm',
    price: '8.00',
    minStock: 80,
    stock: 300,
    unitName: 'Paquete',
    categoryName: 'Material Quirúrgico',
  },
  {
    name: 'Metronidazol 250mg',
    price: '22.00',
    minStock: 60,
    stock: 180,
    unitName: 'Tableta',
    categoryName: 'Medicamentos',
    expiringDate: new Date('2026-09-15'),
  },
  {
    name: 'Vacuna Pentavalente Canina',
    price: '55.00',
    minStock: 15,
    stock: 60,
    unitName: 'Unidad',
    categoryName: 'Vacunas',
    expiringDate: new Date('2026-05-20'),
  },
  {
    name: 'Desparasitante Oral 10ml',
    price: '28.00',
    minStock: 25,
    stock: 90,
    unitName: 'Frasco',
    categoryName: 'Medicamentos',
    expiringDate: new Date('2027-01-10'),
  },
  {
    name: 'Collar Isabelino Talla M',
    price: '14.00',
    minStock: 20,
    stock: 60,
    unitName: 'Unidad',
    categoryName: 'Accesorios',
  },
] as const;

async function seedMeasurementUnits(db: MySql2Database): Promise<void> {
  for (const unitData of DEFAULT_MEASUREMENT_UNITS) {
    const existing = await db
      .select()
      .from(measurementUnits)
      .where(eq(measurementUnits.unit, unitData.unit))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(measurementUnits).values({
        unit: unitData.unit,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log(`Measurement unit created: ${unitData.unit}`);
    } else {
      console.log(`Measurement unit already exists: ${unitData.unit}`);
    }
  }
}

async function seedCategories(db: MySql2Database): Promise<void> {
  for (const categoryData of DEFAULT_CATEGORIES) {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.name, categoryData.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(categories).values({
        name: categoryData.name,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log(`Category created: ${categoryData.name}`);
    } else {
      console.log(`Category already exists: ${categoryData.name}`);
    }
  }
}

async function seedSpecialties(db: MySql2Database): Promise<void> {
  for (const specialtyData of DEFAULT_SPECIALTIES) {
    const existing = await db
      .select()
      .from(specialties)
      .where(eq(specialties.name, specialtyData.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(specialties).values({
        name: specialtyData.name,
        description: specialtyData.description,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log(`Specialty created: ${specialtyData.name}`);
    } else {
      console.log(`Specialty already exists: ${specialtyData.name}`);
    }
  }
}

async function seedSupplies(db: MySql2Database): Promise<void> {
  const allUnits = await db.select().from(measurementUnits);
  const allCategories = await db.select().from(categories);

  const unitMap = new Map(allUnits.map((u) => [u.unit, u.id]));
  const categoryMap = new Map(allCategories.map((c) => [c.name, c.id]));

  for (const supplyData of DEFAULT_SUPPLIES) {
    const unitId = unitMap.get(supplyData.unitName);
    const categoryId = categoryMap.get(supplyData.categoryName);

    if (!unitId) {
      console.warn(
        `Measurement unit not found for supply "${supplyData.name}": ${supplyData.unitName}`,
      );
      continue;
    }

    if (!categoryId) {
      console.warn(
        `Category not found for supply "${supplyData.name}": ${supplyData.categoryName}`,
      );
      continue;
    }

    const existing = await db
      .select()
      .from(supplies)
      .where(eq(supplies.name, supplyData.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(supplies).values({
        id_measurement: unitId,
        id_category: categoryId,
        name: supplyData.name,
        price: supplyData.price,
        min_stock: supplyData.minStock,
        stock: supplyData.stock,
        expiring_date: supplyData.expiringDate ?? null,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log(`Supply created: ${supplyData.name}`);
    } else {
      console.log(`Supply already exists: ${supplyData.name}`);
    }
  }
}

async function seedReferenceData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
  });

  const db = drizzle(connection);

  await seedMeasurementUnits(db);
  await seedCategories(db);
  await seedSpecialties(db);
  await seedSupplies(db);

  await connection.end();
  console.log('Reference data seed completed successfully.');
}

seedReferenceData().catch((err: unknown) => {
  console.error('Reference data seed error:', err);
  process.exit(1);
});
