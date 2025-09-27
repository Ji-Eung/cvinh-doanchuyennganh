import { Router, Request, Response } from "express";
import { auth } from "../middlewares/auth.js";
import {
  uploadImage,
  publicUploadPath,
  verifyImageMagic,
} from "../utils/uploader.js";
import { ok, badRequest } from "../utils/response.js";

const router = Router();

router.post("/image", auth, (req: Request, res: Response) => {
  const handler = uploadImage.single("image");
  handler(req, res, async (err: any) => {
    if (err) {
      return badRequest(res, err.message || "Upload failed");
    }
    if (!req.file) return badRequest(res, "No file uploaded");
    const file = req.file as Express.Multer.File;
    // Magic bytes validation (best-effort) reading a small chunk
    try {
      const buf = file.buffer || undefined; // diskStorage does not keep buffer by default
      if (buf) {
        try {
          const okMagic = await verifyImageMagic(buf);
          if (!okMagic) return badRequest(res, "Invalid image content");
        } catch {}
      }
    } catch {}
    return ok(res, {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: publicUploadPath(file.filename),
    });
  });
});

export default router;
