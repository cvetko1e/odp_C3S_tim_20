import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../../Domain/types/JwtPayload";
import { UserRole } from "../../Domain/enums/UserRole";

export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length === 0) {
    next();
    return;
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (decoded.id && (decoded.role === UserRole.USER || decoded.role === UserRole.ADMIN)) {
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      };
    }
  } catch {
    // Invalid token is ignored on public endpoints.
  }

  next();
};
