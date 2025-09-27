import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export async function connectDb() {
  const { mongoUri } = env();
  await mongoose.connect(mongoUri);
  logger.info({ msg: "db connected" });
}
