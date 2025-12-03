import React, { useState, useEffect } from 'react';
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

  // 비밀번호 입력 관련 상태
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [modalAdminName, setModalAdminName] = useState('');
  const [modalAdminNameError, setModalAdminNameError] = useState('');
  const [pendingAction, setPendingAction] = useState<{
    type: 'delete' | 'enter';
    roomId: string;
    roomName: string;
  } | null>(null);

  // 슈퍼 관리자 관련 상태
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  const [superAdminError, setSuperAdminError] = useState('');
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);

  // 초기 관리자 인증 관련 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const { createRoom, verifyAdminPassword } = useChatRoom();
  const { rooms, loading: roomsLoading, deleteRoom } = useRoomList();

  // 슈퍼 관리자 비밀번호 (실제 환경에서는 환경변수나 보안 저장소 사용 권장)
  const SUPER_ADMIN_PASSWORD = 'mune2025super';

  // 초기 관리자 인증 비밀번호
  const ADMIN_AUTH_PASSWORD = 'tripod25!';

  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (isAdminAuthenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // 초기 관리자 인증 처리
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPassword === ADMIN_AUTH_PASSWORD) {
      localStorage.setItem('isAdminAuthenticated', 'true');
      setIsAuthenticated(true);
      setAuthPassword('');
      setAuthError('');
    } else {
      setAuthError('비밀번호가 올바르지 않습니다.');
    }
  };

  // 슈퍼 관리자 로그인 처리
  const handleSuperAdminLogin = () => {
    if (superAdminPassword === SUPER_ADMIN_PASSWORD) {
      setIsSuperAdmin(true);
      setShowSuperAdminModal(false);
      setSuperAdminPassword('');
      setSuperAdminError('');
    } else {
      setSuperAdminError('슈퍼 관리자 비밀번호가 올바르지 않습니다.');
    }
  };

  // 슈퍼 관리자 로그아웃
  const handleSuperAdminLogout = () => {
    setIsSuperAdmin(false);
  };

  // 설정 버튼 클릭
  const handleSettingsClick = () => {
    if (isSuperAdmin) {
      handleSuperAdminLogout();
    } else {
      setShowSuperAdminModal(true);
      setSuperAdminPassword('');
      setSuperAdminError('');
    }
  };

  const handleDeleteRoom = async (roomId: string, roomName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지

    // 슈퍼 관리자인 경우 바로 삭제
    if (isSuperAdmin) {
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
      return;
    }

    // 일반 관리자인 경우 비밀번호 입력 모달 표시
    setPendingAction({ type: 'delete', roomId, roomName });
    setPasswordInput('');
    setPasswordError('');
    setModal({
      isOpen: true,
      type: 'password',
      title: '강의룸 삭제',
      message: `"${roomName}" 강의룸을 삭제하려면 관리자 비밀번호를 입력하세요.`
    });
  };

  const handleRoomClick = (roomId: string, roomName: string) => {
    // 슈퍼 관리자인 경우 이름만 입력받고 바로 입장
    if (isSuperAdmin) {
      setModalAdminName('');
      setModalAdminNameError('');
      setModal({
        isOpen: true,
        type: 'password',
        title: '슈퍼 관리자 입장',
        message: `"${roomName}" 강의룸에 슈퍼 관리자로 입장하세요.`
      });
      setPendingAction({ type: 'enter', roomId, roomName });
      setPasswordInput('super'); // 슈퍼 관리자 표시용
      setPasswordError('');
      return;
    }

    // 일반 관리자 입장 시 비밀번호 및 이름 입력 모달 표시
    setPendingAction({ type: 'enter', roomId, roomName });
    setPasswordInput('');
    setPasswordError('');
    setModalAdminName('');
    setModalAdminNameError('');
    setModal({
      isOpen: true,
      type: 'password',
      title: '관리자 입장',
      message: `"${roomName}" 강의룸에 관리자로 입장하세요.`
    });
  };

  const handlePasswordConfirm = async () => {
    if (!pendingAction) {
      return;
    }

    // 관리자 입장 시에는 이름도 검증
    if (pendingAction.type === 'enter' && !modalAdminName.trim()) {
      setModalAdminNameError('강의자 이름을 입력해주세요.');
      return;
    }

    try {
      // 슈퍼 관리자인 경우 비밀번호 검증 생략
      if (isSuperAdmin && pendingAction.type === 'enter') {
        // 슈퍼 관리자로 해당 강의룸에 입장
        onRoomCreated(pendingAction.roomId, pendingAction.roomName, modalAdminName.trim());

        // 상태 초기화
        setPendingAction(null);
        setPasswordInput('');
        setPasswordError('');
        setModalAdminName('');
        setModalAdminNameError('');
        return;
      }

      // 일반 관리자인 경우 비밀번호 검증
      if (!passwordInput.trim()) {
        setPasswordError('비밀번호를 입력해주세요.');
        return;
      }

      // 비밀번호 검증
      const isValidPassword = await verifyAdminPassword(pendingAction.roomId, passwordInput.trim());

      if (!isValidPassword) {
        setPasswordError('비밀번호가 올바르지 않습니다.');
        return;
      }

      // 비밀번호가 올바른 경우 해당 액션 실행
      if (pendingAction.type === 'delete') {
        try {
          await deleteRoom(pendingAction.roomId);
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
      } else if (pendingAction.type === 'enter') {
        // 관리자 권한으로 해당 강의룸에 입장 (모달에서 입력받은 이름 사용)
        onRoomCreated(pendingAction.roomId, pendingAction.roomName, modalAdminName.trim());
      }

      // 상태 초기화
      setPendingAction(null);
      setPasswordInput('');
      setPasswordError('');
      setModalAdminName('');
      setModalAdminNameError('');

    } catch (error) {
      setPasswordError('비밀번호 확인 중 오류가 발생했습니다.');
      console.error('Error verifying password:', error);
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
    setPasswordInput('');
    setPasswordError('');
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

  // 인증되지 않은 경우 비밀번호 입력 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="p-8 w-full max-w-[400px]">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-0.5 mb-2">
              <img
                src="/logo.webp"
                alt="MUNE Logo"
                className="w-12 h-12 object-contain bg-white rounded-full"
              />
              <h1 className="text-3xl font-bold text-blue-900 drop-shadow-sm">MUNE</h1>
            </div>
            <p className="text-blue-700 font-medium">관리자 인증</p>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-6">
            <div>
              <label htmlFor="authPassword" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
                뮨 인증 키워드
              </label>
              <input
                type="password"
                id="authPassword"
                value={authPassword}
                onChange={(e) => {
                  setAuthPassword(e.target.value);
                  setAuthError('');
                }}
                className="w-full px-4 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
                placeholder="키워드를 입력하세요"
                autoComplete="current-password"
              />
            </div>

            {authError && (
              <div className="bg-red-100/80 backdrop-blur-sm border border-red-300/50 rounded-md p-3">
                <p className="text-sm text-red-700 font-medium">{authError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full modern-btn modern-btn-primary py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!authPassword.trim()}
            >
              로그인
            </button>
          </form>

          {/* 회원 시스템 안내 */}
          <div className="mt-8 p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200/50">
            <h3 className="text-sm font-medium text-blue-900 mb-2">새로운 회원 시스템</h3>
            <p className="text-xs text-blue-700 mb-3">
              이제 회원가입을 통해 본인만의 채팅룸을 체계적으로 관리할 수 있습니다.
            </p>
            <div className="flex space-x-2">
              <a
                href="/signin"
                className="flex-1 text-center py-2 px-3 text-xs font-medium text-blue-700 bg-white/80 border border-blue-300/50 rounded-md hover:bg-white transition-colors"
              >
                로그인
              </a>
              <a
                href="/signup"
                className="flex-1 text-center py-2 px-3 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                회원가입
              </a>
            </div>
          </div>
        </div>

        {/* 크레딧 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <p className="text-sm text-blue-600/80 text-center drop-shadow-sm">
            <span className="font-medium text-blue-700">©VIVAMUNE</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 relative">
      {/* 설정 버튼 */}
      <button
        onClick={handleSettingsClick}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${isSuperAdmin
          ? 'bg-red-500/90 hover:bg-red-600 text-white shadow-lg backdrop-blur-sm'
          : 'bg-white/80 hover:bg-white/90 text-blue-700 shadow-md backdrop-blur-sm border border-blue-200/50'
          }`}
        title={isSuperAdmin ? '슈퍼 관리자 로그아웃' : '슈퍼 관리자 로그인'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <div className="p-8 w-full max-w-[400px]">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-0.5 mb-2">
            <img
              src="/logo.webp"
              alt="MUNE Logo"
              className="w-12 h-12 object-contain bg-white rounded-full"
            />
            <h1 className="text-3xl font-bold text-blue-900 drop-shadow-sm">MUNE</h1>
            {isSuperAdmin && (
              <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                SUPER
              </span>
            )}
          </div>
          <p className="text-blue-700 font-medium">
            {isSuperAdmin ? '슈퍼 관리자 모드' : '채널 관리'}
          </p>
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
              <label htmlFor="roomName" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
                강의룸 이름
              </label>
              <input
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-4 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
                placeholder="예: 2025 트라이팟 컨퍼런스"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="adminName" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
                강의자 이름
              </label>
              <input
                type="text"
                id="adminName"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-4 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
                placeholder="예: 김강의"
                disabled={loading}
                maxLength={20}
              />
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
                관리자 비밀번호
              </label>
              <input
                type="password"
                id="adminPassword"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
                placeholder="관리자 비밀번호를 입력하세요"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-100/80 backdrop-blur-sm border border-red-300/50 rounded-md p-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full modern-btn modern-btn-primary py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="text-blue-700 font-medium">로딩 중...</div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-blue-700 font-medium mb-2">생성된 강의룸이 없습니다</div>
                <p className="text-sm text-blue-600">먼저 강의룸을 생성해보세요</p>
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
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${room.isActive
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
        <p className="text-sm text-blue-600/80 text-center drop-shadow-sm">
          <span className="font-medium text-blue-700">©VIVAMUNE</span>
        </p>
      </div>

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

      {/* 슈퍼 관리자 로그인 모달 */}
      {showSuperAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">슈퍼 관리자 로그인</h3>
              <p className="text-gray-600 mb-4">슈퍼 관리자 비밀번호를 입력하세요.</p>

              <form onSubmit={(e) => { e.preventDefault(); handleSuperAdminLogin(); }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="superAdminPasswordInput" className="block text-sm font-medium text-gray-700 mb-2">
                      슈퍼 관리자 비밀번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="superAdminPasswordInput"
                      value={superAdminPassword}
                      onChange={(e) => {
                        setSuperAdminPassword(e.target.value);
                        setSuperAdminError('');
                      }}
                      className="w-full px-4 py-2 modern-input"
                      placeholder="슈퍼 관리자 비밀번호"
                      autoComplete="current-password"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSuperAdminLogin();
                        }
                      }}
                    />
                    {superAdminError && (
                      <p className="text-sm text-red-600 mt-1">{superAdminError}</p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSuperAdminModal(false);
                        setSuperAdminPassword('');
                        setSuperAdminError('');
                      }}
                      className="flex-1 modern-btn modern-btn-secondary p-2"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="flex-1 modern-btn modern-btn-primary p-2"
                      disabled={!superAdminPassword.trim()}
                    >
                      로그인
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 입력 모달 */}
      {modal.type === 'password' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{modal.title}</h3>
              <p className="text-gray-600 mb-4">{modal.message}</p>

              <form onSubmit={(e) => { e.preventDefault(); handlePasswordConfirm(); }}>
                <div className="space-y-4">
                  {pendingAction?.type === 'enter' && (
                    <div>
                      <label htmlFor="modalAdminNameInput" className="block text-sm font-medium text-gray-700 mb-2">
                        강의자 이름 <span className="text-red-500">*</span>
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
                  )}

                  {/* 슈퍼 관리자가 아닌 경우에만 비밀번호 입력 필드 표시 */}
                  {!(isSuperAdmin && pendingAction?.type === 'enter') && (
                    <div>
                      <label htmlFor="passwordInput" className="block text-sm font-medium text-gray-700 mb-2">
                        관리자 비밀번호 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="passwordInput"
                        value={passwordInput}
                        onChange={(e) => {
                          setPasswordInput(e.target.value);
                          setPasswordError('');
                        }}
                        className="w-full px-4 py-2 modern-input"
                        placeholder="비밀번호를 입력하세요"
                        autoComplete="current-password"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handlePasswordConfirm();
                          }
                        }}
                      />
                      {passwordError && (
                        <p className="text-sm text-red-600 mt-1">{passwordError}</p>
                      )}
                    </div>
                  )}

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
                      disabled={
                        (isSuperAdmin && pendingAction?.type === 'enter')
                          ? !modalAdminName.trim()
                          : !passwordInput.trim()
                      }
                    >
                      확인
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

export default AdminLogin; 