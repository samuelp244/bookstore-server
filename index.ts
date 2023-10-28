import express, { Express } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { authRouter, booksDataRouter, tasksDataRouter } from './src/routes';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

// Load environment variables
const mongodbURI = process.env.MONGO_URI ?? '';
const frontendUrl = process.env.FRONT_END_URL ?? '';
const port = process.env.PORT;

const app: Express = express();

// Connect to MongoDB using the URI from environment variables
mongoose.connect(mongodbURI);

// Configure CORS options to allow requests from specific origins
const corsOptions = {
	origin: ['http://localhost:3000', frontendUrl],
	credentials: true,
};

// Configure middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors(corsOptions)); // Enable CORS with the specified options
app.use(cookieParser()); // Parse cookies in the request

// Set up a basic middleware for handling CORS headers
app.all('/', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With');
	next();
});

// Define a simple welcome message route
app.get('/api', (req, res) => {
	res.send('Welcome to the bookstore server');
});

// Mount your route handlers for authentication and book data
app.use(authRouter);
app.use(booksDataRouter);

app.use(tasksDataRouter);

// Define a catch-all route for handling 404 errors
app.use((req, res, next) => {
	res.status(404).json({ message: 'Route not found' });
});

// Start the server and listen on the specified port
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
