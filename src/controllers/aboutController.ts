import { Request, Response } from "express";

export function getAboutPage(_req: Request, res: Response) {
  res.render("about.html");
}
