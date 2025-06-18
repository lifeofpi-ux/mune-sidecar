import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import UserLogin from './components/UserLogin';
import ChatRoom from './components/ChatRoom';
import { User } from './types';

const AppContent = () => {
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

  if (loading) {
    return <div className="flex items-center justify-center h-screen">로딩 중...</div>;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={!user ? <AdminLogin onRoomCreated={handleRoomCreated} /> : <Navigate to={`/chat/${user.roomId}`} replace />} 
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
    <Router>
      <AppContent />
    </Router>
  );
}

export default App; 