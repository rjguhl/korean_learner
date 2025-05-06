import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useState } from 'react';

export default function Dashboard({ cards, sessionStats }) {
  const navigate = useNavigate();
  const now = Date.now();
  const msInDay = 24 * 60 * 60 * 1000;
  const [dayOffset, setDayOffset] = useState(0);

  const userEmail = auth.currentUser?.email;

  const dueToday = cards.filter((c) => c.learned && c.nextReview <= now).length;
  const toLearn = cards.filter((c) => !c.learned).length;

  const totalCards = cards.length;
  const seenCards = cards.filter((c) => c.repetitions > 0).length;
  const averageEase = (
    cards.reduce((sum, c) => sum + c.easeFactor, 0) / totalCards
  ).toFixed(2);

  const selectedDay = new Date(now + dayOffset * msInDay);
  selectedDay.setHours(0, 0, 0, 0);

  const intervalSize = 3;
  const hourlyGroups = Array.from({ length: 24 / intervalSize }, (_, i) => {
    const startHour = i * intervalSize;
    const endHour = startHour + intervalSize;

    const start = new Date(selectedDay);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(endHour, 0, 0, 0);

    const count = cards.filter(card =>
      card.learned &&
      card.nextReview > now &&
      card.nextReview >= start.getTime() &&
      card.nextReview < end.getTime()
    ).length;    

    return {
      startHour,
      count,
      label: `${formatHour(startHour)}`
    };
  });

  function formatHour(hour) {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const adjusted = hour % 12 === 0 ? 12 : hour % 12;
    return `${adjusted}:00 ${suffix}`;
  }

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleLearnClick = () => {
    if (toLearn > 0) navigate('/learn');
  };

  const handleReviewClick = () => {
    const reviewable = cards.filter((c) => c.learned && c.nextReview <= now);
    if (reviewable.length > 0) navigate('/review');
  };

  const recentMistakes = cards
    .filter(c => c.lastIncorrect && Date.now() - c.lastIncorrect < 7 * msInDay)
    .sort((a, b) => b.lastIncorrect - a.lastIncorrect)
    .slice(0, 5);

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

          {recentMistakes.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>🛑 Recent Mistakes</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {recentMistakes.map((card) => (
                  <li key={card.id} style={{ marginBottom: '0.25rem', color: '#ef4444' }}>
                    <strong>{card.front}</strong> – {card.back}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>📅 Review Forecast</h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <button
              onClick={() => { if (dayOffset > 0) setDayOffset(d => d - 1); }}
              style={{
                backgroundColor: dayOffset === 0 ? '#d1d5db' : '#e5e7eb',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                color: '#374151',
                cursor: dayOffset === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ←
            </button>
            <h3 style={{ margin: 0 }}>{dayOffset === 0 ? 'Today' : selectedDay.toLocaleDateString()}</h3>
            <button
              onClick={() => setDayOffset(d => d + 1)}
              style={{
                backgroundColor: '#e5e7eb',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row' }}>
            {/* Time Labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: '#6b7280', marginRight: '0.5rem' }}>
              {hourlyGroups.map((g, i) => (
                <div key={i} style={{ height: '24px' }}>{g.label}</div>
              ))}
            </div>

            {/* Review Blocks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
              {hourlyGroups.map((g, i) => (
                <div
                  key={i}
                  title={`${g.count} review${g.count !== 1 ? 's' : ''} from ${g.label} to ${formatHour(g.startHour + intervalSize)}`}
                  style={{
                    height: '24px',
                    backgroundColor: g.count > 0 ? '#3b82f6' : '#e5e7eb',
                    borderRadius: '4px',
                    cursor: g.count > 0 ? 'pointer' : 'default'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}