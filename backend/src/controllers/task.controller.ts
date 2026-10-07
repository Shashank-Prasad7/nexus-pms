import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';

export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      projectId,
      search,
      status,
      priority,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query as {
      projectId?: string;
      search?: string;
      status?: string;
      priority?: string;
      sortBy?: string;
      order?: 'asc' | 'desc';
    };

    const whereClause: any = { userId };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (search && search.trim()) {
      whereClause.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (priority && priority !== 'ALL') {
      whereClause.priority = priority;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
    });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id, userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to view it.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, description, priority, status, dueDate, projectId } = req.body;

    // Verify project exists and belongs to the user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Associated project not found or you do not have permission to add tasks to it.',
      });
      return;
    }

    const task = await prisma.task.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, description, priority, status, dueDate, projectId } = req.body;

    // Verify task exists and belongs to the user
    const existing = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to edit it.',
      });
      return;
    }

    // If changing project, verify target project belongs to the user
    if (projectId && projectId !== existing.projectId) {
      const targetProject = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });

      if (!targetProject) {
        res.status(400).json({
          success: false,
          message: 'Target project not found or does not belong to you.',
        });
        return;
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (projectId !== undefined) updateData.projectId = projectId;

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify task ownership
    const existing = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it.',
      });
      return;
    }

    await prisma.task.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
