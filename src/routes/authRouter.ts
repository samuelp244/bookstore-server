import express, { Request, Response } from "express";
import { authController } from "../controllers";

const router = express.Router();

router.post("/api/auth/register", authController.registerUser);

router.post("/api/auth/login", authController.loginUser);

router.post('/api/auth/renewaccesstoken', authController.renewAccessToken)

export { router as authRouter };
