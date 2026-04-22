'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen, Calendar, Clock, Repeat } from 'lucide-react';
import { useTaskForm } from '../hooks/useTaskForm';
import { useTasks } from '@/modules/task-list/hooks/useTasks';
import { FrequencySelector } from './FrequencySelector';
import { TimePicker } from './TimePicker';
import { LearningConfirm } from './LearningConfirm';
import { DeleteConfirm } from './DeleteConfirm';
import type { Task } from '@/shared/types/global';

interface TaskFormPageProps {
  task?: Task;
  initialDate?: string;
}

export function TaskFormPage({ task, initialDate }: TaskFormPageProps) {
  const router = useRouter();
  const { addTask, updateTask, deleteTask } = useTasks();
  const isEdit = !!task;

  const { formData, updateField, validate, getSubmitData } = useTaskForm(task, initialDate);

  // 弹窗状态
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showLearningConfirm, setShowLearningConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const frequencyLabels: Record<string, string> = {
    once: '不重复',
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    weekdays: '工作日',
  };

  const handleToggleLearning = () => {
    if (!formData.isLearning) {
      setShowLearningConfirm(true);
    } else {
      updateField('isLearning', false);
    }
  };

  const handleSubmit = () => {
    if (!validate()) {
      alert('请填写任务标题');
      return;
    }

    const submitData = getSubmitData();

    if (isEdit) {
      updateTask(task.id, submitData);
    } else {
      addTask(submitData);
    }

    router.push(`/?date=${formData.dueDate}`);
  };

  const handleDelete = () => {
    if (isEdit) {
      deleteTask(task.id);
    }
    router.push(`/?date=${formData.dueDate}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="container mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/?date=${formData.dueDate}`}
             className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            {/*<h1 className="text-lg font-semibold text-gray-900">
              {isEdit ? '编辑任务' : '新建任务'}
            </h1>
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors"
            >
              保存
            </button>*/}
          </div>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-6">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              任务标题
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="例如：背单词、复习笔记..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* 频率 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              重复频率
            </label>
            <button
              onClick={() => setShowFrequencyPicker(true)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Repeat className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{frequencyLabels[formData.frequency]}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* 提醒时间 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              提醒时间
            </label>
            <button
              onClick={() => setShowTimePicker(true)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className={formData.reminderTime ? 'text-gray-900' : 'text-gray-400'}>
                  {formData.reminderTime || '不提醒'}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* 学习任务开关 */}
          <div className="py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-gray-900 font-medium">学习任务</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    开启后系统将自动安排复习
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleLearning}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.isLearning ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    formData.isLearning ? 'translate-x-6.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="添加一些备注..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none transition-all"
            />
          </div>

          {/* 日期选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              任务日期
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-11 text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {formData.frequency === 'once'
                ? '单次任务会安排在所选日期'
                : `将按「${frequencyLabels[formData.frequency]}」从所选日期开始重复`}
            </p>
          </div>

          {/* 底部按钮组 */}
          <div className="pt-4 space-y-3">
            <button
              onClick={handleSubmit}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              {isEdit ? '保存修改' : '创建任务'}
            </button>

            {isEdit && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full rounded-xl border border-red-200 py-3.5 text-red-600 font-medium hover:bg-red-50 transition-colors"
              >
                删除任务
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 弹窗 */}
      <FrequencySelector
        open={showFrequencyPicker}
        onClose={() => setShowFrequencyPicker(false)}
        value={formData.frequency}
        onChange={(freq) => updateField('frequency', freq)}
      />

      <TimePicker
        open={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        value={formData.reminderTime}
        onChange={(time) => updateField('reminderTime', time)}
      />

      <LearningConfirm
        open={showLearningConfirm}
        onClose={() => setShowLearningConfirm(false)}
        onConfirm={() => {
          updateField('isLearning', true);
          setShowLearningConfirm(false);
        }}
      />

      <DeleteConfirm
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
