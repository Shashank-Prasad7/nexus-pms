import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';

export const getProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { search, status, sortBy = 'createdAt', order = 'desc' } = req.query as {
      search?: string;
      status?: string;
      sortBy?: string;
      order?: 'asc' | 'desc';
    };

    const whereClause: any = { userId };

    if (search && search.trim()) {
      whereClause.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
    });

    // Augment with task stats for quick UI visualization
    const formatted = projects.map((project) => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const { tasks, ...rest } = project;
      return {
        ...rest,
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          pending: totalTasks - completedTasks,
          progressPercentage: progress,
        },
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId, // Strict ownership check
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to view it.',
      });
      return;
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        ...project,
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          pending: totalTasks - completedTasks,
          progressPercentage: progress,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, description, status, startDate, endDate } = req.body;

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        status: status || 'NOT_STARTED',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: {
        ...project,
        taskStats: {
          total: 0,
          completed: 0,
          pending: 0,
          progressPercentage: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, description, status, startDate, endDate } = req.body;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to edit it.',
      });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to delete it.',
      });
      return;
    }

    await prisma.project.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
