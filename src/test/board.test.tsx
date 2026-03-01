import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { boardReducer, initialState, getVisibleTasks } from '../state/reducer';
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  setSearch,
  setFilters,
  setTheme,
  createColumn,
  deleteColumn,
} from '../state/actions';
import { BoardState, DEFAULT_COLUMN_IDS } from '../types';

// Helper to render app with user event setup
const renderApp = () => {
  const user = userEvent.setup();
  const result = render(<App />);
  return { user, ...result };
};

describe('Board Reducer', () => {
  describe('Task Creation', () => {
    it('creates a task in the Todo column', () => {
      const action = createTask('Test Task', 'Description', 'medium', 'blue');
      const newState = boardReducer(initialState, action);

      const taskIds = Object.keys(newState.tasks);
      expect(taskIds).toHaveLength(1);

      const task = newState.tasks[taskIds[0]];
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Description');
      expect(task.priority).toBe('medium');
      expect(task.tag).toBe('blue');
      expect(task.columnId).toBe(DEFAULT_COLUMN_IDS.TODO);

      // Verify task is in the Todo column
      const todoColumn = newState.columns.find((c) => c.id === DEFAULT_COLUMN_IDS.TODO);
      expect(todoColumn?.taskIds).toContain(task.id);
    });

    it('adds new tasks to the end of the Todo column', () => {
      let state = boardReducer(initialState, createTask('Task 1'));
      state = boardReducer(state, createTask('Task 2'));
      state = boardReducer(state, createTask('Task 3'));

      const todoColumn = state.columns.find((c) => c.id === DEFAULT_COLUMN_IDS.TODO);
      expect(todoColumn?.taskIds).toHaveLength(3);

      const lastTask = state.tasks[todoColumn!.taskIds[2]];
      expect(lastTask.title).toBe('Task 3');
    });
  });

  describe('Task Updates', () => {
    it('updates task title and description', () => {
      // Create a task first
      let state = boardReducer(initialState, createTask('Original Title', 'Original Desc'));
      const taskId = Object.keys(state.tasks)[0];

      // Update it
      state = boardReducer(
        state,
        updateTask(taskId, 'Updated Title', 'Updated Desc', 'high', 'red')
      );

      const task = state.tasks[taskId];
      expect(task.title).toBe('Updated Title');
      expect(task.description).toBe('Updated Desc');
      expect(task.priority).toBe('high');
      expect(task.tag).toBe('red');
      expect(task.updatedAt).toBeGreaterThan(task.createdAt);
    });

    it('preserves other task fields when updating', () => {
      let state = boardReducer(initialState, createTask('Test', 'Desc', 'low', 'green'));
      const taskId = Object.keys(state.tasks)[0];
      const originalTask = state.tasks[taskId];

      state = boardReducer(state, updateTask(taskId, 'New Title', undefined, 'medium'));

      const updatedTask = state.tasks[taskId];
      expect(updatedTask.id).toBe(originalTask.id);
      expect(updatedTask.columnId).toBe(originalTask.columnId);
      expect(updatedTask.createdAt).toBe(originalTask.createdAt);
    });
  });

  describe('Task Deletion', () => {
    it('removes task from state and column', () => {
      let state = boardReducer(initialState, createTask('Task to Delete'));
      const taskId = Object.keys(state.tasks)[0];

      state = boardReducer(state, deleteTask(taskId));

      expect(state.tasks[taskId]).toBeUndefined();

      const todoColumn = state.columns.find((c) => c.id === DEFAULT_COLUMN_IDS.TODO);
      expect(todoColumn?.taskIds).not.toContain(taskId);
    });

    it('handles deletion of non-existent task gracefully', () => {
      const state = boardReducer(initialState, deleteTask('non-existent-id'));
      expect(state).toEqual(initialState);
    });
  });

  describe('Task Movement', () => {
    it('moves task between columns', () => {
      let state = boardReducer(initialState, createTask('Movable Task'));
      const taskId = Object.keys(state.tasks)[0];

      // Move to In Progress
      state = boardReducer(state, moveTask(taskId, DEFAULT_COLUMN_IDS.IN_PROGRESS, 0));

      const task = state.tasks[taskId];
      expect(task.columnId).toBe(DEFAULT_COLUMN_IDS.IN_PROGRESS);

      const todoColumn = state.columns.find((c) => c.id === DEFAULT_COLUMN_IDS.TODO);
      const progressColumn = state.columns.find((c) => c.id === DEFAULT_COLUMN_IDS.IN_PROGRESS);

      expect(todoColumn?.taskIds).not.toContain(taskId);
      expect(progressColumn?.taskIds).toContain(taskId);
    });

    it('reorders tasks within a column', () => {
      let state = boardReducer(initialState, createTask('Task 1'));
      state = boardReducer(state, createTask('Task 2'));
      state = boardReducer(state, createTask('Task 3'));

      const todoColumn = state.columns.find((c) => c.id === DEFAULT_COLUMN_IDS.TODO)!;
      const taskIds = [...todoColumn.taskIds];

      // Move first task to last position
      state = boardReducer(state, moveTask(taskIds[0], DEFAULT_COLUMN_IDS.TODO, 2));

      const updatedColumn = state.columns.find((c) => c.id === DEFAULT_COLUMN_IDS.TODO)!;
      expect(updatedColumn.taskIds[2]).toBe(taskIds[0]);
    });
  });

  describe('Search and Filters', () => {
    let stateWithTasks: BoardState;

    beforeEach(() => {
      stateWithTasks = boardReducer(initialState, createTask('Alpha Task', 'First description', 'high', 'red'));
      stateWithTasks = boardReducer(stateWithTasks, createTask('Beta Task', 'Second description', 'medium', 'blue'));
      stateWithTasks = boardReducer(stateWithTasks, createTask('Gamma Task', 'Third description', 'low', 'green'));
    });

    it('filters tasks by search term in title', () => {
      const state = boardReducer(stateWithTasks, setSearch('Alpha'));
      const visible = getVisibleTasks(state);

      expect(visible.size).toBe(1);
      const visibleTask = Object.values(state.tasks).find((t) => visible.has(t.id));
      expect(visibleTask?.title).toBe('Alpha Task');
    });

    it('filters tasks by search term in description', () => {
      const state = boardReducer(stateWithTasks, setSearch('Second'));
      const visible = getVisibleTasks(state);

      expect(visible.size).toBe(1);
      const visibleTask = Object.values(state.tasks).find((t) => visible.has(t.id));
      expect(visibleTask?.title).toBe('Beta Task');
    });

    it('filters tasks by priority', () => {
      const state = boardReducer(stateWithTasks, setFilters({ priority: 'high' }));
      const visible = getVisibleTasks(state);

      expect(visible.size).toBe(1);
      const visibleTask = Object.values(state.tasks).find((t) => visible.has(t.id));
      expect(visibleTask?.priority).toBe('high');
    });

    it('filters tasks by tag', () => {
      const state = boardReducer(stateWithTasks, setFilters({ tag: 'blue' }));
      const visible = getVisibleTasks(state);

      expect(visible.size).toBe(1);
      const visibleTask = Object.values(state.tasks).find((t) => visible.has(t.id));
      expect(visibleTask?.tag).toBe('blue');
    });

    it('combines search and filters', () => {
      let state = boardReducer(stateWithTasks, setSearch('Task'));
      state = boardReducer(state, setFilters({ priority: 'medium' }));
      const visible = getVisibleTasks(state);

      expect(visible.size).toBe(1);
      const visibleTask = Object.values(state.tasks).find((t) => visible.has(t.id));
      expect(visibleTask?.title).toBe('Beta Task');
    });

    it('returns all tasks when no filters are applied', () => {
      const visible = getVisibleTasks(stateWithTasks);
      expect(visible.size).toBe(3);
    });
  });

  describe('Theme', () => {
    it('toggles theme between light and dark', () => {
      let state = boardReducer(initialState, setTheme('dark'));
      expect(state.theme).toBe('dark');

      state = boardReducer(state, setTheme('light'));
      expect(state.theme).toBe('light');
    });
  });

  describe('Column Management', () => {
    it('creates a new column', () => {
      const state = boardReducer(initialState, createColumn('Review'));

      expect(state.columns).toHaveLength(4);
      expect(state.columns[3].title).toBe('Review');
      expect(state.columns[3].taskIds).toEqual([]);
    });

    it('deletes a column and its tasks', () => {
      // Create a custom column
      let state = boardReducer(initialState, createColumn('Custom'));
      const customColumnId = state.columns[3].id;

      // Add a task to it
      state = boardReducer(state, createTask('Custom Task'));
      const taskId = Object.keys(state.tasks)[0];
      state = boardReducer(state, moveTask(taskId, customColumnId, 0));

      // Delete the column (without moving tasks)
      state = boardReducer(state, deleteColumn(customColumnId, false));

      expect(state.columns).toHaveLength(3);
      expect(state.tasks[taskId]).toBeUndefined();
    });

    it('deletes a column and moves its tasks', () => {
      // Create a custom column
      let state = boardReducer(initialState, createColumn('Custom'));
      const customColumnId = state.columns[3].id;

      // Add a task to it
      state = boardReducer(state, createTask('Custom Task'));
      const taskId = Object.keys(state.tasks)[0];
      state = boardReducer(state, moveTask(taskId, customColumnId, 0));

      // Delete the column (moving tasks)
      state = boardReducer(state, deleteColumn(customColumnId, true));

      expect(state.columns).toHaveLength(3);
      expect(state.tasks[taskId]).toBeDefined();
      expect(state.tasks[taskId].columnId).toBe(DEFAULT_COLUMN_IDS.TODO);
    });
  });
});

