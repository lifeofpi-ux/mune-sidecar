import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon, XMarkIcon, ClockIcon, BellIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TimerModal: React.FC<TimerModalProps> = ({ isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10분 (600초)
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 실행
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // 모달이 닫힐 때 타이머 정리
  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isOpen]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(600); // 10분으로 초기화
    setInitialTime(600);
  };

  const handleTimeAdjust = (minutes: number) => {
    const newTime = Math.max(60, timeLeft + (minutes * 60)); // 최소 1분
    setTimeLeft(newTime);
    setInitialTime(newTime); // 시간 조절 시 항상 새로운 시간을 기준으로 설정
  };

  // 진행률 계산 (0-100)
  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
  
  // 원형 진행바 계산
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (!isOpen) return null;

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
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl w-[90%] mx-4 relative overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-indigo-600">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ClockIcon className="w-5 h-5" />
            <span>타이머</span>
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all duration-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col items-center p-6 space-y-6">
          {/* 원형 타이머 */}
          <div className="relative w-64 h-64 flex items-center justify-center drop-shadow-lg">
            <svg
              className="transform -rotate-90 w-64 h-64"
              viewBox="0 0 300 300"
            >
              {/* 배경 원 */}
              <circle
                cx="150"
                cy="150"
                r={radius}
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              {/* 진행 원 */}
              <circle
                cx="150"
                cy="150"
                r={radius}
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-in-out"
              />
              {/* 그라데이션 정의 */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* 중앙 시간 표시 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <button
                  onClick={() => handleTimeAdjust(-1)}
                  disabled={timeLeft <= 60}
                >
                  <MinusIcon className="w-4 h-4 text-gray-600 hover:text-gray-700 transition-colors disabled:opacity-50" />
                </button>
                <span className="font-medium">1분</span>
                <button
                  onClick={() => handleTimeAdjust(1)}
                >
                  <PlusIcon className="w-4 h-4 text-gray-600 hover:text-gray-700 transition-colors" />
                </button>
              </div>
            </div>
          </div>

          {/* 컨트롤 버튼 */}
          <div className="flex items-center space-x-6">
            {/* 재생/일시정지 버튼 */}
            <button
              onClick={handlePlayPause}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              {isRunning ? (
                <PauseIcon className="w-7 h-7" />
              ) : (
                <PlayIcon className="w-7 h-7 ml-1" />
              )}
            </button>

            {/* 리셋 버튼 */}
            <button
              onClick={handleReset}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-600 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>

          {/* 상태 표시 */}
          <div className="text-center pb-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
              {timeLeft === 0 ? (
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full flex items-center space-x-1">
                  <BellIcon className="w-3 h-3" />
                  <span>시간 종료!</span>
                </span>
              ) : isRunning ? (
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full flex items-center space-x-1">
                  <PlayIcon className="w-3 h-3" />
                  <span>진행 중</span>
                </span>
              ) : (
                <span className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-3 py-1 rounded-full flex items-center space-x-1">
                  <PauseIcon className="w-3 h-3" />
                  <span>일시정지</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerModal; 