'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTaskStore } from '@/store/useTaskStore';
import { ITask, Status } from '@/types/task';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

export const KanbanBoard: React.FC = () => {
  const { tasks, searchQuery, selectedPriority, selectedTag, moveTaskOptimistically } = useTaskStore();
  const [activeTask, setActiveTask] = useState<ITask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter tasks according to user search, priority, and tag selections
  const filteredTasks = tasks.filter((task) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description ? task.description.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchDesc) return false;
    }

    if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
      return false;
    }

    if (selectedTag !== 'all' && (!task.tags || !task.tags.includes(selectedTag))) {
      return false;
    }

    return true;
  });

  const columns: Status[] = ['todo', 'in_progress', 'done'];

  const getTasksByStatus = (status: Status) => {
    return filteredTasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Find the task being dragged
    const activeTaskItem = tasks.find((t) => t._id === activeId);
    if (!activeTaskItem) return;

    // Check if dropping over a column status directly
    if (columns.includes(overId as Status)) {
      const targetStatus = overId as Status;
      if (activeTaskItem.status !== targetStatus) {
        const columnTasks = getTasksByStatus(targetStatus);
        moveTaskOptimistically(activeId, targetStatus, columnTasks.length);
      }
      return;
    }

    // Check if dropping over another task card
    const overTaskItem = tasks.find((t) => t._id === overId);
    if (overTaskItem && activeTaskItem.status !== overTaskItem.status) {
      const targetStatus = overTaskItem.status;
      const columnTasks = getTasksByStatus(targetStatus);
      const overIndex = columnTasks.findIndex((t) => t._id === overId);
      moveTaskOptimistically(activeId, targetStatus, overIndex >= 0 ? overIndex : columnTasks.length);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const activeTaskItem = tasks.find((t) => t._id === activeId);
    if (!activeTaskItem) return;

    if (columns.includes(overId as Status)) {
      const targetStatus = overId as Status;
      const columnTasks = getTasksByStatus(targetStatus);
      moveTaskOptimistically(activeId, targetStatus, columnTasks.length);
      return;
    }

    const overTaskItem = tasks.find((t) => t._id === overId);
    if (overTaskItem) {
      const targetStatus = overTaskItem.status;
      const columnTasks = getTasksByStatus(targetStatus);
      const overIndex = columnTasks.findIndex((t) => t._id === overId);
      moveTaskOptimistically(activeId, targetStatus, overIndex >= 0 ? overIndex : columnTasks.length);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {columns.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={getTasksByStatus(status)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};
