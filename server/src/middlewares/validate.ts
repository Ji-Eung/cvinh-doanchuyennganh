import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { badRequest } from "../utils/response.js";

interface Schemas {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const parsed = schemas.body.safeParse(req.body);
        if (!parsed.success)
          return badRequest(
            res,
            "Invalid body",
            parsed.error.flatten().fieldErrors
          );
        (req as any).validatedBody = parsed.data;
      }
      if (schemas.query) {
        const parsed = schemas.query.safeParse(req.query);
        if (!parsed.success)
          return badRequest(
            res,
            "Invalid query",
            parsed.error.flatten().fieldErrors
          );
        (req as any).validatedQuery = parsed.data;
      }
      if (schemas.params) {
        const parsed = schemas.params.safeParse(req.params);
        if (!parsed.success)
          return badRequest(
            res,
            "Invalid params",
            parsed.error.flatten().fieldErrors
          );
        (req as any).validatedParams = parsed.data;
      }
      return next();
    } catch (e) {
      return badRequest(res, "Validation error");
    }
  };
}

declare module "express-serve-static-core" {
  interface Request {
    validatedBody?: any;
    validatedQuery?: any;
    validatedParams?: any;
  }
}
