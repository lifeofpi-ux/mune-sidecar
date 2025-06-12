import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChatRoom } from '../hooks/useChat';

interface UserLoginProps {
  onUserJoined: (userName: string, roomId: string, roomName: string, sessionId: string) => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onUserJoined }) => {
  const [searchParams] = useSearchParams();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomInfo, setRoomInfo] = useState<{ id: string; name: string } | null>(null);

  const { getRoomById, incrementOnlineUsers, checkNicknameAvailability, generateSessionId } = useChatRoom();
  const roomId = searchParams.get('room');

  useEffect(() => {
    const loadRoomInfo = async () => {
      if (!roomId) {
        setError('유효하지 않은 강의룸 링크입니다.');
        return;
      }

      try {
        const room = await getRoomById(roomId);
        if (!room || !room.isActive) {
          setError('존재하지 않거나 비활성화된 강의룸입니다.');
          return;
        }
        setRoomInfo({ id: room.id, name: room.name });
      } catch (error) {
        setError('강의룸 정보를 불러오는데 실패했습니다.');
        console.error('Error loading room info:', error);
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
      
      await incrementOnlineUsers(roomInfo.id, userName.trim(), sessionId);
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
        <div className="modern-card p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류</h1>
          <p className="text-gray-600">유효하지 않은 강의룸 링크입니다.</p>
        </div>
        
        {/* 크레딧 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <p className="text-sm text-gray-500 text-center">
            제작 <span className="font-medium text-gray-600">@라이프오브파이</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 relative">
      <div className="modern-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">강의룸 입장</h1>
          {roomInfo && (
            <p className="text-gray-600">
              <span className="font-semibold">{roomInfo.name}</span>에 참여하기
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
              참여자 이름
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 modern-input"
              placeholder="채팅에서 사용할 이름을 입력하세요"
              disabled={loading || !roomInfo}
              maxLength={20}
            />
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
            className="w-full modern-btn modern-btn-success modern-btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '입장 중...' : '강의룸 입장'}
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
        <p className="text-sm text-gray-500 text-center">
          제작 <span className="font-medium text-gray-600">@라이프오브파이</span>
        </p>
      </div>
    </div>
  );
};

export default UserLogin; 