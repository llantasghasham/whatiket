import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";

const isAuthCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("HIT isAuthCompany | ORIGINAL URL:", req.originalUrl, "| req.query:", JSON.stringify(req.query), "| req.headers.authorization:", req.headers.authorization ?? "MISSING");
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("ERR_SESSION_EXPIRED THROWN FROM isAuthCompany.ts LINE", 15);
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");
  
  try {
    const getToken = process.env.COMPANY_TOKEN;
    if (!getToken) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    if (getToken !== token) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }
  } catch (err) {
    throw new AppError(
      "Invalid token. We'll try to assign a new one on next request",
      403
    );
  }

  return next();
};

export default isAuthCompany;
