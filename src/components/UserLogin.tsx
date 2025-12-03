import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChatRoom } from '../hooks/useChat';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface UserLoginProps {
  onUserJoined: (userName: string, roomId: string, roomName: string, sessionId: string) => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onUserJoined }) => {
  const [searchParams] = useSearchParams();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomInfo, setRoomInfo] = useState<{ id: string; name: string } | null>(null);

  const { getRoomById, checkNicknameAvailability, generateSessionId } = useChatRoom();
  const roomId = searchParams.get('room');

  useEffect(() => {
    const loadRoomInfo = async () => {
      if (!roomId) {
        setError('유효하지 않은 강의룸 링크입니다.');
        return;
      }

      try {
        const room = await getRoomById(roomId);

        if (!room) {
          setError('존재하지 않거나 비활성화된 강의룸입니다.');
          return;
        }

        if (!room.isActive) {
          setError('존재하지 않거나 비활성화된 강의룸입니다.');
          return;
        }

        setRoomInfo({ id: room.id, name: room.name });
      } catch (error) {
        console.error('Error loading room info:', error);
        setError('강의룸 정보를 불러오는데 실패했습니다.');
      }
    };

    loadRoomInfo();
  }, [roomId, getRoomById]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (!roomInfo) {
      setError('강의룸 정보가 없습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 닉네임 중복 검사
      const isAvailable = await checkNicknameAvailability(roomInfo.id, userName.trim());
      if (!isAvailable) {
        setError('이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.');
        setLoading(false);
        return;
      }

      // 세션 ID 생성
      const sessionId = generateSessionId();

      onUserJoined(userName.trim(), roomInfo.id, roomInfo.name, sessionId);
    } catch (error) {
      setError('강의룸 입장에 실패했습니다. 다시 시도해주세요.');
      console.error('Error joining room:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4 relative">
        <div className="modern-card p-8 w-full max-w-[400px] text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류</h1>
          <p className="text-gray-600">유효하지 않은 강의룸 링크입니다.</p>
        </div>

        {/* 크레딧 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <p className="text-sm text-gray-500 text-center">
            <span className="font-bold text-blue-700">©VIVAMUNE</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
      <div className="modern-card p-8 w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative ">
              <img
                src="/logo.webp"
                alt="MUNE Logo"
                className="w-40 object-contain"
              />
              <div className="absolute -inset-2 bg-white/20 rounded-full blur-md -z-10"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-blue-900">강의룸 입장</h1>
          {roomInfo && (
            <p className="text-blue-600 mt-2">
              <span className="font-semibold">{roomInfo.name}</span>에 참여하기
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-blue-800 mb-2 drop-shadow-sm">
              <div className="flex items-center space-x-1">
                <UserIcon className="w-4 h-4" />
                <span>참여자 이름</span>
              </div>
            </label>
            <div className="relative">
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 modern-input bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-300/50"
                placeholder="채팅에서 사용할 이름을 입력하세요"
                disabled={loading || !roomInfo}
                maxLength={20}
              />
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">최대 20자까지 입력 가능합니다.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !roomInfo || !userName.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center justify-center space-x-2">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>{loading ? '입장 중...' : '강의룸 입장'}</span>
            </div>
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            강의을 통해 함께 소통해보세요.
          </p>
        </div>
      </div>

      {/* 크레딧 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-sm text-blue-600/80 text-center drop-shadow-sm">
          <span className="font-bold text-blue-700">©VIVAMUNE</span>
        </p>
      </div>
    </div>
  );
};

export default UserLogin; 