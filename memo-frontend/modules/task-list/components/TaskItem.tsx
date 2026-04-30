'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { Task } from '@/shared/types/global';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
}

export function TaskItem({ task, onToggleComplete }: TaskItemProps) {
  return (
    <Link href={`/task/${task.id}/edit?from=list`}>
      <div className="flex items-center gap-3 rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer">
        {/* 复选框 - 阻止链接跳转 */}
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }} 
          className="flex-shrink-0"
        >
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task.id)}
          />
        </div>

        {/* 内容区域 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-medium truncate ${
                task.completed ? 'text-gray-400 line-through' : 'text-gray-900'
              }`}
            >
              {task.title}
              {task.learningContent && ` · ${task.learningContent}`}
            </span>
          </div>
          {task.notes && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">{task.notes}</p>
          )}
        </div>

        {/* 第三块：学习图标 */}
        {task.isLearning && (
          <BookOpen className="h-4 w-4 text-blue-500 flex-shrink-0 mr-3" />
        )}
      </div>
    </Link>
  );
}