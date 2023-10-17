import mongoose, { Document, Schema, Model } from 'mongoose';

interface IBook {
	bookID: string;
	title: string;
	authors: string;
	average_rating: string;
	isbn: string;
	isbn13: string;
	language_code: string;
	num_pages: string;
	ratings_count: string;
	text_reviews_count: string;
	publication_date: string;
	publisher: string;
	price: string;
}

interface IUserBook {
	userId: string;
	books: IBook[];
}

const userBookSchema = new Schema<IUserBook & Document>({
	userId: {
		type: String,
		required: true,
		unique: true,
	},
	books: [
		{
			bookID: { type: String },
			title: { type: String },
			authors: { type: String },
			average_rating: { type: String },
			isbn: { type: String },
			isbn13: { type: String },
			language_code: { type: String },
			num_pages: { type: String },
			ratings_count: { type: String },
			text_reviews_count: { type: String },
			publication_date: { type: String },
			publisher: { type: String },
			price: { type: String },
		},
	],
});

const UserBooks: Model<IUserBook & Document> = mongoose.model(
	'UserBookCollection',
	userBookSchema
);

export { UserBooks };
