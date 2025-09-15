import { useState, useEffect, createContext, useContext } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AuthUser, AuthContextType } from '../types';

// 인증 컨텍스트 생성
export const AuthContext = createContext<AuthContextType | null>(null);

// 인증 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 인증 상태 관리 훅
export const useAuthState = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 사용자 문서 생성/업데이트
  const createOrUpdateUserDoc = async (user: FirebaseUser) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // 새 사용자 문서 생성
      const newAuthUser: AuthUser = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || '',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        roomCount: 0
      };
      
      await setDoc(userRef, {
        ...newAuthUser,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });
      
      setAuthUser(newAuthUser);
    } else {
      // 기존 사용자 로그인 시간 업데이트
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
      });
      
      const userData = userSnap.data();
      setAuthUser({
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName || '',
        createdAt: userData.createdAt?.toDate() || new Date(),
        lastLoginAt: new Date(),
        roomCount: userData.roomCount || 0
      });
    }
  };

  // 로그인
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createOrUpdateUserDoc(result.user);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // 회원가입
  const signup = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // 사용자 프로필 업데이트
      await updateProfile(result.user, {
        displayName: displayName
      });
      
      await createOrUpdateUserDoc(result.user);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // 구글 로그인
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      const result = await signInWithPopup(auth, provider);
      await createOrUpdateUserDoc(result.user);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // 로그아웃
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setAuthUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 재설정
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  // 회원 탈퇴
  const deleteAccount = async () => {
    if (!currentUser) {
      throw new Error('로그인된 사용자가 없습니다.');
    }

    setLoading(true);
    try {
      const userId = currentUser.uid;
      
      // 1. 사용자의 모든 채팅룸 삭제
      const roomsQuery = query(
        collection(db, 'rooms'),
        where('ownerId', '==', userId)
      );
      const roomsSnapshot = await getDocs(roomsQuery);
      
      const batch = writeBatch(db);
      
      // 각 채팅룸과 관련 메시지들 삭제
      for (const roomDoc of roomsSnapshot.docs) {
        // 채팅룸 메시지들 삭제
        const messagesQuery = query(
          collection(db, `rooms/${roomDoc.id}/messages`)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        
        messagesSnapshot.docs.forEach(messageDoc => {
          batch.delete(messageDoc.ref);
        });
        
        // 채팅룸 삭제
        batch.delete(roomDoc.ref);
      }
      
      // 2. 사용자 문서 삭제
      const userDocRef = doc(db, 'users', userId);
      batch.delete(userDocRef);
      
      // 3. Firestore 배치 실행
      await batch.commit();
      
      // 4. Firebase Auth 계정 삭제
      await deleteUser(currentUser);
      
      // 5. 로컬 상태 초기화
      setCurrentUser(null);
      setAuthUser(null);
      
    } catch (error: any) {
      setLoading(false);
      
      // 재인증이 필요한 경우
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('보안을 위해 다시 로그인한 후 탈퇴해주세요.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 인증 상태 변경 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await createOrUpdateUserDoc(user);
      } else {
        setAuthUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    authUser,
    login,
    signup,
    signInWithGoogle,
    logout,
    resetPassword,
    deleteAccount,
    loading
  };

  return value;
};
