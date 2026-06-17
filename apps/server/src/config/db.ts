import mongoose from 'mongoose';

import { MONGO_URI } from './env.js';

function validateMongoUri(uri: string): void {
  if (!uri.startsWith('mongodb+srv://') && !uri.includes('ssl=true') && !uri.includes('tls=true')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGO_URI must use TLS in production (mongodb+srv:// or ?tls=true)');
    }

    console.warn('[db] Warning: MongoDB connection is not using TLS');
  }
}

export async function connectDB(): Promise<void> {
  try {
    validateMongoUri(MONGO_URI!);

    mongoose.set('sanitizeFilter', true);
    const conn = await mongoose.connect(MONGO_URI!);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('MongoDB connection error:', err.message);
    } else {
      console.error('MongoDB connection error:', err);
    }

    process.exit(1);
  }
}
