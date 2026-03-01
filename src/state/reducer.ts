import {
  BoardState,
  BoardAction,
  Task,
  DEFAULT_COLUMN_IDS,
} from '../types';

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Initial state
export const initialState: BoardState = {
  columns: [
    { id: DEFAULT_COLUMN_IDS.TODO, title: 'Todo', taskIds: [] },
    { id: DEFAULT_COLUMN_IDS.IN_PROGRESS, title: 'In Progress', taskIds: [] },
    { id: DEFAULT_COLUMN_IDS.DONE, title: 'Done', taskIds: [] },
  ],
  tasks: {},
  theme: 'light',
  search: '',
  filters: {
    priority: 'all',
    tag: 'all',
  },
};

// Pure reducer function
export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'CREATE_TASK': {
      const { title, description, priority, tag } = action.payload;
      const id = generateId();
      const now = Date.now();
      const newTask: Task = {
        id,
        title,
        description,
        columnId: DEFAULT_COLUMN_IDS.TODO,
        priority,
        tag,
        createdAt: now,
        updatedAt: now,
      };

      // Find the Todo column and add task to the end
      const newColumns = state.columns.map((col) => {
        if (col.id === DEFAULT_COLUMN_IDS.TODO) {
          return { ...col, taskIds: [...col.taskIds, id] };
        }
        return col;
      });

      return {
        ...state,
        columns: newColumns,
        tasks: { ...state.tasks, [id]: newTask },
      };
    }

    case 'UPDATE_TASK': {
      const { id, title, description, priority, tag } = action.payload;
      const existingTask = state.tasks[id];
      if (!existingTask) return state;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [id]: {
            ...existingTask,
            title,
            description,
            priority,
            tag,
            updatedAt: Date.now(),
          },
        },
      };
    }

    case 'DELETE_TASK': {
      const { id } = action.payload;
      const task = state.tasks[id];
      if (!task) return state;

      // Remove from column
      const newColumns = state.columns.map((col) => {
        if (col.id === task.columnId) {
          return { ...col, taskIds: col.taskIds.filter((tid) => tid !== id) };
        }
        return col;
      });

      // Remove from tasks
      const { [id]: _, ...remainingTasks } = state.tasks;

      return {
        ...state,
        columns: newColumns,
        tasks: remainingTasks,
      };
    }

    case 'MOVE_TASK': {
      const { taskId, toColumnId, toIndex } = action.payload;
      const task = state.tasks[taskId];
      if (!task) return state;

      const fromColumnId = task.columnId;

      // If moving to same position, no change needed
      if (fromColumnId === toColumnId) {
        const column = state.columns.find((c) => c.id === toColumnId);
        if (!column) return state;
        const fromIndex = column.taskIds.indexOf(taskId);
        if (fromIndex === toIndex) return state;
      }

      // Remove from source column and add to destination
      const newColumns = state.columns.map((col) => {
        if (col.id === fromColumnId && col.id === toColumnId) {
          // Moving within same column
          const newTaskIds = [...col.taskIds];
          const fromIndex = newTaskIds.indexOf(taskId);
          newTaskIds.splice(fromIndex, 1);
          newTaskIds.splice(toIndex, 0, taskId);
          return { ...col, taskIds: newTaskIds };
        } else if (col.id === fromColumnId) {
          // Remove from source
          return { ...col, taskIds: col.taskIds.filter((tid) => tid !== taskId) };
        } else if (col.id === toColumnId) {
          // Add to destination
          const newTaskIds = [...col.taskIds];
          newTaskIds.splice(toIndex, 0, taskId);
          return { ...col, taskIds: newTaskIds };
        }
        return col;
      });

      // Update task's columnId
      const updatedTask = { ...task, columnId: toColumnId, updatedAt: Date.now() };

      return {
        ...state,
        columns: newColumns,
        tasks: { ...state.tasks, [taskId]: updatedTask },
      };
    }

    case 'REORDER_TASK': {
      const { columnId, fromIndex, toIndex } = action.payload;
      if (fromIndex === toIndex) return state;

      const newColumns = state.columns.map((col) => {
        if (col.id === columnId) {
          const newTaskIds = [...col.taskIds];
          const [removed] = newTaskIds.splice(fromIndex, 1);
          newTaskIds.splice(toIndex, 0, removed);
          return { ...col, taskIds: newTaskIds };
        }
        return col;
      });

      return { ...state, columns: newColumns };
    }

    case 'CREATE_COLUMN': {
      const { title } = action.payload;
      const id = generateId();
      const newColumn = { id, title, taskIds: [] };

      return {
        ...state,
        columns: [...state.columns, newColumn],
      };
    }

    case 'UPDATE_COLUMN': {
      const { id, title } = action.payload;
      const newColumns = state.columns.map((col) => {
        if (col.id === id) {
          return { ...col, title };
        }
        return col;
      });

      return { ...state, columns: newColumns };
    }

    case 'DELETE_COLUMN': {
      const { id, moveTasks } = action.payload;
      const columnToDelete = state.columns.find((c) => c.id === id);
      if (!columnToDelete) return state;

      let newTasks = { ...state.tasks };
      let newColumns = state.columns.filter((c) => c.id !== id);

      if (moveTasks && columnToDelete.taskIds.length > 0) {
        // Move tasks to the first remaining column (usually Todo)
        const targetColumn = newColumns[0];
        if (targetColumn) {
          newColumns = newColumns.map((col) => {
            if (col.id === targetColumn.id) {
              return { ...col, taskIds: [...col.taskIds, ...columnToDelete.taskIds] };
            }
            return col;
          });

          // Update task columnIds
          columnToDelete.taskIds.forEach((taskId) => {
            if (newTasks[taskId]) {
              newTasks[taskId] = { ...newTasks[taskId], columnId: targetColumn.id };
            }
          });
        }
      } else {
        // Delete all tasks in the column
        columnToDelete.taskIds.forEach((taskId) => {
          delete newTasks[taskId];
        });
      }

      return {
        ...state,
        columns: newColumns,
        tasks: newTasks,
      };
    }

    case 'SET_THEME': {
      return { ...state, theme: action.payload.theme };
    }

    case 'SET_SEARCH': {
      return { ...state, search: action.payload.search };
    }

    case 'SET_FILTERS': {
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    }

    case 'LOAD_STATE': {
      return action.payload;
    }

    default:
      return state;
  }
}

// Helper to filter visible tasks based on search and filters
export function getVisibleTasks(state: BoardState): Set<string> {
  const visibleIds = new Set<string>();
  const { search, filters, tasks } = state;
  const searchLower = search.toLowerCase().trim();

  Object.values(tasks).forEach((task) => {
    // Search filter
    if (searchLower) {
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descMatch = task.description?.toLowerCase().includes(searchLower) || false;
      if (!titleMatch && !descMatch) return;
    }

    // Priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return;
    }

    // Tag filter
    if (filters.tag !== 'all') {
      if (!task.tag || task.tag !== filters.tag) {
        return;
      }
    }

    visibleIds.add(task.id);
  });

  return visibleIds;
}
