import express, { Express, Request, Response } from "express";
import loadBooksCSVData from "../utils/loadBooksCSVData";

const router = express.Router();

router.get("/api/books", async (req: Request, res: Response) => {
  const r = await loadBooksCSVData()
  res.json(r);
});

export { router as booksDataRouter };
