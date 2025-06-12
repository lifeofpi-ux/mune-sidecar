import React, { useState } from 'react';
import { useChatRoom, useRoomList } from '../hooks/useChat';
import Modal from './Modal';

interface AdminLoginProps {
  onRoomCreated: (roomId: string, roomName: string, adminName: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onRoomCreated }) => {
  const [roomName, setRoomName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'confirm' | 'alert';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: ''
  });

  const { createRoom } = useChatRoom();
  const { rooms, loading: roomsLoading, deleteRoom } = useRoomList();

  const handleDeleteRoom = async (roomId: string, roomName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    setModal({
      isOpen: true,
      type: 'confirm',
      title: '강의룸 삭제',
      message: `"${roomName}" 강의룸을 삭제하시겠습니까?\n모든 채팅 기록이 함께 삭제됩니다.`,
      onConfirm: async () => {
        try {
          await deleteRoom(roomId);
          setModal({
            isOpen: true,
            type: 'alert',
            title: '삭제 완료',
            message: '강의룸이 삭제되었습니다.'
          });
        } catch (error) {
          setModal({
            isOpen: true,
            type: 'alert',
            title: '삭제 실패',
            message: '강의룸 삭제에 실패했습니다. 다시 시도해주세요.'
          });
          console.error('Error deleting room:', error);
        }
      }
    });
  };

  const handleRoomClick = (roomId: string, roomName: string) => {
    // 관리자 권한으로 해당 강의룸에 입장
    const speakerName = adminName.trim() || '강의자'; // 입력된 이름이 있으면 사용, 없으면 기본값
    onRoomCreated(roomId, roomName, speakerName);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !adminName.trim() || !adminPassword.trim()) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const roomId = await createRoom(roomName.trim(), adminPassword.trim());
      onRoomCreated(roomId, roomName.trim(), adminName.trim());
    } catch (error) {
      setError('강의룸 생성에 실패했습니다. 다시 시도해주세요.');
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 relative">
      <div className="modern-card p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MUNE</h1>
          <p className="text-gray-600">강의 룸 관리</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="tab-container">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`tab-button ${activeTab === 'create' ? 'active' : 'inactive'}`}
          >
            강의룸 생성
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`tab-button ${activeTab === 'manage' ? 'active' : 'inactive'}`}
          >
            기존 강의룸
          </button>
        </div>

        {/* 강의룸 생성 탭 */}
        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
              강의룸 이름
            </label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-3 modern-input"
              placeholder="예: 2025 트라이팟 컨퍼런스"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-2">
              강의자 이름
            </label>
            <input
              type="text"
              id="adminName"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full px-4 py-3 modern-input"
              placeholder="예: 김강의"
              disabled={loading}
              maxLength={20}
            />
          </div>

          <div>
            <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
              관리자 비밀번호
            </label>
            <input
              type="password"
              id="adminPassword"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-3 modern-input"
              placeholder="관리자 비밀번호를 입력하세요"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

            <button
              type="submit"
              disabled={loading}
              className="w-full modern-btn modern-btn-primary modern-btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '생성 중...' : '강의룸 생성'}
            </button>
          </form>
        )}

                {/* 기존 강의룸 관리 탭 */}
        {activeTab === 'manage' && (
          <div>
            {roomsLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">로딩 중...</div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">생성된 강의룸이 없습니다</div>
                <p className="text-sm text-gray-400">먼저 강의룸을 생성해보세요</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {rooms.map((room) => (
                  <div 
                    key={room.id} 
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleRoomClick(room.id, room.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {room.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(room.createdAt)}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            room.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {room.isActive ? '활성' : '비활성'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteRoom(room.id, room.name, e)}
                        className="ml-3 modern-btn modern-btn-warning modern-btn-sm"
                        title="강의룸 삭제"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 크레딧 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-sm text-gray-500 text-center">
          제작 <span className="font-medium text-gray-600">@라이프오브파이</span>
        </p>
      </div>
      
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default AdminLogin; 