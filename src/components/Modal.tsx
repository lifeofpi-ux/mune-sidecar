import React, { useEffect, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'confirm' | 'alert';
  confirmText?: string;
  cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'alert',
  confirmText = '확인',
  cancelText = '취소'
}) => {
  if (!isOpen) return null;

  const handleConfirm = useCallback(() => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  }, [onConfirm, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleConfirm, handleCancel]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="modern-card p-6 w-full max-w-sm mx-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {title}
          </h3>
          <p className="text-gray-600 mb-6 whitespace-pre-line">
            {message}
          </p>
          
          <div className="flex gap-3 justify-center">
            {type === 'confirm' && (
              <button
                onClick={handleCancel}
                className="modern-btn modern-btn-secondary modern-btn-sm px-6"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`modern-btn modern-btn-sm px-6 ${
                type === 'confirm' ? 'modern-btn-warning' : 'modern-btn-primary'
              }`}
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal; 