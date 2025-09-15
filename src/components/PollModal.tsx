import React, { useState } from 'react';
import { Poll, PollOption } from '../types';
import { ChartBarIcon, PlusIcon, XMarkIcon, CloudIcon } from '@heroicons/react/24/outline';

interface PollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (poll: Omit<Poll, 'id' | 'createdAt'>) => void;
}

const PollModal: React.FC<PollModalProps> = ({ isOpen, onClose, onCreatePoll }) => {
  const [activeTab, setActiveTab] = useState<'multiple-choice' | 'word-cloud'>('multiple-choice');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    setError('');

    if (!question.trim()) {
      setError('질문을 입력해주세요.');
      return;
    }

    let pollOptions: PollOption[] = [];
    
    if (activeTab === 'multiple-choice') {
      const validOptions = options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        setError('최소 2개의 선택지를 입력해주세요.');
        return;
      }
      
      pollOptions = validOptions.map((text, index) => ({
        id: `option_${index}`,
        text: text.trim(),
        votes: 0,
        voters: []
      }));
    }

    const poll: Omit<Poll, 'id' | 'createdAt'> = {
      question: question.trim(),
      options: activeTab === 'multiple-choice' ? pollOptions : [],
      isActive: true,
      type: activeTab,
      wordCloudResponses: []
    };

    onCreatePoll(poll);
    handleClose();
  };

  const handleClose = () => {
    setActiveTab('multiple-choice');
    setQuestion('');
    setOptions(['', '']);
    setError('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="modern-card p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              {activeTab === 'multiple-choice' ? (
                <ChartBarIcon className="w-6 h-6 text-white" />
              ) : (
                <CloudIcon className="w-6 h-6 text-white" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              설문조사 생성
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            {activeTab === 'multiple-choice' 
              ? '참여자들이 투표할 수 있는 설문조사를 만들어보세요'
              : '참여자들의 자유로운 의견을 워드 클라우드로 시각화해보세요'
            }
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab('multiple-choice')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'multiple-choice'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChartBarIcon className="w-4 h-4" />
              객관식
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('word-cloud')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'word-cloud'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CloudIcon className="w-4 h-4" />
              워드 클라우드
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* 질문 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              질문 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-2 modern-input resize-none"
              placeholder="예: 다음 주제 중 가장 관심 있는 것은?"
              rows={2}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1">
              {question.length}/200
            </div>
          </div>

          {/* 선택지 입력 (객관식일 때만) */}
          {activeTab === 'multiple-choice' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선택지 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="w-full px-4 py-2 modern-input"
                        placeholder={`선택지 ${index + 1}`}
                        maxLength={100}
                      />
                    </div>
                    {options.length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(index)}
                        className="modern-btn modern-btn-warning modern-btn-sm px-3"
                        title="선택지 삭제"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {options.length < 6 && (
                <button
                  onClick={handleAddOption}
                  className="mt-2 modern-btn modern-btn-secondary modern-btn-sm flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  선택지 추가
                </button>
              )}
              
              <div className="text-xs text-gray-500 mt-1">
                최소 2개, 최대 6개까지 가능
              </div>
            </div>
          )}

          {/* 워드 클라우드 설명 */}
          {activeTab === 'word-cloud' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                <CloudIcon className="w-4 h-4" />
                워드 클라우드 설문조사
              </h4>
              <ul className="text-sm text-blue-700 space-y-1 text-xs">
                <li>• 응답된 단어들이 실시간으로 워드 클라우드에 표시됩니다</li>
                <li>• 자주 언급된 단어일수록 크게 표시됩니다</li>
                <li>• 창의 가로폭에 따라 주요단어만 강조되어 표시됩니다</li>
              </ul>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              className="flex-1 py-2 modern-btn modern-btn-secondary"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 modern-btn modern-btn-primary"
            >
              {activeTab === 'multiple-choice' ? '객관식 설문 생성' : '워드 클라우드 생성'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollModal; 