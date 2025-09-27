import fs from "fs";
import path from "path";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import crypto from "crypto";

const uploadRoot = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (
    _req: Express.Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, uploadRoot);
  },
  filename: function (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    const ext = path.extname(file.originalname) || "";
    const name = crypto.randomBytes(16).toString("hex") + ext;
    cb(null, name);
  },
});

export const imageFileFilter: multer.Options["fileFilter"] = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!/^image\//.test(file.mimetype))
    return cb(new Error("Invalid file type"));
  cb(null, true);
};

export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Additional safety: verify magic bytes after multer processed (for future pipeline)
export async function verifyImageMagic(buffer: Buffer) {
  try {
    const type = await fileTypeFromBuffer(buffer);
    if (!type) return false;
    return type.mime.startsWith("image/");
  } catch {
    return false;
  }
}

export function extractStoredFilename(urlOrPath: string) {
  // Accept already just filename
  if (/^[a-f0-9]{32}\.[a-z0-9]+$/i.test(urlOrPath)) return urlOrPath;
  const parts = urlOrPath.split(/[/\\]/);
  return parts[parts.length - 1];
}

export function publicUploadPath(filename: string) {
  return "/uploads/" + filename;
}

export function absoluteUploadUrl(
  req: import("express").Request,
  filename: string
) {
  const host = req.get("x-forwarded-host") || req.get("host");
  const proto = (req.get("x-forwarded-proto") || req.protocol || "http").split(
    ","
  )[0];
  return `${proto}://${host}${publicUploadPath(filename)}`;
}
