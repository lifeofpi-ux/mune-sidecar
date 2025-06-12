import { useState, useEffect } from 'react';
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
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { ChatMessage, ChatRoom, Poll } from '../types';

export const useChat = (roomId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
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

    return () => unsubscribe();
  }, [roomId]);

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
      
      // 현재 메시지에서 설문조사 데이터 찾기
      const currentMessage = messages.find(msg => msg.id === messageId);
      if (!currentMessage?.poll || currentMessage.poll.type !== 'word-cloud') return;

      const poll = currentMessage.poll;
      
      // 이미 응답했는지 확인
      const hasResponded = poll.wordCloudResponses?.some(resp => resp.includes(`[${userId}]`)) || false;
      if (hasResponded) return;

      // 응답 추가 (사용자 ID 포함하여 중복 방지)
      const newResponse = `${response} [${userId}]`;
      const updatedResponses = [...(poll.wordCloudResponses || []), newResponse];

      await updateDoc(messageRef, {
        'poll.wordCloudResponses': updatedResponses
      });
    } catch (error) {
      console.error('Error adding word cloud response:', error);
    }
  };

  return { messages, loading, sendMessage, voteOnPoll, closePoll, addWordCloudResponse };
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
  const [_rooms, _setRooms] = useState<ChatRoom[]>([]);

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

  return { rooms: _rooms, createRoom, getRoomById, verifyAdminPassword };
}; 