import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from '../validators/task.validator';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get('/', validateRequest(taskQuerySchema), getTasks);
router.get('/:id', getTaskById);
router.post('/', validateRequest(createTaskSchema), createTask);
router.put('/:id', validateRequest(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
