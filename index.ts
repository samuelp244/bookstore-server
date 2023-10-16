import express, { Express } from "express";
import cors from "cors";
import "dotenv/config";
import { authRouter, booksDataRouter } from "./src/routes";

const port = process.env.PORT;
const app: Express = express();

app.use(express.json());
app.use(cors());

app.use(authRouter);
app.use(booksDataRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
