import React, { useState } from 'react';

interface ConfirmationState {
  isOpen: boolean;
  message: string;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
}

export const useConfirmation = () => {
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  const showConfirmation = (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    setConfirmation({
      isOpen: true,
      message,
      onConfirm,
      onCancel: onCancel || null,
    });
  };

  const handleConfirm = () => {
    if (confirmation.onConfirm) {
      confirmation.onConfirm();
    }
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (confirmation.onCancel) {
      confirmation.onCancel();
    }
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  const ConfirmationModal: React.FC = () => {
    if (!confirmation.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Confirm Action
          </h3>
          <p className="text-gray-600 mb-6">{confirmation.message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return {
    showConfirmation,
    ConfirmationModal,
  };
};
