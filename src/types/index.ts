export interface ChatRoom {
  id: string;
  name: string;
  adminPassword: string;
  createdAt: Date;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userName: string;
  message: string;
  timestamp: Date;
  isAdmin: boolean;
  poll?: Poll;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: Date;
  isActive: boolean;
  type: 'multiple-choice' | 'word-cloud';
  wordCloudResponses?: string[]; // 워드 클라우드용 텍스트 응답들
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[]; // userId 배열
}

export interface User {
  name: string;
  isAdmin: boolean;
  roomId: string;
} 