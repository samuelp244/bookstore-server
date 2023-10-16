import { JwtPayload } from "jsonwebtoken";

export interface authPayload extends JwtPayload {
  username: string;
  role: "user" | "admin";
}