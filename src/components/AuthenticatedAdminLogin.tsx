import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserRooms } from '../hooks/useUserRooms';
import UserProfile from './UserProfile';
import Modal from './Modal';
import { 
  UserIcon,
  ChatBubbleLeftRightIcon, 
  LockClosedIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface AuthenticatedAdminLoginProps {
  onRoomCreated: (roomId: string, roomName: string, adminName: string) => void;
}

const AuthenticatedAdminLogin: React.FC<AuthenticatedAdminLoginProps> = ({ onRoomCreated }) => {
  const { currentUser, authUser } = useAuth();
  const { rooms, loading: roomsLoading, createRoom, deleteRoom } = useUserRooms();
  
  const [roomName, setRoomName] = useState('');
  const [adminName, setAdminName] = useState(authUser?.displayName || '');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [showProfile, setShowProfile] = useState(false);
  
  // 모달 상태
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'confirm' | 'alert' | 'password';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: ''
  });
  
  // 채팅룸 입장 관련 상태
  const [modalAdminName, setModalAdminName] = useState('');
  const [modalAdminNameError, setModalAdminNameError] = useState('');
  const [pendingAction, setPendingAction] = useState<{
    type: 'delete' | 'enter';
    roomId: string;
    roomName: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !adminName.trim() || !adminPassword.trim()) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    // 채팅룸 개수 제한 확인 (최대 3개)
    if (rooms.length >= 3) {
      setError('최대 3개의 채팅룸만 생성할 수 있습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const roomId = await createRoom(roomName.trim(), adminName.trim(), adminPassword.trim());
      onRoomCreated(roomId, roomName.trim(), adminName.trim());
      
      // 폼 초기화
      setRoomName('');
      setAdminPassword('');
    } catch (error) {
      setError('강의룸 생성에 실패했습니다. 다시 시도해주세요.');
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string, roomName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setModal({
      isOpen: true,
      type: 'confirm',
      title: '강의룸 삭제',
      message: `"${roomName}" 강의룸을 삭제하시겠습니까?`,
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
    // 회원 시스템에서는 본인 소유 방이므로 바로 입장 가능
    // 하지만 기존 호환성을 위해 관리자 이름 입력받기
    setModalAdminName(authUser?.displayName || '');
    setModalAdminNameError('');
    setModal({
      isOpen: true,
      type: 'password',
      title: '채팅룸 입장',
      message: `"${roomName}" 채팅룸에 관리자로 입장하세요.`
    });
    setPendingAction({ type: 'enter', roomId, roomName });
  };

  const handlePasswordConfirm = async () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'enter') {
      if (!modalAdminName.trim()) {
        setModalAdminNameError('관리자 이름을 입력해주세요.');
        return;
      }
      
      // 본인 소유 방이므로 바로 입장
      onRoomCreated(pendingAction.roomId, pendingAction.roomName, modalAdminName.trim());
      
      // 상태 초기화
      setPendingAction(null);
      setModalAdminName('');
      setModalAdminNameError('');
    }
  };

  const handleModalClose = () => {
    setModal({ 
      isOpen: false, 
      type: 'confirm',
      title: '',
      message: '',
      onConfirm: undefined 
    });
    setPendingAction(null);
    setModalAdminName('');
    setModalAdminNameError('');
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

  if (!currentUser || !authUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 relative">
      {/* 프로필 버튼 */}
      <button
        onClick={() => setShowProfile(true)}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white/90 text-blue-700 shadow-md backdrop-blur-sm border border-blue-200/50 transition-all duration-200"
        title="프로필"
      >
        <UserIcon className="w-5 h-5" />
      </button>

      <div className="p-8 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="/logo.webp" 
              alt="MUNE Logo" 
              className="w-10 h-10 object-contain bg-white rounded-full"
            />
            <h1 className="text-3xl font-bold text-blue-900 drop-shadow-sm">MUNE</h1>
          </div>
          <p className="bg-black rounded-full px-2 py-1 w-fit mx-auto px-5 text-xs text-white mt-1">안녕하세요, {authUser.displayName}님!</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="tab-container">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`tab-button ${activeTab === 'create' ? 'active' : 'inactive'}`}
          >
            채팅룸 생성
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`tab-button ${activeTab === 'manage' ? 'active' : 'inactive'}`}
          >
            내 채팅룸 ({rooms.length})
          </button>
        </div>

        {/* 채팅룸 생성 탭 */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* 채팅룸 개수 정보 */}
            <div className="bg-blue-50/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-900">채팅룸 생성 현황</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    현재 <span className="font-semibold">{rooms.length}</span>개 / 최대 <span className="font-semibold">3</span>개
                  </p>
                </div>
                <div className="flex space-x-1">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < rooms.length ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {rooms.length >= 3 && (
                <div className="mt-3 p-2 bg-yellow-100 rounded-md">
                  <p className="text-xs text-yellow-800">
                    ⚠️ 최대 개수에 도달했습니다. 새 채팅룸을 만들려면 기존 채팅룸을 삭제해주세요.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="roomName" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
                <div className="flex items-center space-x-1">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span>채팅룸 이름</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
                  placeholder="예: 라이프오브파이 바이브 코딩 연수"
                  disabled={loading}
                />
                <ChatBubbleLeftRightIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="adminName" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
                <div className="flex items-center space-x-1">
                  <UserIcon className="w-4 h-4" />
                  <span>강의자 이름</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="adminName"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
                  placeholder="채팅에서 표시될 이름"
                  disabled={loading}
                  maxLength={20}
                />
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
                <div className="flex items-center space-x-1">
                  <LockClosedIcon className="w-4 h-4" />
                  <span>채팅룸 비밀번호</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
                  placeholder="참여자들이 입장시 입력할 비밀번호"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {error && (
              <div className="bg-red-100/80 backdrop-blur-sm border border-red-300/50 rounded-md p-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || rooms.length >= 3}
              className="w-full modern-btn modern-btn-primary py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-2">
                <PlusIcon className="w-5 h-5" />
                <span>{loading ? '생성 중...' : rooms.length >= 3 ? '최대 개수 도달' : '채팅룸 생성'}</span>
              </div>
            </button>
          </form>
          </div>
        )}

        {/* 내 채팅룸 관리 탭 */}
        {activeTab === 'manage' && (
          <div>
            {roomsLoading ? (
              <div className="text-center py-8">
                <div className="text-blue-700 font-medium">로딩 중...</div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-blue-700 font-medium mb-2">생성된 채팅룸이 없습니다</div>
                <p className="text-sm text-blue-600">먼저 채팅룸을 생성해보세요</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {rooms.map((room) => (
                  <div 
                    key={room.id} 
                    className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50 cursor-pointer hover:bg-white/80 hover:border-blue-300/70 transition-all duration-200 shadow-sm hover:shadow-md"
                    onClick={() => handleRoomClick(room.id, room.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-blue-900 truncate">
                          {room.name}
                        </h3>
                        <p className="text-xs text-blue-600 mt-1">
                          {formatDate(room.createdAt)}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            room.isActive 
                              ? 'bg-green-100/80 text-green-800 border border-green-200/50' 
                              : 'bg-gray-100/80 text-gray-700 border border-gray-200/50'
                          }`}>
                            {room.isActive ? '활성' : '비활성'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteRoom(room.id, room.name, e)}
                        className="ml-3 modern-btn modern-btn-warning modern-btn-sm bg-red-500/80 hover:bg-red-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                        title="채팅룸 삭제"
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
        <p className="text-sm text-blue-600/80 text-center drop-shadow-sm">
        🌿 제작 : <span className="font-medium text-blue-700">라이프오브파이 Lab</span>
        </p>
      </div>
      
      {/* 프로필 모달 */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
      
      {/* 기존 모달 (확인/알림) */}
      {modal.type !== 'password' && (
        <Modal
          isOpen={modal.isOpen}
          onClose={handleModalClose}
          onConfirm={modal.onConfirm}
          title={modal.title}
          message={modal.message}
          type={modal.type}
        />
      )}

      {/* 채팅룸 입장 모달 */}
      {modal.type === 'password' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{modal.title}</h3>
              <p className="text-gray-600 mb-4">{modal.message}</p>
              
              <form onSubmit={(e) => { e.preventDefault(); handlePasswordConfirm(); }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="modalAdminNameInput" className="block text-sm font-medium text-gray-700 mb-2">
                      관리자 이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="modalAdminNameInput"
                      value={modalAdminName}
                      onChange={(e) => {
                        setModalAdminName(e.target.value);
                        setModalAdminNameError('');
                      }}
                      className="w-full px-4 py-2 modern-input"
                      placeholder="채팅에서 표시될 이름"
                      maxLength={20}
                    />
                    {modalAdminNameError && (
                      <p className="text-sm text-red-600 mt-1">{modalAdminNameError}</p>
                    )}
                  </div>
                
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleModalClose}
                      className="flex-1 modern-btn modern-btn-secondary p-2"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="flex-1 modern-btn modern-btn-primary p-2"  
                      disabled={!modalAdminName.trim()}
                    >
                      입장
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticatedAdminLogin;
