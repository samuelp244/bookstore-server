import bcrypt from 'bcrypt';

/**
 * Generate a hash for a given password.
 * @param {string | Buffer} password - The password to be hashed.
 * @returns {Promise<string>} A Promise that resolves with the hashed password.
 */
const generateHash = async (password: string | Buffer): Promise<string> => {
	const saltRounds = 10;
	try {
		const hash = await bcrypt.hash(password, saltRounds);
		return hash;
	} catch (error) {
		console.log(error);
		throw error;
	}
};

/**
 * Verify a password against a stored hash.
 * @param {string | Buffer} password - The password to be verified.
 * @param {string} hash - The stored hash to compare against.
 * @returns {Promise<boolean>} A Promise that resolves with a boolean indicating whether the password matches the hash.
 */
const verifyHash = async (
	password: string | Buffer,
	hash: string
): Promise<boolean> => {
	try {
		const isMatch = await bcrypt.compare(password, hash);
		return isMatch;
	} catch (error) {
		console.log(error);
		throw error;
	}
};

export { generateHash, verifyHash };