describe('App Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Task Creation Flow', () => {
    it('creates a task that appears in the Todo column', async () => {
      const { user } = renderApp();

      // Click add task button
      const addTaskButton = screen.getByRole('button', { name: /add task/i });
      await user.click(addTaskButton);

      // Fill in the form - use role to be specific
      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await user.type(titleInput, 'New Test Task');

      const descInput = screen.getByRole('textbox', { name: /description/i });
      await user.type(descInput, 'Test description');

      // Submit
      const createButton = screen.getByRole('button', { name: /create task/i });
      await user.click(createButton);

      // Verify task appears in Todo column
      await waitFor(() => {
        expect(screen.getByText('New Test Task')).toBeInTheDocument();
      });
    });

    it('persists task after page refresh', async () => {
      const { user } = renderApp();

      // Create a task
      await user.click(screen.getByRole('button', { name: /add task/i }));
      await user.type(screen.getByRole('textbox', { name: /title/i }), 'Persistent Task');
      await user.click(screen.getByRole('button', { name: /create task/i }));

      await waitFor(() => {
        expect(screen.getByText('Persistent Task')).toBeInTheDocument();
      });

      // Verify it's in localStorage
      const stored = localStorage.getItem('kanban-board-v1');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(Object.values(parsed.state.tasks).some((t: any) => t.title === 'Persistent Task')).toBe(true);
    });
  });

  describe('Task Editing Flow', () => {
    it('edits a task and persists changes', async () => {
      const { user } = renderApp();

      // Create a task first
      await user.click(screen.getByRole('button', { name: /add task/i }));
      await user.type(screen.getByRole('textbox', { name: /title/i }), 'Original Title');
      await user.click(screen.getByRole('button', { name: /create task/i }));

      await waitFor(() => {
        expect(screen.getByText('Original Title')).toBeInTheDocument();
      });

      // Click on the task to edit
      await user.click(screen.getByText('Original Title'));

      // Update the title - find the input in the modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      // Verify task is updated
      await waitFor(() => {
        expect(screen.getByText('Updated Title')).toBeInTheDocument();
        expect(screen.queryByText('Original Title')).not.toBeInTheDocument();
      });
    });
  });

  describe('Task Deletion Flow', () => {
    it('deletes a task and persists', async () => {
      const { user } = renderApp();

      // Create a task
      await user.click(screen.getByRole('button', { name: /add task/i }));
      await user.type(screen.getByRole('textbox', { name: /title/i }), 'Task to Delete');
      await user.click(screen.getByRole('button', { name: /create task/i }));

      await waitFor(() => {
        expect(screen.getByText('Task to Delete')).toBeInTheDocument();
      });

      // Click on task to edit
      await user.click(screen.getByText('Task to Delete'));

      // Click delete button
      await user.click(screen.getByRole('button', { name: /delete task/i }));

      // Confirm deletion
      await user.click(screen.getByRole('button', { name: /^delete$/i }));

      // Verify task is removed
      await waitFor(() => {
        expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter UI', () => {
    it('filters tasks by search term', async () => {
      const { user } = renderApp();

      // Create tasks
      await user.click(screen.getByRole('button', { name: /add task/i }));
      await user.type(screen.getByRole('textbox', { name: /title/i }), 'Apple Task');
      await user.click(screen.getByRole('button', { name: /create task/i }));

      await user.click(screen.getByRole('button', { name: /add task/i }));
      await user.type(screen.getByRole('textbox', { name: /title/i }), 'Banana Task');
      await user.click(screen.getByRole('button', { name: /create task/i }));

      await waitFor(() => {
        expect(screen.getByText('Apple Task')).toBeInTheDocument();
        expect(screen.getByText('Banana Task')).toBeInTheDocument();
      });

      // Search for 'Apple'
      const searchInput = screen.getAllByPlaceholderText(/search tasks/i)[0];
      await user.type(searchInput, 'Apple');

      await waitFor(() => {
        expect(screen.getByText('Apple Task')).toBeInTheDocument();
        expect(screen.queryByText('Banana Task')).not.toBeInTheDocument();
      });
    });

    it('filters tasks by priority', async () => {
      const { user } = renderApp();

      // Create a high priority task
      await user.click(screen.getByRole('button', { name: /add task/i }));
      await user.type(screen.getByRole('textbox', { name: /title/i }), 'High Priority Task');
      await user.click(screen.getByRole('button', { name: /^high$/i }));
      await user.click(screen.getByRole('button', { name: /create task/i }));

      // Create a low priority task
      await user.click(screen.getByRole('button', { name: /add task/i }));
      await user.type(screen.getByRole('textbox', { name: /title/i }), 'Low Priority Task');
      await user.click(screen.getByRole('button', { name: /^low$/i }));
      await user.click(screen.getByRole('button', { name: /create task/i }));

      await waitFor(() => {
        expect(screen.getByText('High Priority Task')).toBeInTheDocument();
        expect(screen.getByText('Low Priority Task')).toBeInTheDocument();
      });

      // Filter by high priority
      const prioritySelect = screen.getByRole('combobox', { name: /filter by priority/i });
      await user.selectOptions(prioritySelect, 'high');

      await waitFor(() => {
        expect(screen.getByText('High Priority Task')).toBeInTheDocument();
        expect(screen.queryByText('Low Priority Task')).not.toBeInTheDocument();
      });
    });
  });

  describe('Theme Toggle', () => {
    it('toggles theme and persists preference', async () => {
      const { user } = renderApp();

      // Initially should be light (mocked in setup)
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // Toggle to dark
      const themeButton = screen.getByRole('button', { name: /switch to dark mode/i });
      await user.click(themeButton);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      // Verify persistence
      const stored = localStorage.getItem('kanban-board-v1');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.theme).toBe('dark');
    });
  });
});
