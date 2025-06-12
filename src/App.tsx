import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import UserLogin from './components/UserLogin';
import ChatRoom from './components/ChatRoom';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [roomName, setRoomName] = useState<string>('');

  const handleRoomCreated = (roomId: string, name: string, adminName: string) => {
    setUser({
      name: adminName,
      isAdmin: true,
      roomId
    });
    setRoomName(name);
  };

  const handleUserJoined = (userName: string, roomId: string, name: string) => {
    setUser({
      name: userName,
      isAdmin: false,
      roomId
    });
    setRoomName(name);
  };

  const handleLeave = () => {
    setUser(null);
    setRoomName('');
  };

  // If user is logged in, show chat room
  if (user) {
    return <ChatRoom user={user} roomName={roomName} onLeave={handleLeave} />;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<AdminLogin onRoomCreated={handleRoomCreated} />} 
        />
        <Route 
          path="/join" 
          element={<UserLogin onUserJoined={handleUserJoined} />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 