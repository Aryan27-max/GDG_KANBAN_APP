import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, PRIORITY_CONFIG, TAG_COLORS } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const tagConfig = task.tag ? TAG_COLORS[task.tag] : null;

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger edit if not dragging
    if (!isDragging && !isSortableDragging && onEdit) {
      e.stopPropagation();
      onEdit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit?.();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}. Priority: ${task.priority}. Click to edit.`}
      className={`
        relative group bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm
        border border-gray-200 dark:border-gray-600
        cursor-grab active:cursor-grabbing
        hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500
        transition-all duration-200
        ${isDragging || isSortableDragging ? 'opacity-50 shadow-lg scale-105 rotate-2' : ''}
        ${isSortableDragging ? 'z-50' : ''}
        animate-fade-in
      `}
    >
      {/* Title */}
      <h4 className="font-medium text-gray-800 dark:text-gray-100 text-sm mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority badge */}
        <span
          className={`
            inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
            ${priorityConfig.color} ${priorityConfig.darkColor}
          `}
        >
          {priorityConfig.label}
        </span>

        {/* Tag color indicator */}
        {tagConfig && (
          <span
            className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
              bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300
            `}
          >
            <span
              className={`w-2 h-2 rounded-full ${tagConfig.bg} ${tagConfig.darkBg}`}
            />
            {tagConfig.label}
          </span>
        )}
      </div>

      {/* Hover edit indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-gray-400 dark:text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </span>
      </div>
    </div>
  );
};
