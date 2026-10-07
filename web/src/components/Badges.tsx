import React from 'react';
import { ProjectStatus, TaskPriority, TaskStatus } from '../types';

export const StatusBadge: React.FC<{ status: ProjectStatus | TaskStatus }> = ({ status }) => {
  switch (status) {
    case 'NOT_STARTED':
      return <span className="badge badge-not-started">● Not Started</span>;
    case 'IN_PROGRESS':
      return <span className="badge badge-in-progress">● In Progress</span>;
    case 'COMPLETED':
      return <span className="badge badge-completed">✓ Completed</span>;
    case 'PENDING':
      return <span className="badge badge-pending">⏳ Pending</span>;
    default:
      return <span className="badge badge-not-started">{status}</span>;
  }
};

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  switch (priority) {
    case 'HIGH':
      return <span className="badge badge-priority-high">▲ High</span>;
    case 'MEDIUM':
      return <span className="badge badge-priority-medium">■ Medium</span>;
    case 'LOW':
      return <span className="badge badge-priority-low">▼ Low</span>;
    default:
      return <span className="badge badge-priority-medium">{priority}</span>;
  }
};
