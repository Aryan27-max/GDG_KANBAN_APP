// Type definitions for Kanban Board

export type ColumnId = string;

export type Priority = 'low' | 'medium' | 'high';

export type TagColor = 'gray' | 'blue' | 'green' | 'yellow' | 'red';

export type Theme = 'light' | 'dark';

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: ColumnId;
  priority: Priority;
  tag?: TagColor;
  createdAt: number;
  updatedAt: number;
}

export interface Column {
  id: ColumnId;
  title: string;
  taskIds: string[];
}

export interface BoardFilters {
  priority: Priority | 'all';
  tag: TagColor | 'all';
}

export interface BoardState {
  columns: Column[];
  tasks: Record<string, Task>;
  theme: Theme;
  search: string;
  filters: BoardFilters;
}

// Action types
export type BoardAction =
  | { type: 'CREATE_TASK'; payload: { title: string; description?: string; priority: Priority; tag?: TagColor } }
  | { type: 'UPDATE_TASK'; payload: { id: string; title: string; description?: string; priority: Priority; tag?: TagColor } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'MOVE_TASK'; payload: { taskId: string; toColumnId: ColumnId; toIndex: number } }
  | { type: 'REORDER_TASK'; payload: { columnId: ColumnId; fromIndex: number; toIndex: number } }
  | { type: 'CREATE_COLUMN'; payload: { title: string } }
  | { type: 'UPDATE_COLUMN'; payload: { id: ColumnId; title: string } }
  | { type: 'DELETE_COLUMN'; payload: { id: ColumnId; moveTasks?: boolean } }
  | { type: 'SET_THEME'; payload: { theme: Theme } }
  | { type: 'SET_SEARCH'; payload: { search: string } }
  | { type: 'SET_FILTERS'; payload: Partial<BoardFilters> }
  | { type: 'LOAD_STATE'; payload: BoardState };

// Default column IDs
export const DEFAULT_COLUMN_IDS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
} as const;

// Priority display config
export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; darkColor: string }> = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800', darkColor: 'dark:bg-green-900 dark:text-green-200' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', darkColor: 'dark:bg-yellow-900 dark:text-yellow-200' },
  high: { label: 'High', color: 'bg-red-100 text-red-800', darkColor: 'dark:bg-red-900 dark:text-red-200' },
};

// Tag color config
export const TAG_COLORS: Record<TagColor, { label: string; bg: string; darkBg: string }> = {
  gray: { label: 'Gray', bg: 'bg-gray-400', darkBg: 'dark:bg-gray-500' },
  blue: { label: 'Blue', bg: 'bg-blue-400', darkBg: 'dark:bg-blue-500' },
  green: { label: 'Green', bg: 'bg-green-400', darkBg: 'dark:bg-green-500' },
  yellow: { label: 'Yellow', bg: 'bg-yellow-400', darkBg: 'dark:bg-yellow-500' },
  red: { label: 'Red', bg: 'bg-red-400', darkBg: 'dark:bg-red-500' },
};
