import mongoose from "mongoose";
import request from "supertest";
import app from "../src/app";
import { connectDb } from "../src/config/database.js";
import { loadEnv } from "../src/config/env.js";

loadEnv();

export async function initTestDb() {
  if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/oldmarket_test";
  }
  // Reuse existing connection if open
  if (mongoose.connection.readyState === 0) {
    await connectDb();
  }
}

export async function clearDatabase() {
  const db = mongoose.connection.db;
  if (!db) return;
  const collections = await db.collections();
  for (const c of collections) await c.deleteMany({});
}

export async function closeDatabase() {
  await mongoose.connection.close();
}

export function api() {
  return request(app);
}
