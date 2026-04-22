import { useState, useCallback, useEffect } from 'react';
import type { Task } from '@/shared/types/global';
import {
  loadTasks,
  addTaskToStorage,
  updateTaskInStorage,
  deleteTaskFromStorage,
} from '@/shared/lib/storage';

type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>;

export function useTasks(initialDate?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  //const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [selectedDate, setSelectedDate] = useState(
    initialDate || new Date().toISOString().split('T')[0]
  );

  // 按日期过滤
  const filteredTasks = tasks.filter((task) => task.dueDate === selectedDate);

  // 生成 ID
  const generateId = () => `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 添加任务
  const addTask = useCallback((taskData: TaskInput) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    const newTasks = addTaskToStorage(newTask);
    setTasks(newTasks);
    return newTask;
  }, []);

  // 更新任务
  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    const fullUpdates = { ...updates, updatedAt: new Date().toISOString() };
    const newTasks = updateTaskInStorage(id, fullUpdates);
    setTasks(newTasks);
  }, []);

  // 删除任务
  const deleteTask = useCallback((id: string) => {
    const newTasks = deleteTaskFromStorage(id);
    setTasks(newTasks);
  }, []);

  // 切换完成状态
  const toggleComplete = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newTasks = updateTaskInStorage(id, {
      completed: !task.completed,
      updatedAt: new Date().toISOString(),
    });
    setTasks(newTasks);
  }, [tasks]);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    selectedDate,
    setSelectedDate,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
  };
}
