import { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongoose';

export interface authPayload extends JwtPayload {
	username: string;
	role: 'user' | 'admin';
	userId: ObjectId;
}
