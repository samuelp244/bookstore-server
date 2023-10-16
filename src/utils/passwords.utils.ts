import bcrypt from "bcrypt";

const generateHash = async (password: string | Buffer) => {
  const saltRounds = 10;
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const verifyHash = async (password: string | Buffer, hash: string) => {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export { generateHash, verifyHash };
