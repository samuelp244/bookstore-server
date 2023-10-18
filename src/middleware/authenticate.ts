import express, { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET ?? '';

// Define a custom Request type that includes the 'token' property.
export interface CustomRequest extends Request {
	token: string | JwtPayload;
}

/**
 * Middleware for authentication and authorization.
 * Checks the provided access token and adds the decoded token to the request for authorized routes.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Extract the access token from the 'Authorization' header.
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) {
		// If no token is provided, return an unauthorized response (status 401).
		return res.status(401).json({ error: 'Unauthorized' });
	}

	// Verify the access token with the provided secret.
	jwt.verify(token, accessTokenSecret, (err, decoded) => {
		if (err || decoded === undefined) {
			// If verification fails, return an unauthorized response (status 401).
			return res.status(401).json({ error: 'Unauthorized' });
		}

		// Add the decoded token to the request as 'token' for use in authorized routes.
		(req as CustomRequest).token = decoded;
		next();
	});
};
