import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';


export default function Review({ cards, setCards, setLastSession, setSessionStats }) {
  const navigate = useNavigate();
  const now = Date.now();

  const originalReviewCards = useMemo(() => cards.filter(c => c.learned && c.nextReview <= now), [cards]);
  const [queue, setQueue] = useState(originalReviewCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [session, setSession] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [reviewedMap, setReviewedMap] = useState({});

  const current = queue[currentIndex];
  const [totalCards] = useState(originalReviewCards.length);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!showResult && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showResult]);

  useEffect(() => {
    if (currentIndex >= queue.length && session.total >= totalCards) {  
      const timestamp = Date.now();
      const accuracy = Math.round((session.correct / session.total) * 100);
      const summary = {
        timestamp,
        total: session.total,
        correct: session.correct,
        accuracy
      };
      setLastSession(summary);
      setSessionStats((prev) => [summary, ...prev]);
      navigate('/summary');
    }
  }, [currentIndex, queue.length, session, navigate, setLastSession, setSessionStats]);

  useEffect(() => {
    document.querySelector('.App')?.focus();
  }, []);  

  const normalize = (text) => text.toLowerCase().replace(/[.,!?']/g, '').trim();

  const handleSubmit = () => {
    const correct = normalize(input) === normalize(current.back);
    setIsCorrect(correct);
    setShowResult(true);
    setFeedback(correct ? '✅ Correct!' : `❌ Incorrect. Answer: ${current.back}`);

    const updatedCards = cards.map((card) => {
      if (card.id === current.id && correct) {
        const newEF = Math.max(1.3, card.easeFactor + 0.1);
        const newInterval = Math.round((card.interval || 1) * newEF);
        return {
          ...card,
          easeFactor: newEF,
          interval: newInterval,
          repetitions: card.repetitions + 1,
          nextReview: Date.now() + newInterval * 24 * 60 * 60 * 1000
        };
      }
      return card;
    });    

    setCards(updatedCards);

    setReviewedMap((prev) => {
      const alreadyReviewed = prev[current.id];
      const wasWrongBefore = alreadyReviewed === false;

      if (correct && !alreadyReviewed) {
        setSession((s) => ({
          correct: s.correct + 1,
          total: s.total + 1
        }));
      }

      if (!correct && alreadyReviewed === undefined) {
        setSession((s) => ({
          ...s,
          total: s.total + 0
        }));
      }

      return {
        ...prev,
        [current.id]: wasWrongBefore ? false : correct
      };
    });

    if (!correct) {
      setQueue((prev) => [...prev, current]);
    }
  };

  const handleNext = () => {
    setShowResult(false);
    setInput('');
    setCurrentIndex((prev) => prev + 1);
    
    setTimeout(() => {
      document.querySelector('.App')?.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showResult) {
        handleNext();
      } else {
        handleSubmit();
      }
    }
  };

  if (!current) {
    return (
      <div className="App" style={{ marginTop: '4rem' }}>
        <h2>No cards due for review right now.</h2>
        <button onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const background = showResult ? (isCorrect ? '#d1fae5' : '#fee2e2') : 'white';

  return (
    <div
      className="App"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        marginTop: '2rem',
        backgroundColor: background,
        transition: 'background-color 0.3s ease'
      }}
    >
      <h1 style={{ color: '#1d4ed8' }}>Review Time</h1>
      <div style={{ margin: '1rem auto', width: '80%', maxWidth: '400px', backgroundColor: '#e5e7eb', borderRadius: '10px', height: '12px' }}>
        <div style={{
          width: `${(session.correct / totalCards) * 100}%`,
          backgroundColor: '#3b82f6',
          height: '100%',
          borderRadius: '10px'
        }}></div>
      </div>
      <p>{session.total} / {totalCards} cards reviewed</p>
  
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: '2rem', margin: '2rem' }}
        >
          {current.front}
        </motion.div>
      </AnimatePresence>
  
      {showResult ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ fontSize: '1.2rem' }}>{feedback}</div>
          <button
            onClick={handleNext}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              backgroundColor: isCorrect ? '#10b981' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px'
            }}
          >
            Next
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type the English meaning..."
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              width: '300px',
              marginBottom: '1rem'
            }}
          />
          <br />
          <button
            onClick={handleSubmit}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px'
            }}
          >
            Submit
          </button>
        </motion.div>
      )}
  
      <div style={{ marginTop: '1rem', minHeight: '2rem' }}></div>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '2rem',
          backgroundColor: '#111827',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '6px'
        }}
      >
        ← Back to Dashboard
      </button>
    </div>
  );  
}