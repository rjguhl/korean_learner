import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Review from './components/Review';
import SessionSummary from './components/SessionSummary';
import { initialCards } from './data/cards';

export default function App() {
  const [cards, setCards] = useState(initialCards);
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
    </Routes>
  );
}