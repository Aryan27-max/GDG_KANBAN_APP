import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Column as ColumnType, Task, DEFAULT_COLUMN_IDS } from '../types';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteColumn: (columnId: string) => void;
  totalTaskCount: number;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  onEditTask,
  onDeleteColumn,
  totalTaskCount,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // Check if this is a default column (cannot be deleted)
  const isDefaultColumn = Object.values(DEFAULT_COLUMN_IDS).includes(
    column.id as (typeof DEFAULT_COLUMN_IDS)[keyof typeof DEFAULT_COLUMN_IDS]
  );

  const handleDeleteClick = () => {
    onDeleteColumn(column.id);
  };

  // Get column color based on column title or position
  const getColumnHeaderColor = () => {
    const lowerTitle = column.title.toLowerCase();
    if (lowerTitle.includes('todo') || lowerTitle === 'backlog') {
      return 'bg-slate-500';
    }
    if (lowerTitle.includes('progress') || lowerTitle.includes('doing')) {
      return 'bg-blue-500';
    }
    if (lowerTitle.includes('done') || lowerTitle.includes('complete')) {
      return 'bg-green-500';
    }
    if (lowerTitle.includes('review')) {
      return 'bg-yellow-500';
    }
    if (lowerTitle.includes('blocked') || lowerTitle.includes('hold')) {
      return 'bg-red-500';
    }
    return 'bg-purple-500';
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col w-72 md:w-80 flex-shrink-0
        bg-gray-100 dark:bg-gray-800 rounded-lg
        transition-all duration-200
        ${isOver ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${getColumnHeaderColor()}`} />
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[150px]">
            {column.title}
          </h3>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {tasks.length}
            {tasks.length !== totalTaskCount && ` / ${totalTaskCount}`}
          </span>
        </div>

        {!isDefaultColumn && (
          <button
            onClick={handleDeleteClick}
            className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 
                       hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Delete column"
            aria-label={`Delete ${column.title} column`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 p-2 overflow-y-auto min-h-[100px] max-h-[calc(100vh-280px)]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask(task)}
              />
            ))}
          </div>
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-gray-400 dark:text-gray-500 text-sm">
            <p>Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
};
