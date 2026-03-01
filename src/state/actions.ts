import {
  BoardAction,
  BoardState,
  ColumnId,
  Priority,
  TagColor,
  Theme,
  BoardFilters,
} from '../types';

// Action creators for type-safe dispatching

export const createTask = (
  title: string,
  description?: string,
  priority: Priority = 'medium',
  tag?: TagColor
): BoardAction => ({
  type: 'CREATE_TASK',
  payload: { title, description, priority, tag },
});

export const updateTask = (
  id: string,
  title: string,
  description?: string,
  priority: Priority = 'medium',
  tag?: TagColor
): BoardAction => ({
  type: 'UPDATE_TASK',
  payload: { id, title, description, priority, tag },
});

export const deleteTask = (id: string): BoardAction => ({
  type: 'DELETE_TASK',
  payload: { id },
});

export const moveTask = (
  taskId: string,
  toColumnId: ColumnId,
  toIndex: number
): BoardAction => ({
  type: 'MOVE_TASK',
  payload: { taskId, toColumnId, toIndex },
});

export const reorderTask = (
  columnId: ColumnId,
  fromIndex: number,
  toIndex: number
): BoardAction => ({
  type: 'REORDER_TASK',
  payload: { columnId, fromIndex, toIndex },
});

export const createColumn = (title: string): BoardAction => ({
  type: 'CREATE_COLUMN',
  payload: { title },
});

export const updateColumn = (id: ColumnId, title: string): BoardAction => ({
  type: 'UPDATE_COLUMN',
  payload: { id, title },
});

export const deleteColumn = (id: ColumnId, moveTasks: boolean = false): BoardAction => ({
  type: 'DELETE_COLUMN',
  payload: { id, moveTasks },
});

export const setTheme = (theme: Theme): BoardAction => ({
  type: 'SET_THEME',
  payload: { theme },
});

export const setSearch = (search: string): BoardAction => ({
  type: 'SET_SEARCH',
  payload: { search },
});

export const setFilters = (filters: Partial<BoardFilters>): BoardAction => ({
  type: 'SET_FILTERS',
  payload: filters,
});

export const loadState = (state: BoardState): BoardAction => ({
  type: 'LOAD_STATE',
  payload: state,
});
