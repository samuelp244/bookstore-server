import { Request, Response } from 'express';
import { User } from '../models';
import { generateHash, verifyHash } from '../utils/passwords.utils';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { authPayload } from '../types/miscellaneous.types';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET ?? '';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET ?? '';
const cookieProperties = {
	path: '/',
	sameSite: false,
	httpOnly: true,
	// domain: 'localhost',
};
const loginUser = async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body;
		const userDetails = await User.findOne({ username });
		if (!userDetails) {
			return res.status(404).json({ message: 'User not found' });
		}
		const isPasswordValid = await verifyHash(password, userDetails.password);
		if (isPasswordValid) {
			const payload = {
				username: userDetails.username,
				role: userDetails.role,
				userId: userDetails._id,
			};
			const accessToken = jwt.sign(payload, accessTokenSecret, {
				expiresIn: '15m',
			});
			const refreshToken = jwt.sign(payload, refreshTokenSecret, {
				expiresIn: '7d',
			});

			res.cookie('refresh_token', refreshToken, cookieProperties);
			res
				.status(200)
				.json({ message: 'Login successful', accessToken, userDetails });
		} else {
			res.status(403).json({ message: 'Invalid username or password' });
		}
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

const registerUser = async (req: Request, res: Response) => {
	try {
		const { username, email, password } = req.body;
		const existingUser = await User.findOne({
			$or: [{ username }, { email }],
		});

		if (existingUser) {
			return res
				.status(400)
				.json({ message: 'Username or email already in use' });
		}

		const passwordHash = await generateHash(password);
		const newUser = new User({
			username,
			email,
			password: passwordHash,
		});

		await newUser.save();
		const payload = {
			username: newUser.username,
			role: newUser.role,
			userId: newUser._id,
		};
		const accessToken = jwt.sign(payload, accessTokenSecret, {
			expiresIn: '15m',
		});
		const refreshToken = jwt.sign(payload, refreshTokenSecret, {
			expiresIn: '7d',
		});

		res.cookie('refresh_token', refreshToken, cookieProperties);
		res
			.status(201)
			.json({
				message: 'User registered successfully',
				accessToken,
				userDetails: payload,
			});
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

const renewAccessToken = async (req: Request, res: Response) => {
	const refreshToken = req.cookies.refresh_token;

	if (!refreshToken) {
		return res.status(401).json({ message: 'No refresh token provided' });
	}
	try {
		const refreshTokenDecoded = jwt.verify(
			refreshToken,
			refreshTokenSecret
		) as authPayload;
		const userDetails = await User.findOne({
			username: refreshTokenDecoded.username,
		});
		if (!userDetails) {
			return res.status(404).json({ message: 'User not found' });
		}
		const payload = {
			username: userDetails.username,
			role: userDetails.role,
			userId: userDetails._id,
			email: userDetails.email,
		};
		const accessToken = jwt.sign(payload, accessTokenSecret, {
			expiresIn: '15m',
		});
		res.status(200).json({ accessToken, userDetails: payload });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

const signOut = (req: Request, res: Response) => {
	try {
		res.clearCookie('refresh_token', cookieProperties);

		res.status(200).json({ message: 'Signout successful' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

export const authController = {
	loginUser,
	registerUser,
	renewAccessToken,
	signOut,
};
