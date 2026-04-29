'use client';

import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (content: string) => void;
  taskTitle: string;
}

export function LearningContentDialog({ open, onClose, onConfirm, taskTitle }: Props) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (open) setSubmitting(false);
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {  
    if (submitting) return;

    if (!content.trim()) {
      setError('请填写学习内容');
      return;
    }

    setSubmitting(true);
    setError('');
    onConfirm(content.trim());
    setContent('');
  };

  const handleClose = () => {
    //setSubmitting(false);
    setContent('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">填写学习内容</h3>
        </div>

        <p className="text-sm text-gray-500 mb-4 truncate">
          {taskTitle}
        </p>

        <input
          type="text"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (error) setError('');  // 输入时清除错误
          }}
          placeholder="例如: 背了15个单词"
          className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 outline-none mb-1 transition-all ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
          }`}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
          }}
        />

        {error && (
          <p className="text-xs text-red-500 mb-4 ml-1">{error}</p>
        )}
        {!error && <div className="mb-4" />}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 border rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            确认完成
          </button>
        </div>
      </div>
    </div>
  );
}