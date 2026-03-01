import mongoose from "mongoose";

let dbEnabled = false;

export async function connectDb(): Promise<boolean> {
  const uri = process.env.MONGO_URI;
  if (!uri) return false;

  try {
    await mongoose.connect(uri);
    dbEnabled = true;
    console.log("MongoDB connected");
    return true;
  } catch {
    dbEnabled = false;
    console.log("MongoDB connection failed");
    return false;
  }
}

export function isDbEnabled(): boolean {
  return dbEnabled;
}
