import mongoose, { Document, Schema, Model } from 'mongoose';

interface ITask {
	taskId: mongoose.Types.ObjectId; // Use mongoose.Types.ObjectId
	title: string;
	description: string;
	dueDate: string;
	status: 'pending' | 'completed';
}

interface IUserTasks {
	userId: string;
	tasks: ITask[];
}

const taskSchema = new Schema<ITask & Document>({
	taskId: {
		type: Schema.Types.ObjectId, // Use mongoose.Types.ObjectId
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	dueDate: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: ['pending', 'completed'],
		required: true,
	},
});

const userTasksSchema = new Schema<IUserTasks & Document>({
	userId: {
		type: String,
		required: true,
		unique: true,
	},
	tasks: [taskSchema], // Use Schema.Types.Array for tasks
});

const UserTasks: Model<IUserTasks & Document> = mongoose.model(
	'UserTasks',
	userTasksSchema
);

export { UserTasks };
