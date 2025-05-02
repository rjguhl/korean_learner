import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Learn({ cards, setCards }) {
  const navigate = useNavigate();
  const newCards = cards.filter((c) => !c.learned).slice(0, 10);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const current = newCards[index];

  const markLearned = () => {
    const updated = cards.map((card) =>
      card.id === current.id ? { ...card, learned: true, nextReview: Date.now() } : card
    );
    setCards(updated);
    setIndex((prev) => prev + 1);
    setShowBack(false);
  };

  if (index >= newCards.length) {
    return (
      <div className="App" style={{ marginTop: '4rem' }}>
        <h1 style={{ color: '#1d4ed8' }}>✅ Learning complete!</h1>
        <p>You’ve learned {newCards.length} new words. They’ll now appear in your review queue.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="App" style={{ marginTop: '4rem' }}>
      <h1 style={{ color: '#1d4ed8' }}>🧠 Learn New Words</h1>
      <p style={{ fontSize: '1.5rem', margin: '2rem' }}>{showBack ? current.back : current.front}</p>
      <div>
        {!showBack ? (
          <button onClick={() => setShowBack(true)} style={{ padding: '0.5rem 1rem' }}>Show Meaning</button>
        ) : (
          <button onClick={markLearned} style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px' }}>Got it</button>
        )}
      </div>
      <p style={{ marginTop: '2rem' }}>{index + 1} of {newCards.length} words</p>
    </div>
  );
}