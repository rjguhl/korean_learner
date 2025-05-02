import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Dashboard({ cards, sessionStats }) {
  const navigate = useNavigate();
  const now = Date.now();
  const msInDay = 24 * 60 * 60 * 1000;

  const userEmail = auth.currentUser?.email;

  const reviewableCards = cards.filter((c) => c.learned && c.nextReview <= now);
  const dueToday = reviewableCards.length;
  const toLearn = cards.filter((c) => !c.learned).length;

  const totalCards = cards.length;
  const seenCards = cards.filter((c) => c.repetitions > 0).length;
  const averageEase = (
    cards.reduce((sum, c) => sum + c.easeFactor, 0) / totalCards
  ).toFixed(2);

  const forecastData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now + i * msInDay);
    const count = cards.filter(card =>
      card.learned && Math.floor((card.nextReview - now) / msInDay) === i
    ).length;

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      reviews: count
    };
  });

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleLearnClick = () => {
    if (toLearn > 0) navigate('/learn');
  };

  const handleReviewClick = () => {
    navigate('/review'); // Always allow navigation
  };

  return (
    <div className="App" style={{ maxWidth: '1200px', margin: '2rem auto', padding: '2rem', display: 'flex', gap: '2rem' }}>
      {/* Left Column: Summary + Buttons */}
      <div style={{ flex: 2 }}>
        <h1 style={{ color: '#1d4ed8', marginBottom: '1rem' }}>📘 Korean Learner Dashboard</h1>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={handleLearnClick}
            style={{
              flex: 1,
              padding: '1rem',
              fontSize: '1.2rem',
              backgroundColor: toLearn > 0 ? '#10b981' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Learn ({toLearn})
          </button>

          <button
            onClick={handleReviewClick}
            style={{
              flex: 1,
              padding: '1rem',
              fontSize: '1.2rem',
              backgroundColor: dueToday > 0 ? '#2563eb' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Review ({dueToday})
          </button>
        </div>

        <div style={{ marginBottom: '2rem', background: '#f9fafb', padding: '1rem', borderRadius: '10px' }}>
          <h2>📊 Your Progress</h2>
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

        {sessionStats.length > 0 && (
          <div>
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

      {/* Right Column: Profile + Forecast */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
          <img
            src="https://via.placeholder.com/80"
            alt="Profile Avatar"
            style={{ borderRadius: '50%', marginBottom: '1rem' }}
          />
          <p>Hello, <strong>{userEmail}</strong></p>
          <button
            onClick={handleLogout}
            style={{ marginTop: '1rem', backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>

        <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '10px' }}>
          <h2 style={{ textAlign: 'center' }}>📅 7-Day Forecast</h2>
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
      </div>
    </div>
  );
}