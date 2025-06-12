import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import Modal from './Modal';

interface QRCodeGeneratorProps {
  roomId: string;
  roomName: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ roomId, roomName }) => {
  const chatUrl = `${window.location.origin}/join?room=${roomId}`;
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(chatUrl);
      setModal({
        isOpen: true,
        title: '복사 완료',
        message: '링크가 클립보드에 복사되었습니다!'
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = chatUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setModal({
        isOpen: true,
        title: '복사 완료',
        message: '링크가 클립보드에 복사되었습니다!'
      });
    }
  };

  return (
    <div className="modern-card p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">강의룸 QR 코드</h2>
        <p className="text-gray-600">
          <span className="font-semibold">{roomName}</span>
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <QRCode
            value={chatUrl}
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 200 200`}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            참여 링크
          </label>
          <div className="flex">
            <input
              type="text"
              value={chatUrl}
              readOnly
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-full mr-2 bg-gray-50 text-sm focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="modern-btn modern-btn-warning modern-btn-sm rounded-l-none rounded-r-xl"
            >
              복사
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">사용 방법</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 참여자들이 QR 코드를 스캔하거나 링크를 클릭</li>
            <li>• 이름을 입력하고 강의룸에 입장</li>
            <li>• 실시간으로 대화 참여 가능</li>
          </ul>
        </div>
      </div>
      
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type="alert"
      />
    </div>
  );
};

export default QRCodeGenerator; 