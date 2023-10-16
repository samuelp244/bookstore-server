import { Request, Response } from "express";
import { User } from "../models";
import { generateHash, verifyHash } from "../utils/passwords.utils";

const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already in use" });
    }

    const passwordHash = await generateHash(password);
    const newUser = new User({
      username,
      email,
      password: passwordHash,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const userDetails = await User.findOne({ username });
    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await verifyHash(password, userDetails.password);
    if (isPasswordValid) {
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
export const authController = { loginUser, registerUser };
