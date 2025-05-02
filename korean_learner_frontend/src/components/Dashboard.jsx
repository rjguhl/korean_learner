import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function Dashboard({ cards, sessionStats }) {
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

      {sessionStats.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2>📜 Past Sessions</h2>
          <ul>
            {sessionStats.map((s, i) => (
              <li key={i}>
                {new Date(s.timestamp).toLocaleString()} – {s.total} cards – {s.accuracy}% accuracy
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}