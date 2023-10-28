import { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { UserTasks } from '../models';
import { type authPayload } from '../types/miscellaneous.types';

interface CustomRequest extends Request {
	token: authPayload;
}

const addTask = async (routerReq: Request, res: Response) => {
	try {
		const req = routerReq as CustomRequest;
		const { title, description, dueDate, status } = req.body;
		const payload = req.token;
		let userTasks = await UserTasks.findOne({ userId: payload.userId });

		if (userTasks === null) {
			userTasks = new UserTasks({ userId: payload.userId, tasks: [] });
		}
		if (status !== 'pending' && status !== 'completed') {
			return res
				.status(400)
				.json({
					message: 'Invalid status. Status must be "pending" or "completed".',
				});
		}
		const newTask = {
			taskId: new mongoose.Types.ObjectId(),
			title,
			description,
			dueDate,
			status,
		};

		userTasks.tasks.push(newTask);

		await userTasks.save();

		res.status(201).json({ message: 'Task added successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

const getUserTasks = async (routerReq: Request, res: Response) => {
	try {
		const req = routerReq as CustomRequest;
		const payload = req.token;
		const userTasks = await UserTasks.findOne({ userId: payload.userId });

		if (userTasks === null) {
			return res
				.status(200)
				.json({ message: 'No tasks found for user', tasks: [] });
		}

		const tasks = userTasks.tasks;
		return res
			.status(200)
			.json({ message: 'Tasks successfully fetched for user', tasks });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

const deleteUserTask = async (routerReq: Request, res: Response) => {
	try {
		const req = routerReq as CustomRequest;
		const payload = req.token;
		const { taskId } = req.params;

		const userTasks = await UserTasks.findOne({ userId: payload.userId });

		if (userTasks === null) {
			return res.status(204).json({ message: 'No Tasks found for user' });
		}
		const taskIndex = userTasks.tasks.findIndex(
			(task) => task.taskId.toString() === taskId
		);

		if (taskIndex === -1) {
			return res
				.status(204)
				.json({ message: 'task not found in the user collection' });
		}
		const newTasksList = userTasks.tasks.filter(
			(task) => task.taskId.toString() !== taskId
		);
		console.log(taskIndex);
		userTasks.tasks = newTasksList;

		await userTasks.save();

		res
			.status(200)
			.json({ message: 'Book deleted successfully', tasks: userTasks });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

const editTask = async (routerReq: Request, res: Response) => {
	try {
		const req = routerReq as CustomRequest;
		const payload = req.token;
		const { taskId, title, description, dueDate, status } = req.body;

		if (!taskId || !title || !description || !dueDate || !status) {
			return res.status(400).json({ message: 'Missing required parameters' });
		}

		const userTasks = await UserTasks.findOne({ userId: payload.userId });

		if (userTasks === null) {
			return res.status(204).json({ message: 'No Tasks found for user' });
		}

		const taskIndex = userTasks.tasks.findIndex(
			(task) => task.taskId.toString() === taskId
		);

		if (taskIndex === -1) {
			return res
				.status(204)
				.json({ message: 'Task not found in the user collection' });
		}

		// Update the task with the new details
		userTasks.tasks[taskIndex].title = title;
		userTasks.tasks[taskIndex].description = description;
		userTasks.tasks[taskIndex].dueDate = dueDate;
		userTasks.tasks[taskIndex].status = status;

		await userTasks.save();

		res.status(200).json({
			message: 'Task updated successfully',
			task: userTasks.tasks[taskIndex],
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
};

export const tasksController = {
	addTask,
	getUserTasks,
	deleteUserTask,
	editTask,
};
