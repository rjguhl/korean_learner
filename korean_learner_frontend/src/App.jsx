import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Review from './components/Review';
import SessionSummary from './components/SessionSummary';
import Login from './components/Login';
import Learn from './components/Learn';
import { initialCards } from './data/cards';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export default function App() {
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [sessionStats, setSessionStats] = useState([]);
  const [lastSession, setLastSession] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        setUser(uid);
        if (!userProgress[uid]) {
          setUserProgress((prev) => ({ ...prev, [uid]: initialCards }));
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [userProgress]);

  if (!user) return <Login />;

  const cards = userProgress[user] || [];
  const setCards = (newCards) => {
    setUserProgress((prev) => ({ ...prev, [user]: newCards }));
  };

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
      <Route
        path="/learn"
        element={
          <Learn
            cards={cards}
            setCards={setCards}
          />
        }
      />
      <Route path="/summary" element={<SessionSummary lastSession={lastSession} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}