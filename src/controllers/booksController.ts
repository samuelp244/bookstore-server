import { type Request, type Response } from 'express';
import { UserBooks } from '../models';
import { BookType } from '../types/books.types';
import { type authPayload } from '../types/miscellaneous.types';
import loadBooksCSVData from '../utils/loadBooksCSVData';

interface CustomRequest extends Request {
	token: authPayload;
}

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
			.json({ message: 'books successfully fetched for user', books });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

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

		let allBooks = await loadBooksCSVData();

		if (sortBy !== undefined) {
			if (sortBy === 'ratings' || sortBy === 'release') {
				const sortedBooks = [...allBooks];
				sortedBooks.sort((a, b) => {
					if (sortBy === 'ratings') {
						const ratingA = parseFloat(a.average_rating) || 0;
						const ratingB = parseFloat(b.average_rating) || 0;
						return ratingB - ratingA;
					} else if (sortBy === 'release') {
						const dateA = new Date(a.publication_date).getTime() || 0;
						const dateB = new Date(b.publication_date).getTime() || 0;
						return dateB - dateA;
					}
					return 0;
				});
				allBooks = sortedBooks;
			} else {
				return res.status(400).json({ message: 'Invalid sort parameter' });
			}
		}

		if (searchQuery !== undefined && searchQuery !== '') {
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

		const uniqueBookIDs = new Set();
		allBooks = allBooks.filter((book) => {
			if (!uniqueBookIDs.has(book.bookID)) {
				uniqueBookIDs.add(book.bookID);
				return true;
			}
			return false;
		});

		const booksForPage = allBooks.slice(startIndex, endIndex);

		return res.status(200).json({
			message: 'successfully fetched books',
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
