import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalize, levenshtein, updateCard } from '../utils/helpers';

export default function Review({ cards, setCards, setLastSession, setSessionStats }) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [reviewAgainQueue, setReviewAgainQueue] = useState([]);
  const [reviewed, setReviewed] = useState([]);

  const initialQueue = cards.filter(card => card.nextReview <= Date.now());
  const [sessionQueue, setSessionQueue] = useState(initialQueue);
  const [currentCard, setCurrentCard] = useState(initialQueue[0] || null);

  const totalToReview = initialQueue.length;

  useEffect(() => {
    if (!currentCard) {
      if (sessionQueue.length > 0) {
        setCurrentCard(sessionQueue[0]);
        setSessionQueue(prev => prev.slice(1));
      } else if (reviewAgainQueue.length > 0) {
        setCurrentCard(reviewAgainQueue[0]);
        setReviewAgainQueue(prev => prev.slice(1));
      }
    }
  }, [currentCard, sessionQueue, reviewAgainQueue]);

  const totalReviewed = reviewed.length;
  const percentComplete = Math.round((totalReviewed / totalToReview) * 100);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCard) return;

    const userAnswer = normalize(input);
    const correctAnswer = normalize(currentCard.back);
    const distance = levenshtein(userAnswer, correctAnswer);

    let score = 0;
    const correct = userAnswer === correctAnswer || distance <= 2;
    if (correct) {
      score = 5;
      setFeedback('✅ Perfect!');
    } else {
      score = 1;
      setFeedback(`❌ Wrong. Correct: "${currentCard.back}"`);
      setReviewAgainQueue((prev) => [...prev, currentCard]);
    }

    const updatedCard = updateCard(currentCard, score);
    const updatedCards = cards.map(c => c.id === currentCard.id ? updatedCard : c);
    setCards(updatedCards);

    if (correct) {
      setReviewed(prev => [...prev, {
        id: currentCard.id,
        front: currentCard.front,
        correct: true,
        userAnswer,
        correctAnswer: currentCard.back
      }]);
    }

    setInput('');
    setShowAnswer(true);

    setTimeout(() => {
      setShowAnswer(false);
      setFeedback('');

      if (sessionQueue.length > 0) {
        setCurrentCard(sessionQueue[0]);
        setSessionQueue(prev => prev.slice(1));
      } else if (reviewAgainQueue.length > 0) {
        setCurrentCard(reviewAgainQueue[0]);
        setReviewAgainQueue(prev => prev.slice(1));
      } else {
        const total = reviewed.length;
        const correctCount = reviewed.filter(r => r.correct).length;

        const wrongCards = reviewed.filter(r => !r.correct);

        const summary = {
          timestamp: new Date(),
          total,
          correct: correctCount,
          accuracy: total > 0 ? Math.round((correctCount / total) * 100) : 0,
          wrongCards
        };

        setLastSession(summary);
        setSessionStats(prev => [summary, ...prev]);
        navigate('/summary');
      }
    }, 1500);
  };

  if (!currentCard) {
    return (
      <div className="App">
        <h1>🎉 All reviews complete!</h1>
        <button onClick={() => navigate('/')}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="App" style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#1d4ed8', marginBottom: '1rem' }}>Review Time</h1>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ height: '20px', backgroundColor: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${percentComplete}%`,
              backgroundColor: '#3b82f6',
              height: '100%',
              transition: 'width 0.3s ease'
            }}
          ></div>
        </div>
        <p style={{ marginTop: '0.5rem' }}>
          {totalReviewed}/{totalToReview} cards reviewed
        </p>
      </div>

      <div className="flashcard" style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem',
        fontSize: '1.75rem',
        fontWeight: 'bold'
      }}>
        {currentCard.front}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type the English meaning..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={showAnswer}
          style={{
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '2px solid #cbd5e1',
            width: '100%',
            marginBottom: '0.75rem'
          }}
        />
        <button
          type="submit"
          disabled={showAnswer}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Submit
        </button>
      </form>

      {showAnswer && (
        <p className="feedback" style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
          {feedback}
        </p>
      )}

      <button onClick={() => navigate('/')} style={{ marginTop: '1.5rem' }}>
        ⬅ Back to Dashboard
      </button>
    </div>
  );
}