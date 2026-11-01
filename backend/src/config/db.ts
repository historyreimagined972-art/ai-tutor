import mongoose from 'mongoose';
import dns from 'dns';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env.js';

// Use Google DNS to resolve MongoDB Atlas hostnames
dns.setServers(['8.8.8.8', '8.8.4.4']);

let memoryServer: MongoMemoryServer | null = null;

async function startInMemoryDB(): Promise<void> {
  await mongoose.disconnect().catch(() => undefined);
  memoryServer = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: 'ai-tutor' },
  });
  await mongoose.connect(memoryServer.getUri('ai-tutor'), { serverSelectionTimeoutMS: 10000 });
  console.log('✅ In-memory MongoDB connected (data will not persist)');
  console.warn('⚠️ Atlas MONGODB_URI is unreachable — running on temporary local database');
}

export async function connectDB(): Promise<void> {
  if (process.env.USE_IN_MEMORY_DB === 'true') {
    memoryServer = await MongoMemoryServer.create({
      instance: { port: 27017, dbName: 'ai-tutor' },
    });
    await mongoose.connect(memoryServer.getUri('ai-tutor'), { serverSelectionTimeoutMS: 10000 });
    console.log('✅ In-memory MongoDB connected (data will not persist)');
    return;
  }
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    await startInMemoryDB();
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
      console.log('✅ In-memory MongoDB stopped');
    }
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
  }
}

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});
