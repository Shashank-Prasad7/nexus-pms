import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Run parallel counts for optimal performance
    const [
      totalProjects,
      projectsInProgress,
      projectsCompleted,
      projectsNotStarted,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      recentProjects,
      upcomingTasks,
    ] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.project.count({ where: { userId, status: 'NOT_STARTED' } }),
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.task.count({ where: { userId, status: 'PENDING' } }),
      prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          _count: { select: { tasks: true } },
          tasks: { select: { status: true } },
        },
      }),
      prisma.task.findMany({
        where: {
          userId,
          status: { not: 'COMPLETED' },
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        take: 5,
        include: {
          project: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Format recent projects with task completion metrics
    const formattedRecentProjects = recentProjects.map((p) => {
      const taskTotal = p.tasks.length;
      const done = p.tasks.filter((t) => t.status === 'COMPLETED').length;
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        updatedAt: p.updatedAt,
        totalTasks: taskTotal,
        completedTasks: done,
        progress: taskTotal > 0 ? Math.round((done / taskTotal) * 100) : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalProjects,
          projectsInProgress,
          projectsCompleted,
          projectsNotStarted,
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          completionRate:
            totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        recentProjects: formattedRecentProjects,
        upcomingTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};
