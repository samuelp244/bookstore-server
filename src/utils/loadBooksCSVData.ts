import fs from 'fs';
import csvParser from 'csv-parser';
import { BookType } from '../types/books.types';

const csvData: BookType[] = [];

export function loadBooksCSVData(): Promise<BookType[]> {
	return new Promise((resolve, reject) => {
		fs.createReadStream('./src/data/books.csv')
			.pipe(csvParser())
			.on('data', (row) => {
				csvData.push(row);
			})
			.on('end', () => {
				resolve(csvData);
			})
			.on('error', (error) => {
				console.error('Error loading CSV data:', error);
				reject(error);
			});
	});
}

export default loadBooksCSVData;
