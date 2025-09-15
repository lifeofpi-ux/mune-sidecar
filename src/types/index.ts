export interface ChatRoom {
  id: string;
  name: string;
  adminPassword: string;
  createdAt: Date;
  isActive: boolean;
  // 새로 추가되는 필드들 (회원 시스템)
  ownerId?: string; // 사용자 UID
  ownerEmail?: string; // 사용자 이메일
  ownerDisplayName?: string; // 사용자 표시명
  adminName?: string; // 기존 호환성을 위해 유지
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
  sessionId: string; // 브라우저 세션별 고유 ID
}

// 새로 추가: Firebase Auth 사용자 인터페이스
export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  lastLoginAt: Date;
  roomCount: number; // 생성한 채팅룸 수
}

// 인증 컨텍스트용 인터페이스
export interface AuthContextType {
  currentUser: any | null; // Firebase User 타입
  authUser: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  loading: boolean;
} 