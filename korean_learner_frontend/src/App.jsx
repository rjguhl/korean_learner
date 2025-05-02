import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Review from './components/Review';
import SessionSummary from './components/SessionSummary';
import Login from './components/Login';
import { initialCards } from './data/cards';

const hardcodedUsers = [
  { username: 'admin', password: '1234' },
  { username: 'test', password: 'test' }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState({});

  const login = (username, password) => {
    const found = hardcodedUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      if (!userProgress[username]) {
        setUserProgress((prev) => ({ ...prev, [username]: initialCards }));
      }
      setUser(username);
      return true;
    }
    return false;
  };

  if (!user) {
    return <Login login={login} />;
  }

  const cards = userProgress[user] || [];
  const setCards = (newCards) => {
    setUserProgress((prev) => ({ ...prev, [user]: newCards }));
  };

  const [sessionStats, setSessionStats] = useState([]);
  const [lastSession, setLastSession] = useState(null);

  return (
    <Routes>
      <Route path="/" element={<Dashboard cards={cards} sessionStats={sessionStats} />} />
      <Route
        path="/review"
        element={
          <Review
            cards={cards}
            setCards={setCards}
            setLastSession={setLastSession}
            setSessionStats={setSessionStats}
          />
        }
      />
      <Route path="/summary" element={<SessionSummary lastSession={lastSession} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}