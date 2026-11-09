import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminCookie = req.cookies.admin;

  if (adminCookie !== "true") {
    return res.redirect("/login");
  }

  next();
}
