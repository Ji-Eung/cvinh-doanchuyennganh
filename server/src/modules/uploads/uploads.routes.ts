import { Router, Request, Response } from "express";
import { auth } from "../../middlewares/auth.js";
import { uploadImage, publicUploadPath } from "../../utils/uploader.js";
import { ok, badRequest } from "../../utils/response.js";

const router = Router();

router.post("/image", auth, (req: Request, res: Response) => {
  const handler = uploadImage.single("image");
  handler(req, res, (err: any) => {
    if (err) {
      return badRequest(res, err.message || "Upload failed");
    }
    if (!req.file) return badRequest(res, "No file uploaded");
    const file = req.file as Express.Multer.File;
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
