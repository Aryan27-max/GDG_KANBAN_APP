import React, { useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { BoardState, Task, BoardAction } from '../types';
import { moveTask } from '../state/actions';
import { getVisibleTasks } from '../state/reducer';

interface BoardProps {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
  onEditTask: (task: Task) => void;
  onDeleteColumn: (columnId: string) => void;
}

export const Board: React.FC<BoardProps> = ({
  state,
  dispatch,
  onEditTask,
  onDeleteColumn,
}) => {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  // Configure sensors for mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Get visible task IDs based on filters
  const visibleTaskIds = useMemo(() => getVisibleTasks(state), [state]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = state.tasks[active.id as string];
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // We can use this for real-time visual feedback if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const activeTask = state.tasks[activeId];
    if (!activeTask) return;

    // Determine if we're dropping on a column or a task
    let targetColumnId: string;
    let targetIndex: number;

    // Check if over is a column
    const isOverColumn = state.columns.some((col) => col.id === overId);

    if (isOverColumn) {
      // Dropping directly on column
      targetColumnId = overId;
      const column = state.columns.find((col) => col.id === overId);
      // Get only visible tasks in this column
      const visibleTasksInColumn = column?.taskIds.filter((id) => visibleTaskIds.has(id)) || [];
      targetIndex = visibleTasksInColumn.length;
    } else {
      // Dropping on a task
      const overTask = state.tasks[overId];
      if (!overTask) return;

      targetColumnId = overTask.columnId;
      const column = state.columns.find((col) => col.id === targetColumnId);
      if (!column) return;

      // Get visible tasks in the column and find the position
      const visibleTasksInColumn = column.taskIds.filter((id) => visibleTaskIds.has(id));
      targetIndex = visibleTasksInColumn.indexOf(overId);

      // If moving down in the same column, adjust index
      if (activeTask.columnId === targetColumnId) {
        const activeIndex = visibleTasksInColumn.indexOf(activeId);
        if (activeIndex < targetIndex) {
          targetIndex = targetIndex;
        }
      }
    }

    // Convert visual index back to actual column index
    const targetColumn = state.columns.find((col) => col.id === targetColumnId);
    if (!targetColumn) return;

    // Map visual index to actual index
    const visibleTasksInTargetColumn = targetColumn.taskIds.filter((id) => visibleTaskIds.has(id));
    let actualIndex = targetIndex;

    if (targetIndex < visibleTasksInTargetColumn.length) {
      const taskAtVisualIndex = visibleTasksInTargetColumn[targetIndex];
      actualIndex = targetColumn.taskIds.indexOf(taskAtVisualIndex);
    } else {
      actualIndex = targetColumn.taskIds.length;
    }

    // Dispatch move action
    dispatch(moveTask(activeId, targetColumnId, actualIndex));
  };

  const measuring = {
    droppable: {
      strategy: MeasuringStrategy.Always,
    },
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      measuring={measuring}
    >
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6">
        <div className="flex gap-4 md:gap-6 h-full min-h-[calc(100vh-180px)]">
          <SortableContext
            items={state.columns.map((col) => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            {state.columns.map((column) => {
              // Filter visible tasks for this column
              const visibleColumnTaskIds = column.taskIds.filter((id) =>
                visibleTaskIds.has(id)
              );

              return (
                <Column
                  key={column.id}
                  column={column}
                  tasks={visibleColumnTaskIds.map((id) => state.tasks[id]).filter(Boolean)}
                  onEditTask={onEditTask}
                  onDeleteColumn={onDeleteColumn}
                  totalTaskCount={column.taskIds.length}
                />
              );
            })}
          </SortableContext>
        </div>
      </div>

      {/* Drag overlay for smooth dragging experience */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeTask ? (
          <TaskCard task={activeTask} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
