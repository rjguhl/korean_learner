import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function normalize(text) {
  return text.toLowerCase().replace(/[.,!?']/g, '').replace(/\s+/g, ' ').trim();
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function updateCard(card, quality) {
  let { repetitions, interval, easeFactor } = card;
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    repetitions += 1;
    interval = repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round(interval * easeFactor);
  }
  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;
  return { ...card, repetitions, interval, easeFactor, nextReview };
}

const initialCards = [
  { id: 1, front: '안녕하세요', back: 'hello', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 2, front: '감사합니다', back: 'thank you', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 3, front: '사랑해요', back: 'i love you', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 4, front: '잘 지내세요?', back: 'how are you?', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 5, front: '죄송합니다', back: 'sorry', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 6, front: '괜찮아요', back: 'it’s okay', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 7, front: '이름이 뭐예요?', back: 'what is your name?', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 8, front: '천만에요', back: 'you’re welcome', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 9, front: '알겠습니다', back: 'understood', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 10, front: '좋은 하루 되세요', back: 'have a nice day', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 11, front: '배고파요', back: 'i’m hungry', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 12, front: '맛있어요', back: 'it’s delicious', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 13, front: '화장실 어디예요?', back: 'where is the bathroom?', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 14, front: '얼마예요?', back: 'how much is it?', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 15, front: '도와주세요', back: 'please help me', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 16, front: '괜찮습니다', back: 'it’s fine', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 17, front: '지금 몇 시예요?', back: 'what time is it?', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 18, front: '잘 자요', back: 'sleep well', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 19, front: '안녕히 계세요', back: 'goodbye (you stay)', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() },
  { id: 20, front: '안녕히 가세요', back: 'goodbye (you go)', repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: Date.now() }
];

function App() {
  const [cards, setCards] = useState(initialCards);

  return (
    <Routes>
      <Route path="/" element={<Dashboard cards={cards} />} />
      <Route path="/review" element={<Review cards={cards} setCards={setCards} />} />
    </Routes>
  );
}

function Dashboard({ cards }) {
  const navigate = useNavigate();
  const now = Date.now();
  const msInDay = 24 * 60 * 60 * 1000;

  const dueToday = cards.filter((c) => c.nextReview <= now).length;
  const nextDue = new Date(Math.min(...cards.map((c) => c.nextReview)));

  const totalCards = cards.length;
  const seenCards = cards.filter((c) => c.repetitions > 0).length;
  const averageEase = (
    cards.reduce((sum, c) => sum + c.easeFactor, 0) / totalCards
  ).toFixed(2);

  const forecastData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now + i * msInDay);
    const count = cards.filter(card =>
      Math.floor((card.nextReview - now) / msInDay) === i
    ).length;

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      reviews: count
    };
  });

  return (
    <div className="App" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1 style={{ color: '#1d4ed8', marginBottom: '1.5rem' }}>📘 Korean Learner Dashboard</h1>

      {/* Summary Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>📊 Summary</h2>
        <p><strong>Reviews due now:</strong> {dueToday}</p>
        <p><strong>Next review:</strong> {nextDue.toDateString()}</p>
        <p><strong>Total cards:</strong> {totalCards}</p>
        <p><strong>Cards seen:</strong> {seenCards} ({Math.round((seenCards / totalCards) * 100)}%)</p>
        <p><strong>Average ease factor:</strong> {averageEase}</p>
        <h3 style={{ marginTop: '1rem' }}>
          {seenCards === totalCards
            ? '🌟 You’ve seen every card!'
            : seenCards > 0
            ? '🔥 Keep it up! You’re making progress.'
            : '🚀 Let’s get started!'}
        </h3>
      </div>

      {/* Forecast Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>📅 7-Day Review Forecast</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={forecastData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="reviews" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <button
        onClick={() => navigate('/review')}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Start Reviews
      </button>
    </div>
  );
}

function Review({ cards, setCards }) {
  const [input, setInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [currentCard, setCurrentCard] = useState(() =>
    cards.find(card => card.nextReview <= Date.now()) || null
  );

  useEffect(() => {
    if (!currentCard) {
      const next = cards.find(card => card.nextReview <= Date.now());
      if (next) setCurrentCard(next);
    }
  }, [cards, currentCard]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCard) return;

    const userAnswer = normalize(input);
    const correctAnswer = normalize(currentCard.back);
    const distance = levenshtein(userAnswer, correctAnswer);

    let score = 0;
    if (userAnswer === correctAnswer) {
      score = 5;
      setFeedback('✅ Perfect!');
    } else if (distance <= 2) {
      score = 4;
      setFeedback(`➖ Close enough (typo ok). Correct: "${currentCard.back}"`);
    } else if (
      correctAnswer.includes(userAnswer) ||
      userAnswer.includes(correctAnswer)
    ) {
      score = 3;
      setFeedback(`➖ Partial match. Correct: "${currentCard.back}"`);
    } else {
      score = 1;
      setFeedback(`❌ Wrong. Correct: "${currentCard.back}"`);
    }

    const updatedCard = updateCard(currentCard, score);
    const updatedCards = cards.map((c) =>
      c.id === currentCard.id ? updatedCard : c
    );
    setCards(updatedCards);
    setInput('');
    setShowAnswer(true);

    setTimeout(() => {
      setShowAnswer(false);
      setFeedback('');
      const nextDue = updatedCards.find((c) => c.nextReview <= Date.now());
      setCurrentCard(nextDue || null);
    }, 2000);
  };

  if (!currentCard) {
    return (
      <div className="App">
        <h1>🎉 All reviews complete!</h1>
        <p>Check back later.</p>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Review Time</h1>
      <div className="flashcard">
        <p className="korean">{currentCard.front}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type the English meaning..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={showAnswer}
        />
        <button type="submit" disabled={showAnswer}>
          Submit
        </button>
      </form>
      {showAnswer && <p className="feedback">{feedback}</p>}
    </div>
  );
}

export default App;