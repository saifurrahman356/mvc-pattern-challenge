import { Request, Response } from "express";

export function showContactPage(_req: Request, res: Response) {
  res.render("contact.html");
}
