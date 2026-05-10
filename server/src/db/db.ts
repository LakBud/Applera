import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("MongoDB connection error:", err.message);
    } else {
      console.error("MongoDB connection error:", err);
    }

    process.exit(1);
  }
}
