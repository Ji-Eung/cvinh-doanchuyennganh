import dotenv from "dotenv";

let loaded = false;
export function loadEnv() {
  if (loaded) return;
  dotenv.config();
  loaded = true;
}

export const env = () => ({
  port: Number(process.env.PORT || 8080),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/oldmarket",
  accessSecret: process.env.JWT_ACCESS_SECRET || "dev_access",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh",
});
