'use client';

import { useState, useCallback } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import Link from 'next/link';
import { CalendarDays, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface TaskListPageProps {
  initialDate?: string;
}

export function TaskListPage({ initialDate }: TaskListPageProps) {
  const { tasks, selectedDate, setSelectedDate, toggleComplete } = useTasks(initialDate);

  const [today] = useState(() => new Date().toISOString().split('T')[0]);

  // 日期切换
  const goToPrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next.toISOString().split('T')[0]);
  };

  // 格式化显示日期
  const formatDisplayDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];
    
    let label = `${month}月${day}日 ${weekDay}`;
    if (dateStr === today) label += ' · 今天';
    
    return label;
  }, [today]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      {/* 日期切换 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevDay}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-medium text-gray-900">
          {formatDisplayDate(selectedDate)}
        </h2>
        <button
          onClick={goToNextDay}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* 鼓励标语区域 */}
      <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-center dark:from-blue-950 dark:to-indigo-950">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
          坚持复习，知识长青 🌱
        </p>
        <Link
          href="/calendar"
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-sm text-blue-700 transition-colors hover:bg-white"
        >
          <CalendarDays className="h-4 w-4" />
          日历视图
        </Link>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <EmptyState selectedDate={selectedDate} />
        ) : (
          tasks.map((task) => (  //遍历
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={toggleComplete}
            />
          ))
        )}
      </div>

      {/* 底部添加按钮 */}
      <Link href={`/task/new?date=${selectedDate}`}>
        <button className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" />
          添加新任务
        </button>
      </Link>
    </div>
  );
}
