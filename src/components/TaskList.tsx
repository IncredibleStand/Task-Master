'use client';

import { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskList({ tasks, onToggleStatus, onDeleteTask }: TaskListProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No tasks yet. Add a task to get started!
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {sortedTasks.map((task) => {
        const priorityColors = {
          low: 'bg-green-100 text-green-800',
          medium: 'bg-blue-100 text-blue-800',
          high: 'bg-red-100 text-red-800',
        };
        return (
          <li key={task._id} className="py-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleStatus(task._id)}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    <button
                      onClick={() => onDeleteTask(task._id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      aria-label="Delete task"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                {task.description && (
                  <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                    {task.description}
                  </p>
                )}
                <div className="mt-1 text-xs text-gray-400">
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}