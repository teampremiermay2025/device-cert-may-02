import { FC, useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, useSensor, useSensors, MouseSensor, TouchSensor, KeyboardSensor } from '@dnd-kit/core';
import { CertificationTask, TaskStatus } from '../types';
import { getTaskStatusColor, getTaskPriorityIcon, getTaskPriorityColor } from '../lib/workflow';

interface TaskBoardProps {
  tasks: CertificationTask[];
  onTaskUpdate: (task: CertificationTask) => void; // Updated to match ViewCertificationModal
  onTaskClick: (task: CertificationTask) => void;
}

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'REVIEW', title: 'Review' },
  { id: 'DONE', title: 'Done' }
];

const TaskCard: FC<{ task: CertificationTask; isDragging?: boolean }> = ({ task, isDragging }) => (
  <div
    className={`bg-white rounded-lg p-3 shadow-sm hover:shadow ${
      isDragging ? 'opacity-50' : ''
    } cursor-grab active:cursor-grabbing`}
  >
    <div className="flex items-start gap-2">
      <span className={`font-mono ${getTaskPriorityColor(task.priority)}`}>
        {getTaskPriorityIcon(task.priority)}
      </span>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">
          {task.name}
        </h4>
        {task.description && (
          <p className="text-sm text-gray-500 truncate mt-1">
            {task.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {task.labels.map(label => (
            <span
              key={label}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
    
    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
      <div className="flex items-center gap-2">
        {task.assignee && (
          <span>{task.assignee}</span>
        )}
        {task.dueDate && (
          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {task.comments.length > 0 && (
          <span>{task.comments.length} 💬</span>
        )}
        {task.attachments.length > 0 && (
          <span>{task.attachments.length} 📎</span>
        )}
      </div>
    </div>
  </div>
);

export const TaskBoard: FC<TaskBoardProps> = ({ tasks, onTaskUpdate, onTaskClick }) => {
  const [activeTask, setActiveTask] = useState<CertificationTask | null>(null);

  // Setup sensors for drag detection
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // Require a minimum drag distance to start
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Small delay for touch
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: any) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
    console.log('Drag started:', event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    console.log('Drag ended:', { active, over });
    
    if (over) {
      const taskId = active.id;
      const targetColumnId = over.id;
      const task = tasks.find(t => t.id === taskId);
      console.log('Attempting update:', { taskId, targetColumnId, taskExists: !!task, isColumn: columns.some(col => col.id === targetColumnId) });
      if (task && columns.some(col => col.id === targetColumnId) && task.status !== targetColumnId) {
        // Only update if status actually changes
        const updatedTask = {
          ...task,
          status: targetColumnId as TaskStatus
        };
        console.log('Updating task status to:', targetColumnId);
        onTaskUpdate(updatedTask); // Call onTaskUpdate with the updated task
      } else {
        console.log('Update skipped: Task not found, target is not a column, or status unchanged');
      }
    } else {
      console.log('No over target found');
    }
    
    setActiveTask(null);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    console.log('Drag over:', { activeId: active.id, overId: over?.id });
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <div className="flex gap-4 p-4 h-full" style={{ position: 'relative', zIndex: 1000, overflow: 'visible' }}>
        {columns.map(column => {
          const { setNodeRef } = useDroppable({
            id: column.id
          });
          
          const columnTasks = tasks.filter(task => task.status === column.id);
          
          return (
            <div key={column.id} className="flex-1 min-w-[300px] flex flex-col">
              <div className="bg-gray-100 rounded-lg p-4 h-full flex flex-col" style={{ position: 'relative', zIndex: 100, overflow: 'visible' }}>
                <h3 className="font-semibold mb-4 flex items-center justify-between">
                  {column.title}
                  <span className="text-sm text-gray-500">
                    {columnTasks.length}
                  </span>
                </h3>
                
                <div
                  ref={setNodeRef}
                  className="space-y-2 flex-1 overflow-y-auto border-2 border-dashed border-gray-300"
                  onMouseEnter={() => console.log(`Mouse entered column: ${column.id}`)}
                  style={{ position: 'relative', zIndex: 200, minHeight: '200px', overflow: 'visible' }}
                >
                  {columnTasks.map((task) => {
                    const { attributes, listeners, setNodeRef, transform } = useDraggable({
                      id: task.id,
                      data: task,
                    });
                    
                    return (
                      <div
                        key={task.id}
                        ref={setNodeRef}
                        style={{
                          transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
                          userSelect: 'none', // Prevent text selection during drag
                          position: 'relative',
                          zIndex: transform ? 300 : 100,
                          overflow: 'visible'
                        }}
                        {...listeners}
                        {...attributes}
                        onClick={() => onTaskClick(task)}
                        onMouseDown={() => console.log(`Mouse down on task: ${task.id}`)}
                      >
                        <TaskCard task={task} isDragging={activeTask?.id === task.id} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <DragOverlay style={{ zIndex: 10000 }}>
        {activeTask && <TaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
};