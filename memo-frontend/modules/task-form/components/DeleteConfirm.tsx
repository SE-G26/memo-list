'use client';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirm({ open, onClose, onConfirm }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">⚠️</span>
          <h3 className="text-lg font-semibold">正在删除任务！</h3>
        </div>
        <p className="text-gray-600 mb-6">
          任务及相关进度将被永久删除！
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border rounded-lg font-medium"
          >
            再想想
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}