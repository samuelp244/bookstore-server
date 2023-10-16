import express, { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET ?? "";
export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, accessTokenSecret, (err, decoded) => {
    if (err || decoded === undefined) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    (req as CustomRequest).token = decoded;
    next();
  });
};
