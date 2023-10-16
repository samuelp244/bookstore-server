import express, { Express, Request, Response } from "express";
import { authenticate } from "../middleware";
import loadBooksCSVData from "../utils/loadBooksCSVData";

const router = express.Router();

router.get("/api/books", authenticate, async (req: Request, res: Response) => {
  const r = await loadBooksCSVData();
  res.json(r);
});

export { router as booksDataRouter };
