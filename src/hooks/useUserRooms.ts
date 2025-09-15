import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { ChatRoom } from '../types';
import { useAuth } from './useAuth';

export const useUserRooms = () => {
  const { currentUser, authUser } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // 사용자의 채팅룸 목록 실시간 구독
  useEffect(() => {
    if (!currentUser) {
      setRooms([]);
      setLoading(false);
      return;
    }

    const roomsRef = collection(db, 'rooms');
    const q = query(
      roomsRef,
      where('ownerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData: ChatRoom[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        roomsData.push({
          id: doc.id,
          name: data.name,
          adminPassword: data.adminPassword,
          createdAt: data.createdAt?.toDate() || new Date(),
          isActive: data.isActive,
          ownerId: data.ownerId,
          ownerEmail: data.ownerEmail,
          ownerDisplayName: data.ownerDisplayName,
          adminName: data.adminName
        });
      });
      
      setRooms(roomsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // 새 채팅룸 생성
  const createRoom = async (
    name: string,
    adminName: string,
    adminPassword: string
  ): Promise<string> => {
    if (!currentUser || !authUser) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const roomData = {
        name,
        adminName,
        adminPassword,
        isActive: true,
        ownerId: currentUser.uid,
        ownerEmail: authUser.email,
        ownerDisplayName: authUser.displayName || adminName,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'rooms'), roomData);
      
      // 사용자의 룸 카운트 증가
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        roomCount: increment(1)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  // 채팅룸 삭제
  const deleteRoom = async (roomId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      await deleteDoc(doc(db, 'rooms', roomId));
      
      // 사용자의 룸 카운트 감소
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        roomCount: increment(-1)
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  };

  // 채팅룸 활성화/비활성화
  const toggleRoomStatus = async (roomId: string, isActive: boolean): Promise<void> => {
    if (!currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        isActive
      });
    } catch (error) {
      console.error('Error updating room status:', error);
      throw error;
    }
  };

  // 채팅룸 정보 업데이트
  const updateRoom = async (
    roomId: string,
    updates: Partial<Pick<ChatRoom, 'name' | 'adminName' | 'adminPassword'>>
  ): Promise<void> => {
    if (!currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, updates);
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  };

  return {
    rooms,
    loading,
    createRoom,
    deleteRoom,
    toggleRoomStatus,
    updateRoom
  };
};
