import { useState, useEffect, useRef, useCallback } from 'react';
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
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// 디버깅을 위한 고유 ID 생성기
const generateId = () => Math.random().toString(36).substr(2, 5);

import { ChatMessage, ChatRoom, Poll, User } from '../types';

export const useChat = (roomId: string | null, user: User | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [onlineUsersList, setOnlineUsersList] = useState<string[]>([]);
  const isPresenceSetup = useRef(false);

  // 사용자 접속 상태 관리
  const setupUserPresence = async () => {
    const presenceId = generateId();
    console.log(`[Presence #${presenceId}] setupUserPresence: START. Room: ${roomId}, User: ${user?.name}, isPresenceSetup: ${isPresenceSetup.current}`);

    if (!roomId || !user || isPresenceSetup.current) {
      console.log(`[Presence #${presenceId}] setupUserPresence: SKIPPED (already setup or missing info).`);
      return null;
    }

    try {
      const newRoomRef = doc(db, 'rooms', roomId);
      const newRoomDoc = await getDoc(newRoomRef);
      const isNewRoom = newRoomDoc.exists();
      const collectionName = isNewRoom ? 'rooms' : 'chatRooms';

      const userPresenceRef = doc(collection(db, collectionName, roomId, 'onlineUsers'), user.sessionId);
      const roomRef = doc(db, collectionName, roomId);

      const existingPresence = await getDoc(userPresenceRef);
      if (existingPresence.exists()) {
        console.log(`[Presence #${presenceId}] User already online, skipping presence setup`);
        isPresenceSetup.current = true;
        return null;
      }

      const batch = writeBatch(db);
      batch.set(userPresenceRef, {
        nickname: user.name,
        sessionId: user.sessionId,
        status: 'online',
        joinedAt: serverTimestamp()
      });
      batch.set(roomRef, { onlineCount: increment(1) }, { merge: true });

      await batch.commit();

      isPresenceSetup.current = true;
      console.log(`[Presence #${presenceId}] setupUserPresence: SUCCESS.`);

      const handleBeforeUnload = () => {
        console.log(`[Presence #${presenceId}] handleBeforeUnload: Cleaning up presence for user ${user.name}`);
        deleteDoc(userPresenceRef);
        updateDoc(roomRef, { onlineCount: increment(-1) });
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      // 클린업 함수 반환
      return () => {
        console.log(`[Presence #${presenceId}] CLEANUP: Removing 'beforeunload' listener.`);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };

    } catch (error) {
      console.error(`[Presence #${presenceId}] Error setting up user presence:`, error);
      return null;
    }
  };

  // 사용자 접속 해제
  const cleanupUserPresence = async () => {
    const presenceId = generateId();
    console.log(`[Presence #${presenceId}] cleanupUserPresence: START. Room: ${roomId}, User: ${user?.name}, isPresenceSetup: ${isPresenceSetup.current}`);

    if (!roomId || !user || !isPresenceSetup.current) {
      console.log(`[Presence #${presenceId}] cleanupUserPresence: SKIPPED (not setup or missing info).`);
      return;
    }

    try {
      const newRoomRef = doc(db, 'rooms', roomId);
      const newRoomDoc = await getDoc(newRoomRef);
      const isNewRoom = newRoomDoc.exists();
      const collectionName = isNewRoom ? 'rooms' : 'chatRooms';

      const userPresenceRef = doc(collection(db, collectionName, roomId, 'onlineUsers'), user.sessionId);
      const roomRef = doc(db, collectionName, roomId);

      const existingPresence = await getDoc(userPresenceRef);
      if (existingPresence.exists()) {
        const batch = writeBatch(db);
        batch.delete(userPresenceRef);
        batch.set(roomRef, { onlineCount: increment(-1) }, { merge: true });

        await batch.commit();
        console.log(`[Presence #${presenceId}] cleanupUserPresence: SUCCESS.`);
      }

      isPresenceSetup.current = false;
    } catch (error) {
      console.error(`[Presence #${presenceId}] Error cleaning up user presence:`, error);
    }
  };

  useEffect(() => {
    const effectId = generateId();
    console.log(`%c[Effect #${effectId}] RUNNING. Room: ${roomId}, User: ${user?.name}`, 'color: blue; font-weight: bold;');

    if (!roomId || !user) {
      console.log(`[Effect #${effectId}] SKIPPING (no roomId or user).`);
      setMessages([]);
      setLoading(false);
      return;
    }

    const unsubscribes: (() => void)[] = [];
    let isCancelled = false;

    const setupAll = async () => {
      console.log(`[Effect #${effectId}] setupAll: START.`);
      try {
        const cleanupPresence = await setupUserPresence();
        if (cleanupPresence) {
          unsubscribes.push(cleanupPresence);
        }

        if (isCancelled) {
          console.log(`[Effect #${effectId}] setupAll: CANCELLED during presence setup.`);
          return;
        }

        const newRoomRef = doc(db, 'rooms', roomId);
        const newRoomDoc = await getDoc(newRoomRef);
        if (isCancelled) {
          console.log(`[Effect #${effectId}] setupAll: CANCELLED after getting room doc.`);
          return;
        }
        const collectionName = newRoomDoc.exists() ? 'rooms' : 'chatRooms';
        console.log(`[Effect #${effectId}] setupAll: Determined collection name: ${collectionName}`);

        // 메시지 구독
        console.log(`[Effect #${effectId}] setupAll: Subscribing to MESSAGES.`);
        const messagesRef = collection(db, 'messages');
        const messagesQuery = query(messagesRef, where('roomId', '==', roomId), orderBy('timestamp', 'asc'));
        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
          console.log(`%c[Effect #${effectId}] ONSNAPSHOT: MESSAGES received (${snapshot.docs.length} docs).`, 'color: green;');
          const newMessages: ChatMessage[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
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
            };
          });
          setMessages(newMessages);
          setLoading(false);
        });
        unsubscribes.push(() => {
          console.log(`%c[Effect #${effectId}] CLEANUP: Unsubscribing from MESSAGES.`, 'color: orange;');
          unsubscribeMessages();
        });

        // 접속자 수 구독
        console.log(`[Effect #${effectId}] setupAll: Subscribing to ONLINE USERS COUNT.`);
        const roomRef = doc(db, collectionName, roomId);
        const unsubscribeOnlineUsers = onSnapshot(roomRef, (doc) => {
          console.log(`%c[Effect #${effectId}] ONSNAPSHOT: ONLINE USERS COUNT received.`, 'color: green;');
          setOnlineUsers(doc.data()?.onlineCount || 0);
        });
        unsubscribes.push(() => {
          console.log(`%c[Effect #${effectId}] CLEANUP: Unsubscribing from ONLINE USERS COUNT.`, 'color: orange;');
          unsubscribeOnlineUsers();
        });

        // 접속자 목록 구독
        console.log(`[Effect #${effectId}] setupAll: Subscribing to ONLINE USERS LIST.`);
        const onlineUsersRef = collection(db, collectionName, roomId, 'onlineUsers');
        const unsubscribeOnlineUsersList = onSnapshot(onlineUsersRef, (snapshot) => {
          console.log(`%c[Effect #${effectId}] ONSNAPSHOT: ONLINE USERS LIST received (${snapshot.docs.length} docs).`, 'color: green;');
          const usersList = snapshot.docs.map(doc => doc.data().nickname).filter(Boolean);
          setOnlineUsersList(usersList);
        });
        unsubscribes.push(() => {
          console.log(`%c[Effect #${effectId}] CLEANUP: Unsubscribing from ONLINE USERS LIST.`, 'color: orange;');
          unsubscribeOnlineUsersList();
        });

        console.log(`[Effect #${effectId}] setupAll: All subscriptions setup.`);

      } catch (error) {
        console.error(`[Effect #${effectId}] setupAll: ERROR`, error);
        setLoading(false);
      }
    };

    setupAll();

    const handleOnline = () => {
      console.log(`[Effect #${effectId}] Network status: online.`);
      if (!isPresenceSetup.current) {
        setupUserPresence();
      }
    };
    const handleOffline = () => {
      console.log(`[Effect #${effectId}] Network status: offline.`);
      cleanupUserPresence();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    unsubscribes.push(() => {
      console.log(`[Effect #${effectId}] CLEANUP: Removing network listeners.`);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    });

    return () => {
      console.log(`%c[Effect #${effectId}] CLEANUP RUNNING.`, 'color: red; font-weight: bold;');
      isCancelled = true;
      unsubscribes.forEach(unsub => unsub());
      cleanupUserPresence();
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
      const hasVoted = poll.options.some((option: any) => Array.isArray(option.voters) && option.voters.includes(userId));
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

      // 이미 응답했는지 확인
      const hasResponded = poll.wordCloudResponses?.some(resp =>
        typeof resp === 'string' && resp.includes(`[${userId}]`)
      ) || false;

      if (hasResponded) {
        console.log('User has already responded to this word cloud');
        return;
      }

      // 응답을 "[userId] response" 형태로 저장
      const formattedResponse = `[${userId}] ${response}`;
      const updatedResponses = [...(poll.wordCloudResponses || []), formattedResponse];

      await updateDoc(messageRef, {
        'poll.wordCloudResponses': updatedResponses
      });

      console.log('Word cloud response added successfully:', formattedResponse);
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
    onlineUsers,
    onlineUsersList
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

  const getRoomById = useCallback(async (roomId: string): Promise<ChatRoom | null> => {
    try {
      // 먼저 새로운 rooms 컬렉션에서 찾기
      const newRoomRef = doc(db, 'rooms', roomId);
      const newRoomDoc = await getDoc(newRoomRef);

      if (newRoomDoc.exists()) {
        const data = newRoomDoc.data();

        return {
          id: newRoomDoc.id,
          name: data.name,
          adminPassword: data.adminPassword,
          createdAt: data.createdAt?.toDate() || new Date(),
          isActive: data.isActive,
          ownerId: data.ownerId,
          ownerEmail: data.ownerEmail,
          ownerDisplayName: data.ownerDisplayName,
          adminName: data.adminName
        };
      }

      // 새로운 컬렉션에서 찾지 못한 경우 레거시 컬렉션에서 찾기
      const legacyRoomRef = doc(db, 'chatRooms', roomId);
      const legacyRoomDoc = await getDoc(legacyRoomRef);

      if (legacyRoomDoc.exists()) {
        const data = legacyRoomDoc.data();

        return {
          id: legacyRoomDoc.id,
          name: data.name,
          adminPassword: data.adminPassword,
          createdAt: data.createdAt?.toDate() || new Date(),
          isActive: data.isActive
        };
      }

      return null;
    } catch (error: any) {
      console.error('Error getting room:', error);
      return null;
    }
  }, []);

  const verifyAdminPassword = async (roomId: string, password: string): Promise<boolean> => {
    const room = await getRoomById(roomId);
    return room?.adminPassword === password;
  };

  return {
    createRoom,
    getRoomById,
    verifyAdminPassword,
    checkNicknameAvailability,
    generateSessionId
  };
}; 