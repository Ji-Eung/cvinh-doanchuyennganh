import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

let seeded = false;
export async function ensureCategorySeed() {
  if (seeded) return;
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany([
      { name: "Điện thoại", slug: "dien-thoai" },
      { name: "Laptop", slug: "laptop" },
      { name: "Đồ gia dụng", slug: "do-gia-dung" },
      { name: "Nội thất", slug: "noi-that" },
    ]);
    // eslint-disable-next-line no-console
    console.log("[seed] Categories inserted");
  }
  seeded = true;
}
