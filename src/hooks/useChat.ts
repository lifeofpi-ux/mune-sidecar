import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  increment,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { ChatMessage, ChatRoom, Poll, User } from '../types';

export const useChat = (roomId: string | null, user: User | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const isPresenceSetup = useRef(false);

  // 사용자 접속 상태 관리
  const setupUserPresence = async () => {
    if (!roomId || !user || isPresenceSetup.current) return;
    
    try {
      // 세션 ID를 문서 ID로 사용하고, 닉네임은 데이터로 저장
      const userPresenceRef = doc(collection(db, 'chatRooms', roomId, 'onlineUsers'), user.sessionId);
      const roomRef = doc(db, 'chatRooms', roomId);

      // 이미 접속되어 있는지 확인
      const existingPresence = await getDoc(userPresenceRef);
      if (existingPresence.exists()) {
        console.log('User already online, skipping presence setup');
        isPresenceSetup.current = true;
        return;
      }

      // 사용자의 접속 상태 문서 생성 (세션 ID로 문서 생성, 닉네임 저장)
      await setDoc(userPresenceRef, {
        nickname: user.name,
        sessionId: user.sessionId,
        status: 'online',
        joinedAt: serverTimestamp()
      });

      // 채팅방의 접속자 수 증가
      await updateDoc(roomRef, {
        onlineCount: increment(1)
      });

      isPresenceSetup.current = true;

      // 브라우저가 닫히거나 페이지가 언로드될 때 실행
      const handleBeforeUnload = async () => {
        try {
          await deleteDoc(userPresenceRef);
          await updateDoc(roomRef, {
            onlineCount: increment(-1)
          });
        } catch (error) {
          console.error('Error cleaning up user presence:', error);
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
    } catch (error) {
      console.error('Error setting up user presence:', error);
    }
  };

  // 사용자 접속 해제
  const cleanupUserPresence = async () => {
    if (!roomId || !user || !isPresenceSetup.current) return;
    
    try {
      const userPresenceRef = doc(collection(db, 'chatRooms', roomId, 'onlineUsers'), user.sessionId);
      const roomRef = doc(db, 'chatRooms', roomId);
      
      const existingPresence = await getDoc(userPresenceRef);
      if (existingPresence.exists()) {
        await deleteDoc(userPresenceRef);
        await updateDoc(roomRef, {
          onlineCount: increment(-1)
        });
      }
      
      isPresenceSetup.current = false;
    } catch (error) {
      console.error('Error cleaning up user presence:', error);
    }
  };

  useEffect(() => {
    if (!roomId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // 사용자 접속 상태 설정
    setupUserPresence();

    // 메시지 구독
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const newMessages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        newMessages.push({
          id: doc.id,
          roomId: data.roomId,
          userName: data.userName,
          message: data.message,
          timestamp: data.timestamp?.toDate() || new Date(),
          isAdmin: data.isAdmin || false,
          poll: data.poll ? {
            id: data.poll.id,
            question: data.poll.question,
            options: data.poll.options || [],
            createdAt: data.poll.createdAt?.toDate() || new Date(),
            isActive: data.poll.isActive !== undefined ? data.poll.isActive : true,
            type: data.poll.type || 'multiple-choice',
            wordCloudResponses: data.poll.wordCloudResponses || []
          } : undefined
        });
      });
      setMessages(newMessages);
      setLoading(false);
    });

    // 접속자 수 구독
    const roomRef = doc(db, 'chatRooms', roomId);
    const unsubscribeOnlineUsers = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        setOnlineUsers(doc.data().onlineCount || 0);
      }
    });

    // 네트워크 상태 모니터링
    const handleOnline = () => {
      if (!isPresenceSetup.current) {
        setupUserPresence();
      }
    };

    const handleOffline = async () => {
      await cleanupUserPresence();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      cleanupUserPresence();
      unsubscribeMessages();
      unsubscribeOnlineUsers();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [roomId, user]);

  const sendMessage = async (userName: string, message: string, isAdmin: boolean = false, poll?: Poll) => {
    if (!roomId || !message.trim()) return;

    try {
      const messageData: any = {
        roomId,
        userName,
        message: message.trim(),
        timestamp: serverTimestamp(),
        isAdmin
      };

      if (poll) {
        messageData.poll = {
          ...poll,
          createdAt: serverTimestamp()
        };
      }

      await addDoc(collection(db, 'messages'), messageData);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const voteOnPoll = async (messageId: string, _pollId: string, optionId: string, userId: string) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      
      // 현재 메시지에서 설문조사 데이터 찾기
      const currentMessage = messages.find(msg => msg.id === messageId);
      if (!currentMessage?.poll) return;

      const poll = currentMessage.poll;
      
      // 이미 투표했는지 확인
      const hasVoted = poll.options.some((option: any) => option.voters.includes(userId));
      if (hasVoted) return;

      // 투표 업데이트
      const updatedOptions = poll.options.map((option: any) => {
        if (option.id === optionId) {
          return {
            ...option,
            votes: option.votes + 1,
            voters: [...option.voters, userId]
          };
        }
        return option;
      });

      await updateDoc(messageRef, {
        'poll.options': updatedOptions
      });
    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  };

  const closePoll = async (messageId: string, _pollId: string) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        'poll.isActive': false
      });
    } catch (error) {
      console.error('Error closing poll:', error);
    }
  };

  const addWordCloudResponse = async (messageId: string, _pollId: string, response: string, userId: string) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const currentMessage = messages.find(msg => msg.id === messageId);
      if (!currentMessage?.poll) return;

      const poll = currentMessage.poll;
      const updatedResponses = [...(poll.wordCloudResponses || []), { userId, response }];

      await updateDoc(messageRef, {
        'poll.wordCloudResponses': updatedResponses
      });
    } catch (error) {
      console.error('Error adding word cloud response:', error);
    }
  };

  return { 
    messages, 
    loading, 
    sendMessage, 
    voteOnPoll, 
    closePoll, 
    addWordCloudResponse, 
    onlineUsers
  };
};

