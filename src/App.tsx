import React, { useReducer, useEffect, useState, useCallback } from 'react';
import { Board } from './components/Board';
import { TopBar } from './components/controls/TopBar';
import { TaskModal } from './components/modals/TaskModal';
import { ColumnModal } from './components/modals/ColumnModal';
import { ConfirmDialog } from './components/modals/ConfirmDialog';
import { boardReducer, initialState } from './state/reducer';
import {
  createTask,
  updateTask,
  deleteTask,
  createColumn,
  deleteColumn,
  setTheme,
  setSearch,
  setFilters,
} from './state/actions';
import { loadFromStorage, saveToStorage, applyTheme } from './state/storage';
import { Task, Priority, TagColor, BoardFilters, Column } from './types';

export const App: React.FC = () => {
  // Initialize state from localStorage
  const [state, dispatch] = useReducer(boardReducer, initialState, () => {
    return loadFromStorage();
  });

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);
  const [isDeleteColumnDialogOpen, setIsDeleteColumnDialogOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<Column | null>(null);

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(state.theme);
  }, [state.theme]);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // Handlers
  const handleThemeToggle = useCallback(() => {
    dispatch(setTheme(state.theme === 'light' ? 'dark' : 'light'));
  }, [state.theme]);

  const handleSearchChange = useCallback((search: string) => {
    dispatch(setSearch(search));
  }, []);

  const handleFiltersChange = useCallback((filters: Partial<BoardFilters>) => {
    dispatch(setFilters(filters));
  }, []);

  const handleAddTask = useCallback(() => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }, []);

  const handleSaveTask = useCallback(
    (data: { title: string; description?: string; priority: Priority; tag?: TagColor }) => {
      if (editingTask) {
        dispatch(updateTask(editingTask.id, data.title, data.description, data.priority, data.tag));
      } else {
        dispatch(createTask(data.title, data.description, data.priority, data.tag));
      }
    },
    [editingTask]
  );

  const handleDeleteTaskRequest = useCallback(() => {
    setIsDeleteTaskDialogOpen(true);
  }, []);

  const handleDeleteTaskConfirm = useCallback(() => {
    if (editingTask) {
      dispatch(deleteTask(editingTask.id));
      setIsTaskModalOpen(false);
      setEditingTask(null);
    }
  }, [editingTask]);

  const handleAddColumn = useCallback(() => {
    setIsColumnModalOpen(true);
  }, []);

  const handleSaveColumn = useCallback((title: string) => {
    dispatch(createColumn(title));
  }, []);

  const handleDeleteColumnRequest = useCallback(
    (columnId: string) => {
      const column = state.columns.find((c) => c.id === columnId);
      if (column) {
        setColumnToDelete(column);
        setIsDeleteColumnDialogOpen(true);
      }
    },
    [state.columns]
  );

  const handleDeleteColumnConfirm = useCallback(() => {
    if (columnToDelete) {
      dispatch(deleteColumn(columnToDelete.id, false));
      setColumnToDelete(null);
    }
  }, [columnToDelete]);

  const handleMoveTasksAndDeleteColumn = useCallback(() => {
    if (columnToDelete) {
      dispatch(deleteColumn(columnToDelete.id, true));
      setColumnToDelete(null);
    }
  }, [columnToDelete]);

  const handleCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Top Bar */}
      <TopBar
        search={state.search}
        onSearchChange={handleSearchChange}
        filters={state.filters}
        onFiltersChange={handleFiltersChange}
        theme={state.theme}
        onThemeToggle={handleThemeToggle}
        onAddTask={handleAddTask}
        onAddColumn={handleAddColumn}
      />

      {/* Board */}
      <Board
        state={state}
        dispatch={dispatch}
        onEditTask={handleEditTask}
        onDeleteColumn={handleDeleteColumnRequest}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onSave={handleSaveTask}
        onDelete={editingTask ? handleDeleteTaskRequest : undefined}
        task={editingTask}
      />

      {/* Column Modal */}
      <ColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        onSave={handleSaveColumn}
      />

      {/* Delete Task Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteTaskDialogOpen}
        onClose={() => setIsDeleteTaskDialogOpen(false)}
        onConfirm={handleDeleteTaskConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      {/* Delete Column Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteColumnDialogOpen}
        onClose={() => {
          setIsDeleteColumnDialogOpen(false);
          setColumnToDelete(null);
        }}
        onConfirm={handleDeleteColumnConfirm}
        title="Delete Column"
        message={
          columnToDelete && columnToDelete.taskIds.length > 0
            ? `This column has ${columnToDelete.taskIds.length} task(s). You can move them to the first column or delete them along with the column.`
            : 'Are you sure you want to delete this column?'
        }
        confirmText={columnToDelete?.taskIds.length ? 'Delete All' : 'Delete'}
        variant="danger"
        showMoveOption={!!columnToDelete && columnToDelete.taskIds.length > 0}
        onMove={handleMoveTasksAndDeleteColumn}
      />
    </div>
  );
};

export default App;
