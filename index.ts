import express, { Express } from "express";
import cors from "cors";
import "dotenv/config";
import { authRouter, booksDataRouter } from "./src/routes";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

const mongodbURI = process.env.MONGO_URI ?? "";
const port = process.env.PORT;
const app: Express = express();

mongoose.connect(mongodbURI);

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to bookstore server");
});

app.use(authRouter);
app.use(booksDataRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
