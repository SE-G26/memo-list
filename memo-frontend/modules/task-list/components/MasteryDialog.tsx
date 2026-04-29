'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (mastery: 'good' | 'fair' | 'poor') => void;
  taskTitle: string;
  learningContent?: string;
}

const options = [
  { value: 'good' as const, label: '好', desc: '下次复习间隔延长' },
  { value: 'fair' as const, label: '一般', desc: '保持原间隔' },
  { value: 'poor' as const, label: '差', desc: '下次复习间隔缩短' },
];

export function MasteryDialog({ open, onClose, onConfirm, taskTitle, learningContent }: Props) {
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (open) setSubmitting(false);
  }, [open]);

  if (!open) return null;

  const handleConfirm = (value: 'good' | 'fair' | 'poor') => {
    if (submitting) return;
    setSubmitting(true);
    onConfirm(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">评估掌握程度</h3>
        </div>

        <p className="text-gray-900 font-medium mb-1 truncate">{taskTitle}</p>
        {learningContent && (
          <p className="text-sm text-gray-500 mb-4 truncate">{learningContent}</p>
        )}

        <div className="space-y-2 mb-6">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleConfirm(opt.value)}
              className="w-full py-3 px-4 rounded-xl border border-gray-200 text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <span className="font-medium text-gray-900">{opt.label}</span>
              <span className="text-sm text-gray-500 ml-2">{opt.desc}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 border rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
}