import React, { useState, useEffect } from 'react';
import { Poll } from '../types';
import { CheckIcon, StarIcon, StopIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { ChartBarIcon as ChartBarIconSolid, CloudIcon as CloudIconSolid } from '@heroicons/react/24/solid';
import WordCloud from './WordCloud';

interface PollCardProps {
  poll: Poll;
  currentUserId: string;
  isAdmin: boolean;
  onVote: (pollId: string, optionId: string) => void;
  onClosePoll?: (pollId: string) => void;
  onWordCloudResponse?: (pollId: string, response: string) => void;
}

const PollCard: React.FC<PollCardProps> = ({ 
  poll, 
  currentUserId, 
  isAdmin, 
  onVote, 
  onClosePoll,
  onWordCloudResponse
}) => {
  // 각 설문조사별로 완전히 독립적인 상태 관리
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(() => {
    // 타입 안전성을 위한 체크
    const pollType = poll.type || 'multiple-choice';
    return pollType === 'multiple-choice' 
      ? poll.options?.some(option => option.voters?.includes(currentUserId)) || false
      : poll.wordCloudResponses?.some(response => response.includes(`[${currentUserId}]`)) || false;
  });
  const [wordCloudInput, setWordCloudInput] = useState('');

  // 안전한 타입 체크를 위한 헬퍼 함수
  const isMultipleChoice = () => {
    return poll.type === 'multiple-choice' || !poll.type; // 타입이 없으면 객관식으로 간주
  };

  const isWordCloud = () => {
    return poll.type === 'word-cloud';
  };

  const totalVotes = isMultipleChoice() 
    ? poll.options?.reduce((sum, option) => sum + (option.votes || 0), 0) || 0
    : poll.wordCloudResponses?.length || 0;
  const userVotedOption = poll.options?.find(option => option.voters?.includes(currentUserId));

  // 실시간 투표 상태 업데이트
  useEffect(() => {
    if (isMultipleChoice()) {
      const hasUserVoted = poll.options?.some(option => option.voters?.includes(currentUserId)) || false;
      setHasVoted(hasUserVoted);
    } else if (isWordCloud()) {
      const hasUserResponded = poll.wordCloudResponses?.some(response => 
        response.includes(`[${currentUserId}]`)
      ) || false;
      setHasVoted(hasUserResponded);
    }
  }, [poll.options, poll.wordCloudResponses, poll.type, currentUserId]);

  const handleVote = () => {
    if (selectedOption && !hasVoted && poll.isActive) {
      onVote(poll.id, selectedOption);
      setHasVoted(true);
    }
  };

  const handleWordCloudSubmit = () => {
    if (wordCloudInput.trim() && !hasVoted && poll.isActive && onWordCloudResponse) {
      onWordCloudResponse(poll.id, wordCloudInput.trim());
      setWordCloudInput('');
      setHasVoted(true);
    }
  };

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modern-card p-4 mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            {isMultipleChoice() ? (
              <ChartBarIconSolid className="w-6 h-6 text-white" />
            ) : (
              <CloudIconSolid className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {isMultipleChoice() ? '설문조사' : '워드 클라우드'}
            </div>
            <div className="text-xs text-gray-500">
              {formatTime(poll.createdAt)} • 총 {totalVotes}{isMultipleChoice() ? '표' : '개 응답'}
            </div>
          </div>
        </div>
        
        {isAdmin && poll.isActive && onClosePoll && (
          <button
            onClick={() => onClosePoll(poll.id)}
            className="modern-btn modern-btn-warning modern-btn-sm flex items-center gap-1"
            title="설문 종료"
          >
            <StopIcon className="w-4 h-4" />
            종료
          </button>
        )}
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-3">
          {poll.question}
        </h4>

        {isMultipleChoice() ? (
          <div className="space-y-2">
            {poll.options?.map((option) => {
              const percentage = getPercentage(option.votes || 0);
              const isSelected = selectedOption === option.id;
              const isUserVote = userVotedOption?.id === option.id;
              
              return (
                <div key={option.id} className="relative">
                  {/* 투표 전 - 선택 가능한 옵션 (관리자가 아니고, 투표하지 않았고, 설문이 활성화된 경우) */}
                  {!isAdmin && !hasVoted && poll.isActive && (
                    <label className="flex items-center p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={`poll-${poll.id}`}
                        value={option.id}
                        checked={isSelected}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="mr-3 text-blue-600"
                      />
                      <span className="text-gray-900">{option.text}</span>
                    </label>
                  )}

                  {/* 투표 후 또는 관리자 - 결과 표시 */}
                  {(isAdmin || hasVoted || !poll.isActive) && (
                    <div className={`relative p-3 rounded-lg border-2 overflow-hidden ${
                      isUserVote 
                        ? 'border-blue-400 bg-blue-50' 
                        : isAdmin
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      {/* 진행률 바 */}
                      <div 
                        className={`absolute inset-0 transition-all duration-500 ${
                          isUserVote 
                            ? 'bg-gradient-to-r from-blue-200 to-blue-300'
                            : isAdmin
                            ? 'bg-gradient-to-r from-amber-200 to-amber-300'
                            : 'bg-gradient-to-r from-gray-200 to-gray-300'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                      
                      {/* 텍스트 */}
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center">
                          {isUserVote && (
                            <CheckIcon className="w-4 h-4 mr-2 text-blue-600" />
                          )}
                          {isAdmin && (
                            <StarIcon className="w-4 h-4 mr-2 text-amber-600" />
                          )}
                          <span className="font-medium text-gray-900">
                            {option.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700">
                            {percentage}%
                          </span>
                          <span className="text-xs text-gray-500">
                            ({option.votes}표)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* 워드 클라우드 */
          <div className="space-y-4">
            {/* 워드 클라우드 표시 */}
            <div className="w-full h-64 rounded-lg border-2 border-gray-200 overflow-hidden">
              <WordCloud 
                responses={poll.wordCloudResponses?.map(response => 
                  response.replace(/\[.*?\]/g, '').trim()
                ) || []} 
              />
            </div>
            
            {/* 텍스트 입력 (참여자용) */}
            {!isAdmin && !hasVoted && poll.isActive && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={wordCloudInput}
                  onChange={(e) => setWordCloudInput(e.target.value)}
                  placeholder="자유롭게 의견을 입력해주세요..."
                  className="flex-1 px-4 py-2 modern-input"
                  maxLength={100}
                  onKeyPress={(e) => e.key === 'Enter' && handleWordCloudSubmit()}
                />
                <button
                  onClick={handleWordCloudSubmit}
                  disabled={!wordCloudInput.trim()}
                  className="modern-btn modern-btn-primary modern-btn-sm px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  응답
                </button>
              </div>
            )}
          </div>
        )}

        {/* 투표 버튼 (객관식이고 관리자가 아닌 경우에만 표시) */}
        {isMultipleChoice() && !isAdmin && !hasVoted && poll.isActive && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleVote}
              disabled={!selectedOption}
              className="modern-btn modern-btn-primary modern-btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              투표하기
            </button>
          </div>
        )}

        {/* 상태 표시 */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className={`px-2 py-1 rounded-full ${
              poll.isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {poll.isActive ? '진행 중' : '종료됨'}
            </span>
            {isAdmin && (
              <span className="text-amber-600 flex items-center gap-1">
                <StarIcon className="w-4 h-4" />
                관리자 뷰
              </span>
            )}
            {!isAdmin && hasVoted && (
              <span className="text-blue-600 flex items-center gap-1">
                <CheckIcon className="w-4 h-4" />
                투표 완료
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollCard; 