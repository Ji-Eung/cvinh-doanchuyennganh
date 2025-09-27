import { Response } from "express";

export function ok(res: Response, data?: unknown, meta?: any) {
  return res.json({ success: true, data, meta });
}
export function created(res: Response, data?: unknown) {
  return res.status(201).json({ success: true, data });
}
export function badRequest(
  res: Response,
  message = "Bad Request",
  errors?: any
) {
  return res.status(400).json({ success: false, message, errors });
}
export function unauthorized(res: Response, message = "Unauthorized") {
  return res.status(401).json({ success: false, message });
}
export function forbidden(res: Response, message = "Forbidden") {
  return res.status(403).json({ success: false, message });
}
export function notFound(res: Response, message = "Not Found") {
  return res.status(404).json({ success: false, message });
}
export function conflict(res: Response, message = "Conflict") {
  return res.status(409).json({ success: false, message });
}
export function serverError(res: Response, message = "Internal Server Error") {
  return res.status(500).json({ success: false, message });
}
