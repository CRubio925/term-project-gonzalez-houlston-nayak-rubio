//make sure user is logged in befroe allowing access to certain routes
import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user) {
    //stop if unauthorized
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
