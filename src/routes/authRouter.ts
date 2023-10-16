import express, { Request, Response } from "express";
import { authController } from "../controllers";

const router = express.Router();

router.get("/api/auth/register", authController.registerUser);

router.get("/api/auth/login", authController.loginUser);

export { router as authRouter };
