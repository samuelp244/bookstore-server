import express, { Request, Response } from 'express';
import { authController } from '../controllers';

const router = express.Router();

router.post('/api/auth/register', authController.registerUser);

router.post('/api/auth/login', authController.loginUser);

router.get('/api/auth/renewaccesstoken', authController.renewAccessToken);

router.post('/api/auth/signout', authController.signOut);

export { router as authRouter };
