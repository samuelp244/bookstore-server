import { Request, Response } from "express";
import { User } from "../models";
import { generateHash, verifyHash } from "../utils/passwords.utils";
import jwt, { JwtPayload } from "jsonwebtoken";
import { authPayload } from "../types/miscellaneous.types";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET ?? "";
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET ?? "";

const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const userDetails = await User.findOne({ username });
    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await verifyHash(password, userDetails.password);
    if (isPasswordValid) {
      const payload = {
        username: userDetails.username,
        role: userDetails.role,
      };
      const accessToken = jwt.sign(payload, accessTokenSecret, {
        expiresIn: "15m",
      });
      const refreshToken = jwt.sign(payload, refreshTokenSecret, {
        expiresIn: "7d",
      });

      res.cookie("refresh_token", refreshToken, { httpOnly: true });
      res.status(200).json({ message: "Login successful", accessToken });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
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

const renewAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
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
      return res.status(404).json({ message: "User not found" });
    }
    const payload = {
      username: userDetails.username,
      role: userDetails.role,
    };
    const accessToken = jwt.sign(payload, accessTokenSecret, {
      expiresIn: "15m",
    });
    res.status(200).json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

export const authController = { loginUser, registerUser, renewAccessToken };
