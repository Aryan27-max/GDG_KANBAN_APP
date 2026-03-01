import React from 'react';
import { BoardFilters, Priority, TagColor, PRIORITY_CONFIG, TAG_COLORS } from '../../types';

interface FiltersProps {
  filters: BoardFilters;
  onFiltersChange: (filters: Partial<BoardFilters>) => void;
}

export const Filters: React.FC<FiltersProps> = ({ filters, onFiltersChange }) => {
  const hasActiveFilters = filters.priority !== 'all' || filters.tag !== 'all';

  const handleClearFilters = () => {
    onFiltersChange({ priority: 'all', tag: 'all' });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Priority Filter */}
      <div className="relative">
        <select
          value={filters.priority}
          onChange={(e) =>
            onFiltersChange({ priority: e.target.value as Priority | 'all' })
          }
          className="
            appearance-none pl-3 pr-8 py-2 rounded-lg border
            bg-white dark:bg-gray-800
            text-gray-700 dark:text-gray-200
            border-gray-300 dark:border-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            text-sm cursor-pointer
          "
          aria-label="Filter by priority"
        >
          <option value="all">All Priorities</option>
          {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_CONFIG[p].label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Tag Filter */}
      <div className="relative">
        <select
          value={filters.tag}
          onChange={(e) =>
            onFiltersChange({ tag: e.target.value as TagColor | 'all' })
          }
          className="
            appearance-none pl-3 pr-8 py-2 rounded-lg border
            bg-white dark:bg-gray-800
            text-gray-700 dark:text-gray-200
            border-gray-300 dark:border-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            text-sm cursor-pointer
          "
          aria-label="Filter by tag"
        >
          <option value="all">All Tags</option>
          {(Object.keys(TAG_COLORS) as TagColor[]).map((t) => (
            <option key={t} value={t}>
              {TAG_COLORS[t].label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="
            flex items-center gap-1 px-2 py-2 text-sm font-medium
            text-gray-500 dark:text-gray-400
            hover:text-gray-700 dark:hover:text-gray-200
            transition-colors
          "
          aria-label="Clear all filters"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="hidden sm:inline">Clear</span>
        </button>
      )}
    </div>
  );
};
