import { Request, Response, NextFunction } from "express";

export function basicAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Basic ")) {
    return unauthorized(res);
  }

  const encodedCredentials = authorization.split(" ")[1];

  const decodedCredentials = Buffer.from(encodedCredentials, "base64").toString(
    "utf-8",
  );

  const separatorIndex = decodedCredentials.indexOf(":");

  if (separatorIndex === -1) {
    return unauthorized(res);
  }

  const username = decodedCredentials.slice(0, separatorIndex);
  const password = decodedCredentials.slice(separatorIndex + 1);

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (username !== validUsername || password !== validPassword) {
    return unauthorized(res);
  }

  next();
}

function unauthorized(res: Response) {
  res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area"');
  return res.status(401).send("Authentication required");
}
