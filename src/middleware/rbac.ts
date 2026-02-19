import { Request, Response, NextFunction } from "express";
import { requireRole } from "./auth";

// Re-export a simple admin-only middleware and a generic role checker
export const ensureAdmin = requireRole("ADMIN");

export function ensureRoles(...roles: string[]) {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Missing user" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

export default {
  ensureAdmin,
  ensureRoles,
};
