import { useState, useCallback, useEffect, useMemo } from 'react';
import type { MasteryLevel, Task } from '@/shared/types/global';
import {
  completeTask,
  createTask,
  fetchTasks,
  patchTask,
  removeTask,
} from '@/shared/lib/task-api';

type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>;

export function useTasks(initialDate?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    initialDate || new Date().toISOString().split('T')[0]
  );

  const refreshTasks = useCallback(async () => {
    const latestTasks = await fetchTasks();
    setTasks(latestTasks);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshTasks();
  }, [refreshTasks]);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.dueDate === selectedDate),
    [tasks, selectedDate]
  );

  const addTask = useCallback(async (taskData: TaskInput) => {
    const task = await createTask(taskData);
    await refreshTasks();
    return task;
  }, [refreshTasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    await patchTask(id, updates);
    await refreshTasks();
  }, [refreshTasks]);

  const deleteTask = useCallback(async (id: string) => {
    await removeTask(id);
    await refreshTasks();
  }, [refreshTasks]);

  /*
  const toggleComplete = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.completed) {
      alert('已完成任务暂不支持取消勾选。');
      return;
    }

    if (task.isLearning) {
      const taskKind = task.taskKind || 'learning_source';

      if (taskKind === 'learning_review') {
        const input = window.prompt('请评估掌握度（good / okay / poor）', 'okay');
        if (!input) return;

        const normalized = input.trim().toLowerCase();
        const masteryMap: Record<string, MasteryLevel> = {
          good: 'good',
          okay: 'fair',
          fair: 'fair',
          poor: 'poor',
        };
        const mastery = masteryMap[normalized];

        if (!mastery) {
          alert('请输入 good、okay 或 poor。');
          return;
        }

        await completeTask(id, { mastery });
      } else {
        const learnedContent = window.prompt('请输入本次学习内容');
        if (!learnedContent || !learnedContent.trim()) {
          alert('学习任务完成时需要填写学习内容。');
          return;
        }
        await completeTask(id, { learnedContent: learnedContent.trim() });
      }
    } else {
      await completeTask(id, {});
    }

    await refreshTasks();
  }, [refreshTasks, tasks]);*/

  const handleCompleteTask = useCallback(async (
    id: string,
    options?: { learnedContent?: string; mastery?: MasteryLevel }
  ) => {
    await completeTask(id, options || {});
  }, []);


  return {
    tasks: filteredTasks,
    allTasks: tasks,
    selectedDate,
    setSelectedDate,
    addTask,
    updateTask,
    deleteTask,
    handleCompleteTask,
    refreshTasks,
  };
}
