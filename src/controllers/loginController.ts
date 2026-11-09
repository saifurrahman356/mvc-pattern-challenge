import { Request, Response } from "express";

export function showLoginPage(_req: Request, res: Response) {
  return res.render("login.html");
}

export function login(req: Request, res: Response) {
  const { password } = req.body;

  console.log("Attempted login with password:", password);
  console.log("Admin password from environment:", process.env.ADMIN_PASSWORD);

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).render("login.html", {
      error: "Invalid password. Please try again.",
    });
  }

  res.cookie("admin", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  return res.redirect("/admin");
}
