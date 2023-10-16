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
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401);
    const decoded = jwt.verify(token, accessTokenSecret);
    (req as CustomRequest).token = decoded;
    next();
  } catch (err) {
    res.status(401).send("authentication failed");
  }
};
