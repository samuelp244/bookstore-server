import { type Request, type Response } from 'express';
import { UserBooks } from '../models';
import { BookType } from '../types/books.types';
import { type authPayload } from '../types/miscellaneous.types';
import loadBooksCSVData from '../utils/loadBooksCSVData';

interface CustomRequest extends Request {
	token: authPayload;
}

/**
 * Adds a book or multiple books to the user's collection.
 * If the user's collection doesn't exist, it creates one.
 * @param routerReq - The request object containing user data.
 * @param res - The response object to send the HTTP response.
 */
const addBook = async (routerReq: Request, res: Response) => {
	try {
		const req = routerReq as CustomRequest;
		const payload = req.token;
		const bookDataArray = req.body.books;
		let userBooks = await UserBooks.findOne({ userId: payload.userId });

		if (userBooks === null) {
			userBooks = new UserBooks({ userId: payload.userId, books: [] });
		}

		userBooks.books = [...userBooks.books, ...bookDataArray];

		await userBooks.save();

		res.status(201).json({ message: 'Book(s) added successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

/**
 * Retrieves the list of books from the user's collection.
 * @param routerReq - The request object containing user data.
 * @param res - The response object to send the HTTP response.
 */
const getUserBooks = async (routerReq: Request, res: Response) => {
	try {
		const req = routerReq as CustomRequest;
		const payload = req.token;
		const userBooks = await UserBooks.findOne({ userId: payload.userId });

		if (userBooks === null) {
			return res
				.status(200)
				.json({ message: 'No books found for user', books: [] });
		}

		const books = userBooks.books;
		return res
			.status(200)
			.json({ message: 'Books successfully fetched for user', books });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

/**
 * Deletes a book from the user's collection based on the book's ID.
 * @param routerReq - The request object containing user data and the book ID.
 * @param res - The response object to send the HTTP response.
 */
const deleteUserBook = async (routerReq: Request, res: Response) => {
	try {
		const req = routerReq as CustomRequest;
		const payload = req.token;
		const { bookId } = req.params;

		const userBooks = await UserBooks.findOne({ userId: payload.userId });

		if (userBooks === null) {
			return res
				.status(204)
				.json({ message: 'No books found for user', books: [] });
		}
		const bookIndex = userBooks.books.findIndex(
			(book) => book.bookID === bookId
		);

		if (bookIndex === -1) {
			return res
				.status(204)
				.json({ message: 'Book not found in the user collection' });
		}
		const newBooksList = userBooks.books.filter(
			(book) => book.bookID !== bookId
		);

		userBooks.books = newBooksList;

		await userBooks.save();

		res.status(200).json({ message: 'Book deleted successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

let allBooksCache: BookType[] | null = null;

/**
 * Loads all books data into the cache from an external source.
 */
const loadAllBooks = async () => {
	// Load books from the source (e.g., loadBooksCSVData) and store them in allBooksCache.
	allBooksCache = await loadBooksCSVData();
};

/**
 * Retrieves a list of all books with optional filters.
 * @param req - The request object containing filters for the book list.
 * @param res - The response object to send the HTTP response.
 */
const getAllBooksList = async (req: Request, res: Response) => {
	try {
		const { limit, page, searchQuery, sortBy } = req.query;
		const parsedLimit = parseInt(limit as string, 10);
		const parsedPage = parseInt(page as string, 10);
		if (isNaN(parsedLimit) || isNaN(parsedPage)) {
			return res
				.status(400)
				.json({ message: 'Invalid limit or page parameter' });
		}

		if (allBooksCache === null) {
			await loadAllBooks();
		}

		if (allBooksCache === null) {
			return res.status(500).json({ message: 'Failed to load books data' });
		}

		let allBooks = [...allBooksCache]; // Create a copy to avoid mutating the cache.

		if (sortBy === 'ratings' || sortBy === 'release') {
			allBooks.sort((a, b) => {
				if (sortBy === 'ratings') {
					return (
						(parseFloat(b.average_rating) || 0) -
						(parseFloat(a.average_rating) || 0)
					);
				} else {
					return (
						(new Date(b.publication_date).getTime() || 0) -
						(new Date(a.publication_date).getTime() || 0)
					);
				}
			});

			const uniqueBookIDs = new Set();
			allBooks = allBooks.filter((book) => {
				if (!uniqueBookIDs.has(book.bookID)) {
					uniqueBookIDs.add(book.bookID);
					return true;
				}
				return false;
			});
		} else if (sortBy !== undefined) {
			return res.status(400).json({ message: 'Invalid sort parameter' });
		}

		if (searchQuery !== 'undefined' && searchQuery !== undefined) {
			const lowercaseSearchQuery = (searchQuery as string).toLowerCase();
			allBooks = allBooks.filter((book) => {
				const { title, authors, publisher } = book;
				return (
					title.toLowerCase().includes(lowercaseSearchQuery) ||
					authors.toLowerCase().includes(lowercaseSearchQuery) ||
					publisher.toLowerCase().includes(lowercaseSearchQuery)
				);
			});
		}

		const skip = (parsedPage - 1) * parsedLimit;
		const startIndex = skip;
		const endIndex = startIndex + parsedLimit;

		const booksForPage = allBooks.slice(startIndex, endIndex);

		return res.status(200).json({
			message: 'Successfully fetched books',
			books: booksForPage,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).send('Internal Server Error');
	}
};

export const booksController = {
	addBook,
	getUserBooks,
	deleteUserBook,
	getAllBooksList,
};