export const useRoomList = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const roomsRef = collection(db, 'chatRooms');
    const q = query(roomsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList: ChatRoom[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        roomList.push({
          id: doc.id,
          name: data.name,
          adminPassword: data.adminPassword,
          isActive: data.isActive,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      setRooms(roomList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const deleteRoom = async (roomId: string) => {
    try {
      // 채팅룸 삭제
      await deleteDoc(doc(db, 'chatRooms', roomId));
      
      // 해당 룸의 모든 메시지 삭제
      const messagesRef = collection(db, 'messages');
      const messagesQuery = query(messagesRef, where('roomId', '==', roomId));
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(doc(db, 'messages', messageDoc.id))
      );
      
      await Promise.all(deletePromises);
      
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  };

  return { rooms, loading, deleteRoom };
};

export const useChatRoom = () => {
  // 닉네임 중복 검사 함수
  const checkNicknameAvailability = async (roomId: string, nickname: string): Promise<boolean> => {
    try {
      const onlineUsersRef = collection(db, 'chatRooms', roomId, 'onlineUsers');
      const snapshot = await getDocs(onlineUsersRef);
      
      // 현재 접속 중인 사용자들의 닉네임 확인
      const existingNicknames = new Set<string>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.nickname) {
          existingNicknames.add(data.nickname);
        }
      });
      
      return !existingNicknames.has(nickname);
    } catch (error) {
      console.error('Error checking nickname availability:', error);
      return false;
    }
  };

  // 세션 ID 생성 함수
  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const createRoom = async (name: string, adminPassword: string): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'chatRooms'), {
        name,
        adminPassword,
        createdAt: serverTimestamp(),
        isActive: true
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  const getRoomById = async (roomId: string): Promise<ChatRoom | null> => {
    try {
      const roomsRef = collection(db, 'chatRooms');
      const q = query(roomsRef, where('__name__', '==', roomId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        adminPassword: data.adminPassword,
        createdAt: data.createdAt?.toDate() || new Date(),
        isActive: data.isActive
      };
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  };

  const verifyAdminPassword = async (roomId: string, password: string): Promise<boolean> => {
    const room = await getRoomById(roomId);
    return room?.adminPassword === password;
  };

  const incrementOnlineUsers = async (roomId: string, userName: string, sessionId?: string) => {
    try {
      // 세션 ID가 제공된 경우 새로운 방식 사용, 아니면 기존 방식 유지 (하위 호환성)
      const documentId = sessionId || userName;
      const userPresenceRef = doc(collection(db, 'chatRooms', roomId, 'onlineUsers'), documentId);
      
      // 이미 접속되어 있는지 확인
      const existingPresence = await getDoc(userPresenceRef);
      if (existingPresence.exists()) {
        console.log('User already online, skipping increment');
        return;
      }

      // 사용자의 접속 상태를 나타내는 문서 생성
      const presenceData = sessionId ? {
        nickname: userName,
        sessionId: sessionId,
        status: 'online',
        joinedAt: serverTimestamp()
      } : {
        status: 'online'
      };

      await setDoc(userPresenceRef, presenceData);

      // 채팅방의 접속자 수 업데이트
      const roomRef = doc(db, 'chatRooms', roomId);
      await updateDoc(roomRef, {
        onlineCount: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing online users:', error);
      throw error;
    }
  };

  const decrementOnlineUsers = async (roomId: string, userName: string, sessionId?: string) => {
    try {
      // 세션 ID가 제공된 경우 새로운 방식 사용, 아니면 기존 방식 유지 (하위 호환성)
      const documentId = sessionId || userName;
      const userPresenceRef = doc(collection(db, 'chatRooms', roomId, 'onlineUsers'), documentId);
      
      // 사용자의 접속 상태 문서가 존재하는지 확인
      const existingPresence = await getDoc(userPresenceRef);
      if (!existingPresence.exists()) {
        console.log('User presence document not found, skipping decrement');
        return;
      }

      // 사용자의 접속 상태 문서 삭제
      await deleteDoc(userPresenceRef);

      // 채팅방의 접속자 수 업데이트
      const roomRef = doc(db, 'chatRooms', roomId);
      const roomDoc = await getDoc(roomRef);
      if (roomDoc.exists() && roomDoc.data().onlineCount > 0) {
        await updateDoc(roomRef, {
          onlineCount: increment(-1)
        });
      }
    } catch (error) {
      console.error('Error decrementing online users:', error);
      throw error;
    }
  };

  return { 
    createRoom, 
    getRoomById, 
    verifyAdminPassword,
    incrementOnlineUsers,
    decrementOnlineUsers,
    checkNicknameAvailability,
    generateSessionId
  };
}; 