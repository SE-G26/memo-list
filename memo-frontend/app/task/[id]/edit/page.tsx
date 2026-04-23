'use client';

import { useParams } from 'next/navigation';
import { TaskFormPage } from '@/modules/task-form/components/TaskFormPage';
import { useEffect, useState } from 'react';
import type { Task } from '@/shared/types/global';
import { fetchTaskById } from '@/shared/lib/task-api';

export default function EditTaskPage() {
  const params = useParams();
  const id = params.id as string;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchTaskById(id);
        if (!mounted) return;
        setTask(data);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : '任务不存在或加载失败');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">加载中...</div>;
  }

  if (!task) {
    return <div className="p-6 text-sm text-red-500">{error || '任务不存在'}</div>;
  }

  return <TaskFormPage task={task} />;
}
