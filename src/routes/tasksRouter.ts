import express from 'express';
import { tasksController } from '../controllers';
import { authenticate } from '../middleware';

const router = express.Router();

router.get('/api/tasks/list', authenticate, tasksController.getUserTasks);

router.post('/api/tasks/add', authenticate, tasksController.addTask);

router.patch('/api/tasks/edit', authenticate, tasksController.editTask);

router.delete(
	'/api/tasks/delete/:taskId',
	authenticate,
	tasksController.deleteUserTask
);

export { router as tasksDataRouter };
