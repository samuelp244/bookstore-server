import mongoose, { Document, Model } from 'mongoose';

interface IUser extends Document {
	username: string;
	email: string;
	password: string;
	role: 'user' | 'admin';
}

const userSchema = new mongoose.Schema<IUser>({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user',
	},
});

const User: Model<IUser> = mongoose.model('User', userSchema);

export { User };
