import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../../Domain/types/JwtPayload";
import { UserRole } from "../../Domain/enums/UserRole";

declare global {
  namespace Express {
    interface Request { user?: JwtPayload; }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length === 0) {
    res.status(500).json({ success: false, message: "JWT secret is not configured" });
    return;
  }

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) { res.status(401).json({ success: false, message: "Missing token" }); return; }
  const token = header.slice(7);
  const decoded = (() => {
    try { return jwt.verify(token, secret) as JwtPayload; }
    catch { return { id: 0, username: "", role: UserRole.USER }; }
  })();
  if (decoded.id === 0 || (decoded.role !== UserRole.USER && decoded.role !== UserRole.ADMIN)) {
    res.status(401).json({ success: false, message: "Invalid token" });
    return;
  }
  req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
  next();
};
