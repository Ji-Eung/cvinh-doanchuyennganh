import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import {
  uploadImage,
  publicUploadPath,
  absoluteUploadUrl,
} from "../utils/uploader.js";
import { ok, badRequest } from "../utils/response.js";

const router = Router();

// Single image upload
router.post("/image", auth, (req: any, res: any, next: any) => {
  const handler = uploadImage.single("image");
  handler(req, res, (err: any) => {
    if (err) {
      return badRequest(res, err.message || "Upload failed");
    }
    if (!req.file) return badRequest(res, "No file uploaded");
    const file = req.file;
    return ok(res, {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: publicUploadPath(file.filename),
      absoluteUrl: absoluteUploadUrl(req, file.filename),
    });
  });
});

export default router;
