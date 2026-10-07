import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
} from '../validators/project.validator';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.get('/', validateRequest(projectQuerySchema), getProjects);
router.get('/:id', getProjectById);
router.post('/', validateRequest(createProjectSchema), createProject);
router.put('/:id', validateRequest(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

export default router;
