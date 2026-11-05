import { Request, Response } from "express";

export function getExamplePost(_req: Request, res: Response) {
  res.render("postExample.html");
}
