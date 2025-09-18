const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Iniciando configuración de la base de datos...');
    
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Ejecutar migraciones
    console.log('🔄 Ejecutando migraciones...');
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;
    console.log('✅ Extensión UUID creada');
    
    // Crear tablas básicas si no existen
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        avatar TEXT,
        role TEXT NOT NULL DEFAULT 'VOLUNTEER',
        verified BOOLEAN NOT NULL DEFAULT false,
        active BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "emailVerified" BOOLEAN NOT NULL DEFAULT false,
        "emailVerifiedAt" TIMESTAMP,
        "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
        "phoneVerifiedAt" TIMESTAMP
      );
    `;
    console.log('✅ Tabla users creada');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS volunteers (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        skills TEXT[] DEFAULT '{}',
        interests TEXT[] DEFAULT '{}',
        bio TEXT,
        rating DOUBLE PRECISION NOT NULL DEFAULT 0,
        "hoursCompleted" INTEGER NOT NULL DEFAULT 0,
        "eventsParticipated" INTEGER NOT NULL DEFAULT 0,
        address TEXT,
        city TEXT,
        state TEXT,
        country TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        "birthDate" TIMESTAMP,
        gender TEXT,
        languages TEXT[] DEFAULT '{}',
        experience TEXT[] DEFAULT '{}',
        "socialLinks" TEXT[] DEFAULT '{}',
        "cvUrl" TEXT,
        achievements TEXT[] DEFAULT '{}',
        verified BOOLEAN,
        references TEXT[] DEFAULT '{}',
        tagline TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Tabla volunteers creada');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        website TEXT,
        verified BOOLEAN NOT NULL DEFAULT false,
        "eventsCreated" INTEGER NOT NULL DEFAULT 0,
        "volunteersHelped" INTEGER NOT NULL DEFAULT 0,
        address TEXT,
        city TEXT,
        state TEXT,
        country TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        "contactEmail" TEXT,
        "contactPhone" TEXT,
        "socialLinks" TEXT[] DEFAULT '{}',
        "verificationDocs" TEXT[] DEFAULT '{}',
        preferences TEXT[] DEFAULT '{}',
        rating DOUBLE PRECISION NOT NULL DEFAULT 0,
        tagline TEXT,
        category TEXT[] DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Tabla organizations creada');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS event_categories (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Tabla event_categories creada');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "organizationId" TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        country TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP NOT NULL,
        "maxVolunteers" INTEGER NOT NULL,
        "currentVolunteers" INTEGER NOT NULL DEFAULT 0,
        skills TEXT[] DEFAULT '{}',
        "categoryId" TEXT NOT NULL REFERENCES event_categories(id),
        status TEXT NOT NULL DEFAULT 'DRAFT',
        requirements TEXT[] DEFAULT '{}',
        benefits TEXT[] DEFAULT '{}',
        "imageUrl" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Tabla events creada');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS event_applications (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "eventId" TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        "volunteerId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'PENDING',
        "appliedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        message TEXT,
        rating INTEGER,
        feedback TEXT,
        "completedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE("eventId", "volunteerId")
      );
    `;
    console.log('✅ Tabla event_applications creada');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS availability (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "volunteerId" TEXT NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
        "dayOfWeek" INTEGER NOT NULL,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Tabla availability creada');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'INFO',
        read BOOLEAN NOT NULL DEFAULT false,
        "actionUrl" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Tabla notifications creada');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "eventId" TEXT REFERENCES events(id) ON DELETE CASCADE,
        "senderId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "receiverId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT false,
        type TEXT NOT NULL DEFAULT 'DIRECT',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Tabla messages creada');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS user_vectors (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        features DOUBLE PRECISION[] NOT NULL,
        "lastUpdated" TIMESTAMP NOT NULL DEFAULT NOW(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Tabla user_vectors creada');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS ml_metrics (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "modelType" TEXT NOT NULL,
        precision DOUBLE PRECISION NOT NULL,
        recall DOUBLE PRECISION NOT NULL,
        "f1Score" DOUBLE PRECISION NOT NULL,
        accuracy DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Tabla ml_metrics creada');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS email_verification_codes (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Tabla email_verification_codes creada');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS phone_verification_codes (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        phone TEXT NOT NULL,
        code TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Tabla phone_verification_codes creada');
    
    // Insertar categorías de eventos por defecto
    await prisma.$executeRaw`
      INSERT INTO event_categories (id, name, description, icon, color) VALUES
      ('cat-1', 'Medio Ambiente', 'Eventos relacionados con la protección del medio ambiente', '🌱', '#10B981'),
      ('cat-2', 'Educación', 'Eventos educativos y de enseñanza', '📚', '#3B82F6'),
      ('cat-3', 'Salud', 'Eventos relacionados con la salud y bienestar', '🏥', '#EF4444'),
      ('cat-4', 'Comunidad', 'Eventos comunitarios y sociales', '👥', '#8B5CF6'),
      ('cat-5', 'Deportes', 'Eventos deportivos y recreativos', '⚽', '#F59E0B'),
      ('cat-6', 'Arte y Cultura', 'Eventos artísticos y culturales', '🎨', '#EC4899'),
      ('cat-7', 'Tecnología', 'Eventos tecnológicos y de innovación', '💻', '#06B6D4'),
      ('cat-8', 'Animales', 'Eventos relacionados con el cuidado de animales', '🐕', '#84CC16')
      ON CONFLICT (name) DO NOTHING;
    `;
    console.log('✅ Categorías de eventos insertadas');
    
    console.log('🎉 Base de datos configurada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
