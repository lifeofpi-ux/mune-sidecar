import React, { useState } from 'react';
import { GiftIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface RandomPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onlineUsersList: string[];
  roomName: string;
  adminName: string;
}

const RandomPicker: React.FC<RandomPickerProps> = ({ 
  isOpen, 
  onClose, 
  onlineUsersList, 
  roomName,
  adminName
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [spinningUser, setSpinningUser] = useState<string>('');

  // 강의자(관리자)를 제외한 일반 사용자들만 필터링
  const eligibleUsers = onlineUsersList.filter(user => user !== adminName);

  const startRandomPick = () => {
    if (eligibleUsers.length === 0) return;

    setIsSpinning(true);
    setShowResult(false);
    setSelectedUser('');

    // 스피닝 애니메이션 효과
    let spinCount = 0;
    const maxSpins = 20 + Math.floor(Math.random() * 20); // 20-40번 스핀
    
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligibleUsers.length);
      setSpinningUser(eligibleUsers[randomIndex]);
      spinCount++;

      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
        
        // 최종 선택
        const finalIndex = Math.floor(Math.random() * eligibleUsers.length);
        const winner = eligibleUsers[finalIndex];
        
        setTimeout(() => {
          setSelectedUser(winner);
          setIsSpinning(false);
          setShowResult(true);
        }, 500);
      }
    }, 100);
  };

  const resetPicker = () => {
    setIsSpinning(false);
    setSelectedUser('');
    setShowResult(false);
    setSpinningUser('');
  };

  const handleClose = () => {
    resetPicker();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <GiftIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">랜덤 추첨</h2>
              <p className="text-purple-100 text-sm">{roomName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {eligibleUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <SparklesIcon className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">
                추첨 가능한 참가자가 없습니다
              </p>
              <p className="text-gray-500 text-sm">
                일반 사용자가 접속해야 추첨이 가능합니다
              </p>
            </div>
          ) : (
            <>
              {/* 참가자 수 표시 */}
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">
                  총 <span className="font-bold text-purple-600">{eligibleUsers.length}명</span>의 참가자
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {eligibleUsers.map((user, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {user}
                    </span>
                  ))}
                </div>
              </div>

              {/* 추첨 결과 영역 */}
              <div className="text-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center border-4 border-purple-200 relative overflow-hidden">
                    {isSpinning && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-spin rounded-full"></div>
                    )}
                    
                    {!showResult && !isSpinning && (
                      <div className="text-center">
                        <SparklesIcon className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                        <p className="text-purple-600 font-medium text-sm">추첨 대기</p>
                      </div>
                    )}

                    {isSpinning && (
                      <div className="text-center animate-pulse">
                        <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 animate-bounce"></div>
                        <p className="text-purple-700 font-bold text-lg">
                          {spinningUser}
                        </p>
                      </div>
                    )}

                    {showResult && selectedUser && (
                      <div className="text-center animate-bounce">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <SparklesIcon className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-purple-700 font-bold text-lg">
                          {selectedUser}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {showResult && selectedUser && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <p className="text-orange-800 font-bold text-xl mb-1">🎉 당첨!</p>
                    <p className="text-orange-700 text-lg font-semibold">{selectedUser}님</p>
                    <p className="text-orange-600 text-sm">축하합니다!</p>
                  </div>
                )}
              </div>

              {/* 버튼 영역 */}
              <div className="flex space-x-3">
                {!showResult ? (
                  <button
                    onClick={startRandomPick}
                    disabled={isSpinning || eligibleUsers.length === 0}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSpinning ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>추첨 중...</span>
                      </>
                    ) : (
                      <>
                        <GiftIcon className="w-5 h-5" />
                        <span>추첨 시작</span>
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={resetPicker}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                    >
                      다시 추첨
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                    >
                      완료
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RandomPicker; 