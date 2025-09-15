import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon, 
  TrashIcon, 
  PencilIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface UserProfileProps {
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { currentUser, authUser, logout, deleteAccount, updateDisplayName } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(authUser?.displayName || '');

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!newDisplayName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    if (newDisplayName.trim() === authUser?.displayName) {
      setShowEditName(false);
      return;
    }

    setLoading(true);
    try {
      await updateDisplayName(newDisplayName.trim());
      setShowEditName(false);
    } catch (error: any) {
      console.error('Update display name error:', error);
      alert(error.message || '이름 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteAccount();
      // 회원 탈퇴 성공 시 자동으로 로그아웃되고 홈으로 이동
    } catch (error: any) {
      console.error('Delete account error:', error);
      alert(error.message || '회원 탈퇴 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!currentUser || !authUser) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">프로필</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* 프로필 정보 */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  {showEditName ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={newDisplayName}
                          onChange={(e) => setNewDisplayName(e.target.value)}
                          className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="이름을 입력하세요"
                          maxLength={20}
                          disabled={loading}
                        />
                        <PencilIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleUpdateDisplayName}
                          disabled={loading}
                          className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50"
                        >
                          {loading ? '저장 중...' : '저장'}
                        </button>
                        <button
                          onClick={() => {
                            setShowEditName(false);
                            setNewDisplayName(authUser?.displayName || '');
                          }}
                          disabled={loading}
                          className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors disabled:opacity-50"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">
                          {authUser.displayName || '사용자'}
                        </h4>
                        <button
                          onClick={() => setShowEditName(true)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="이름 수정"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">{authUser.email}</p>
                    </>
                  )}
                </div>
              </div>

              {/* 통계 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {authUser.roomCount}
                  </div>
                  <div className="text-sm text-blue-800">생성한 채팅룸</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CalendarDaysIcon className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-sm text-green-800 font-medium">가입일</div>
                  <div className="text-xs text-green-600 mt-1">
                    {formatDate(authUser.createdAt)}
                  </div>
                </div>
              </div>

              {/* 계정 정보 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">마지막 로그인</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(authUser.lastLoginAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center space-x-2">
                    <CheckBadgeIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">계정 상태</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">활성</span>
                </div>
              </div>

              {/* 버튼들 */}
              <div className="pt-4 border-t">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>{loading ? '로그아웃 중...' : '로그아웃'}</span>
                </button>
                
                {/* 회원 탈퇴 텍스트 링크 */}
                <div className="mt-3 text-left">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline"
                  >
                    회원 탈퇴
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                회원 탈퇴
              </h3>
              
              <div className="text-center text-gray-600 mb-6">
                <p className="mb-3">정말로 회원 탈퇴하시겠습니까?</p>
                <div className="bg-red-50 p-3 rounded-lg text-sm text-red-700">
                  <p className="font-medium mb-2">⚠️ 주의사항</p>
                  <ul className="text-left space-y-1">
                    <li>• 모든 채팅룸이 삭제됩니다</li>
                    <li>• 채팅 기록이 모두 삭제됩니다</li>
                    <li>• 계정 복구가 불가능합니다</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '탈퇴 중...' : '탈퇴하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;