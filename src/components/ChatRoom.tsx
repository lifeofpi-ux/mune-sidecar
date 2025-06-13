import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { useChatRoom } from '../hooks/useChat';
import { User, Poll } from '../types';
import QRCodeGenerator from './QRCodeGenerator';
import PollModal from './PollModal';
import PollCard from './PollCard';
import RandomPicker from './RandomPicker';
import TimerModal from './TimerModal';
import { PlusIcon, GiftIcon, QrCodeIcon, ArrowLeftOnRectangleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ChatRoomProps {
  user: User;
  roomName: string;
  onLeave: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ user, roomName, onLeave }) => {
  const [message, setMessage] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showRandomPicker, setShowRandomPicker] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    loading, 
    sendMessage, 
    voteOnPoll, 
    closePoll, 
    addWordCloudResponse, 
    onlineUsers,
    onlineUsersList
  } = useChat(user.roomId, user);

  const { decrementOnlineUsers } = useChatRoom();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLeave = async () => {
    try {
      await decrementOnlineUsers(user.roomId, user.name, user.sessionId);
      onLeave();
    } catch (error) {
      console.error('Error leaving room:', error);
      onLeave(); // 에러가 발생해도 나가기 실행
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessage(user.name, message, user.isAdmin);
    setMessage('');
  };

  const handleCreatePoll = async (pollData: Omit<Poll, 'id' | 'createdAt'>) => {
    try {
      console.log('Creating new poll:', pollData);
      
      // 새로운 설문조사 생성 전에 기존 활성 설문조사들을 모두 종료
      const activePolls = messages.filter(msg => msg.poll && msg.poll.isActive);
      console.log('Active polls to close:', activePolls.length);
      
      for (const msg of activePolls) {
        if (msg.poll) {
          console.log('Closing poll:', msg.poll.id);
          await closePoll(msg.id, msg.poll.id);
        }
      }

      const poll: Poll = {
        ...pollData,
        id: `poll_${Date.now()}`,
        createdAt: new Date()
      };

      console.log('Sending message with poll:', poll);
      await sendMessage(user.name, `설문조사: ${poll.question}`, user.isAdmin, poll);
      setShowPollModal(false);
      console.log('Poll created successfully');
    } catch (error) {
      console.error('Error creating poll:', error);
      // 에러가 발생해도 모달은 닫지 않고 사용자에게 알림
      alert('설문조사 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    const messageWithPoll = messages.find(msg => msg.poll?.id === pollId);
    if (messageWithPoll) {
      await voteOnPoll(messageWithPoll.id, pollId, optionId, user.name);
    }
  };

  const handleClosePoll = async (pollId: string) => {
    const messageWithPoll = messages.find(msg => msg.poll?.id === pollId);
    if (messageWithPoll) {
      await closePoll(messageWithPoll.id, pollId);
    }
  };

  const handleWordCloudResponse = async (pollId: string, response: string) => {
    const messageWithPoll = messages.find(msg => msg.poll?.id === pollId);
    if (messageWithPoll) {
      await addWordCloudResponse(messageWithPoll.id, pollId, response, user.name);
    }
  };

  // 최신 관리자 메시지 찾기
  const getLatestAdminMessage = () => {
    const adminMessages = messages.filter(msg => msg.isAdmin);
    return adminMessages.length > 0 ? adminMessages[adminMessages.length - 1] : null;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 truncate">{roomName}</h1>
          <p className="text-sm text-gray-500 flex items-center">
            {user.isAdmin && (
              <span className="badge badge-speaker mr-1 py-0.5" style={{ padding: '0.1rem 0.5rem' }}>강의자</span>
            )}
            <span className="truncate">{user.name}</span>
            <span className="ml-2 text-gray-400 hidden sm:inline">•</span>
            <span className="ml-2 text-gray-500 hidden sm:inline">현재 {onlineUsers}명 접속 중</span>
            <span className="ml-2 text-gray-500 sm:hidden">{onlineUsers}명</span>
          </p>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          {user.isAdmin && (
            <>
              <button
                onClick={() => setShowRandomPicker(true)}
                className="modern-btn modern-btn-accent modern-btn-sm flex items-center space-x-1 !px-2 sm:!px-3"
                title="랜덤 추첨"
              >
                <GiftIcon className="w-4 h-4" />
                <span className="hidden sm:inline">추첨</span>
              </button>
              <button
                onClick={() => setShowTimer(true)}
                className="modern-btn modern-btn-warning modern-btn-sm flex items-center space-x-1 !px-2 sm:!px-3"
                title="타이머"
              >
                <ClockIcon className="w-4 h-4" />
                <span className="hidden sm:inline">타이머</span>
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="modern-btn modern-btn-primary modern-btn-sm flex items-center space-x-1 !px-2 sm:!px-3"
                title={showQR ? 'QR 코드 숨기기' : 'QR 코드 보기'}
              >
                <QrCodeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{showQR ? 'QR 숨기기' : 'QR 보기'}</span>
              </button>
            </>
          )}
          <button
            onClick={handleLeave}
            className="modern-btn modern-btn-secondary modern-btn-sm flex items-center space-x-1 !px-2 sm:!px-3"
            title="나가기"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            <span className="hidden sm:inline">나가기</span>
          </button>
        </div>
      </div>

      {/* QR Code Section */}
      {user.isAdmin && showQR && (
        <div className="bg-white border-b p-4">
          <QRCodeGenerator roomId={user.roomId} roomName={roomName} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500">메시지를 불러오는 중...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">아직 메시지가 없습니다</p>
              <p className="text-sm">첫 번째 메시지를 보내보세요!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const latestAdminMessage = getLatestAdminMessage();
            const isLatestAdminMessage = user.isAdmin && msg.isAdmin && latestAdminMessage?.id === msg.id;
            
            return (
              <div key={msg.id}>
                <div
                  className={`flex ${msg.userName === user.name ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start gap-2">
                    {/* + 버튼 (최신 관리자 메시지의 왼쪽에만 표시, 단 해당 메시지에 설문조사가 없는 경우에만) */}
                    {isLatestAdminMessage && !msg.poll && (
                      <button
                        onClick={() => setShowPollModal(true)}
                        className="mt-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                        title="설문조사 생성"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    )}
                    
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.userName === user.name
                          ? 'bg-indigo-600 text-white'
                          : msg.isAdmin
                          ? 'bg-amber-100 border border-amber-200'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 -ml-1">
                        {msg.isAdmin ? (
                          <span className="badge badge-speaker text-xs mr-2">
                            {msg.userName}
                          </span>
                        ) : (
                          <span className="badge badge-user text-xs mr-2">
                            {msg.userName}
                          </span>
                        )}
                        <span
                          className={`text-xs ${
                            msg.userName === user.name
                              ? 'text-indigo-200'
                              : 'text-gray-400'
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          msg.userName === user.name
                            ? 'text-white'
                            : msg.isAdmin
                            ? 'text-amber-800'
                            : 'text-gray-900'
                        }`}
                      >
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 설문조사 카드 */}
                {msg.poll && (
                  <PollCard
                    key={`poll-${msg.poll.id}`}
                    poll={msg.poll}
                    currentUserId={user.name}
                    isAdmin={user.isAdmin}
                    onVote={handleVote}
                    onClosePoll={handleClosePoll}
                    onWordCloudResponse={handleWordCloudResponse}
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-3 modern-input"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="modern-btn modern-btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            전송
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-1">최대 500자까지 입력 가능합니다.</p>
      </div>

      {/* 설문조사 생성 모달 */}
      <PollModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        onCreatePoll={handleCreatePoll}
      />

      {/* 랜덤 추첨 모달 */}
      <RandomPicker
        isOpen={showRandomPicker}
        onClose={() => setShowRandomPicker(false)}
        onlineUsersList={onlineUsersList}
        roomName={roomName}
        adminName={user.name}
      />

      {/* 타이머 모달 */}
      <TimerModal
        isOpen={showTimer}
        onClose={() => setShowTimer(false)}
      />
    </div>
  );
};

export default ChatRoom; 