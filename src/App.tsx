import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import AuthenticatedAdminLogin from './components/AuthenticatedAdminLogin';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import UserLogin from './components/UserLogin';
import ChatRoom from './components/ChatRoom';
import AuthProvider from './components/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { User } from './types';

const AppContent = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [roomName, setRoomName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      const storedRoomName = sessionStorage.getItem('roomName');
      if (storedUser && storedRoomName) {
        setUser(JSON.parse(storedUser));
        setRoomName(storedRoomName);
      }
    } catch (error) {
      console.error('Failed to parse user data from session storage', error);
      sessionStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);


  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleRoomCreated = (roomId: string, name: string, adminName: string) => {
    const newUser: User = {
      name: adminName,
      isAdmin: true,
      roomId,
      sessionId: generateSessionId()
    };
    sessionStorage.setItem('user', JSON.stringify(newUser));
    sessionStorage.setItem('roomName', name);
    setUser(newUser);
    setRoomName(name);
    navigate(`/chat/${roomId}`);
  };

  const handleUserJoined = (userName: string, roomId: string, name: string, sessionId: string) => {
    const newUser: User = {
      name: userName,
      isAdmin: false,
      roomId,
      sessionId
    };
    sessionStorage.setItem('user', JSON.stringify(newUser));
    sessionStorage.setItem('roomName', name);
    setUser(newUser);
    setRoomName(name);
    navigate(`/chat/${roomId}`);
  };

  const handleLeave = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('roomName');
    setUser(null);
    setRoomName('');
    navigate('/');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
        </div>
        <p className="mt-4 text-blue-800 font-medium animate-pulse">로딩 중...</p>
      </div>
    );
  }

  // 관리자 화면 렌더링 로직
  const renderAdminScreen = () => {
    if (user) {
      return <Navigate to={`/chat/${user.roomId}`} replace />;
    }

    // 로그인된 사용자가 있으면 새로운 인증 시스템 사용
    if (currentUser) {
      return <AuthenticatedAdminLogin onRoomCreated={handleRoomCreated} />;
    }

    // 로그인되지 않은 경우 새로운 환영 화면 표시
    return <WelcomeScreen />;
  };

  return (
    <Routes>
      <Route
        path="/"
        element={renderAdminScreen()}
      />
      <Route
        path="/signin"
        element={!user ? (
          <SignIn
            onSuccess={() => navigate('/')}
            onSwitchToSignUp={() => navigate('/signup')}
          />
        ) : <Navigate to={`/chat/${user.roomId}`} replace />}
      />
      <Route
        path="/signup"
        element={!user ? (
          <SignUp
            onSuccess={() => navigate('/')}
            onSwitchToLogin={() => navigate('/signin')}
          />
        ) : <Navigate to={`/chat/${user.roomId}`} replace />}
      />
      <Route
        path="/join"
        element={!user ? <UserLogin onUserJoined={handleUserJoined} /> : <Navigate to={`/chat/${user.roomId}`} replace />}
      />
      <Route
        path="/chat/:roomId"
        element={user ? <ChatRoom user={user} roomName={roomName} onLeave={handleLeave} /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'text-xs font-medium',
          style: {
            padding: '8px 12px',
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App; 