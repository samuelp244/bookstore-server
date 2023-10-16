import express from "express";
import { booksController } from "../controllers";
import { authenticate } from "../middleware";

const router = express.Router();

router.get("/api/books/list", authenticate, booksController.getAllBooksList);

router.get("/api/books/user/list", authenticate, booksController.getUserBooks);

router.post("/api/books/user/add", authenticate, booksController.addBook);

router.delete(
  "/api/books/user/delete/:bookId",
  authenticate,
  booksController.deleteUserBook
);

export { router as booksDataRouter };
