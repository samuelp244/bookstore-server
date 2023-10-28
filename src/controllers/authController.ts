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

/**
 * Handles user login by validating credentials and returning access and refresh tokens.
 * @param req - The request object containing user credentials.
 * @param res - The response object to send the HTTP response.
 */
const loginUser = async (req: Request, res: Response) => {
	try {
		const { username, password, client } = req.body;
		const userDetails = await User.findOne({ username });
		if (!userDetails) {
			return res.status(404).json({ message: 'User not found' });
		}
		const isPasswordValid = await verifyHash(password, userDetails.password);
		if (isPasswordValid) {
			const payload = {
				username: userDetails.username,
				role: userDetails.role,
				email: userDetails.email,
				userId: userDetails._id,
			};
			const accessToken = jwt.sign(payload, accessTokenSecret, {
				expiresIn: '15m',
			});
			const refreshToken = jwt.sign(payload, refreshTokenSecret, {
				expiresIn: '7d',
			});
			if (client === 'app') {
				return res.status(200).json({
					message: 'Login successful',
					accessToken,
					refreshToken,
					payload,
				});
			}
			res.cookie('refresh_token', refreshToken, cookieProperties);
			return res
				.status(200)
				.json({ message: 'Login successful', accessToken, payload });
		} else {
			res.status(403).json({ message: 'Invalid username or password' });
		}
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

/**
 * Registers a new user, hashing their password, and returning access and refresh tokens.
 * @param req - The request object containing user registration data.
 * @param res - The response object to send the HTTP response.
 */
const registerUser = async (req: Request, res: Response) => {
	try {
		const { username, email, password, client } = req.body;
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
		if (client === 'app') {
			return res.status(201).json({
				message: 'User registered successfully',
				accessToken,
				refreshToken,
				userDetails: payload,
			});
		}
		res.cookie('refresh_token', refreshToken, cookieProperties);
		return res.status(201).json({
			message: 'User registered successfully',
			accessToken,
			userDetails: payload,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

/**
 * Renews the access token using a valid refresh token.
 * @param req - The request object containing the refresh token.
 * @param res - The response object to send the HTTP response.
 */
const renewAccessToken = async (req: Request, res: Response) => {
	const client = req.query.client;
	if (client === 'app') {
		const refreshToken = req.query.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: 'No refresh token provided' });
		}
		try {
			const refreshTokenDecoded = jwt.verify(
				refreshToken as string,
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
	} else {
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
	}
};

/**
 * Clears the refresh token cookie to sign the user out.
 * @param req - The request object.
 * @param res - The response object to send the HTTP response.
 */
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
