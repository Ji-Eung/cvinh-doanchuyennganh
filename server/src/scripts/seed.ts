import { loadEnv } from "../config/env.js";
import { connectDb } from "../config/database.js";
import { ensureCategorySeed } from "../modules/categories/category.model.js";
import { User } from "../modules/users/user.model.js";
import { hashPassword } from "../utils/password.js";

async function main() {
  loadEnv();
  await connectDb();
  await ensureCategorySeed();
  // create admin if not exists
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const exists = await User.findOne({ email: adminEmail });
  if (!exists) {
    const passwordHash = await hashPassword(
      process.env.ADMIN_PASSWORD || "admin123"
    );
    await User.create({
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    });
    console.log(`[seed] Admin user created: ${adminEmail}`);
  }
  console.log("[seed] Done");
  process.exit(0);
}

main().catch((e) => {
  console.error("[seed] Failed", e);
  process.exit(1);
});
