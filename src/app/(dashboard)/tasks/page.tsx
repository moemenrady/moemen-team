"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  project?: { name: string } | null;
  assignee?: { name: string } | null;
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

const initialColumns: Record<string, Column> = {
  TODO: { id: "TODO", title: "مهام جديدة (To Do)", taskIds: [] },
  IN_PROGRESS: { id: "IN_PROGRESS", title: "قيد التنفيذ (In Progress)", taskIds: [] },
  IN_REVIEW: { id: "IN_REVIEW", title: "للمراجعة (In Review)", taskIds: [] },
  DONE: { id: "DONE", title: "مكتملة (Done)", taskIds: [] },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Record<string, TaskItem>>({});
  const [columns, setColumns] = useState<Record<string, Column>>(initialColumns);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data: TaskItem[]) => {
        if (!Array.isArray(data)) return;
        const newTasks: Record<string, TaskItem> = {};
        const newCols: Record<string, Column> = {
          TODO: { id: "TODO", title: "مهام جديدة (To Do)", taskIds: [] },
          IN_PROGRESS: { id: "IN_PROGRESS", title: "قيد التنفيذ (In Progress)", taskIds: [] },
          IN_REVIEW: { id: "IN_REVIEW", title: "للمراجعة (In Review)", taskIds: [] },
          DONE: { id: "DONE", title: "مكتملة (Done)", taskIds: [] },
        };
        data.forEach((task) => {
          newTasks[task.id] = task;
          if (newCols[task.status]) {
            newCols[task.status].taskIds.push(task.id);
          }
        });
        setTasks(newTasks);
        setColumns(newCols);
      })
      .catch((err) => console.error("Failed to load tasks", err));
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];
    if (!start || !finish) return;

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newColumn = { ...start, taskIds: newTaskIds };
      setColumns({ ...columns, [newColumn.id]: newColumn });
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...start, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finish, taskIds: finishTaskIds };

    setColumns({ ...columns, [newStart.id]: newStart, [newFinish.id]: newFinish });

    // Update API
    try {
      await fetch(`/api/tasks/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: finish.id }),
      });
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  return (
    <div className="p-6 rtl:text-right" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-emerald-900">المهام (Tasks Board)</h1>
        <button className="bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-emerald-800">
          <Plus size={20} />
          <span>مهمة جديدة</span>
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {Object.values(columns).map((column) => (
            <div key={column.id} className="bg-gray-50 rounded-lg p-4 min-w-[300px] flex-1">
              <h2 className="font-semibold text-gray-700 mb-4 flex justify-between">
                {column.title}
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {column.taskIds.length}
                </span>
              </h2>
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[200px]">
                    {column.taskIds.map((taskId, index) => {
                      const task = tasks[taskId];
                      if (!task) return null;
                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-4 rounded shadow-sm border mb-3 cursor-grab hover:shadow-md"
                            >
                              <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                              {task.project && (
                                <p className="text-xs text-gray-500 mb-3">{task.project.name}</p>
                              )}
                              <div className="flex justify-between items-center">
                                <span
                                  className={`text-xs px-2 py-1 rounded-md ${
                                    task.priority === "HIGH"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {task.priority}
                                </span>
                                {task.assignee && (
                                  <div
                                    className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs font-bold"
                                    title={task.assignee.name}
                                  >
                                    {task.assignee.name[0]}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
