import fs from 'fs';
import csvParser from 'csv-parser';
import { BookType } from '../types/books.types';

// An array to store the parsed CSV data.
const csvData: BookType[] = [];

/**
 * Loads book data from a CSV file and returns a Promise that resolves with the data.
 * @returns {Promise<BookType[]>} A Promise that resolves with an array of BookType objects.
 */
export function loadBooksCSVData(): Promise<BookType[]> {
	return new Promise((resolve, reject) => {
		// Create a readable stream for the books.csv file.
		fs.createReadStream('./src/data/books.csv')
			// Pipe the stream through the CSV parser.
			.pipe(csvParser())
			.on('data', (row) => {
				// Add each parsed row to the csvData array.
				csvData.push(row);
			})
			.on('end', () => {
				// Resolve the Promise with the parsed data when the stream ends.
				resolve(csvData);
			})
			.on('error', (error) => {
				// Handle errors, log the error message, and reject the Promise.
				console.error('Error loading CSV data:', error);
				reject(error);
			});
	});
}

export default loadBooksCSVData;
