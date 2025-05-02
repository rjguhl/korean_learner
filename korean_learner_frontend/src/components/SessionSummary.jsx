export default function SessionSummary({ lastSession }) {
    if (!lastSession) {
      return (
        <div className="App">
          <h1>No session summary available</h1>
        </div>
      );
    }
  
    return (
      <div className="App" style={{ padding: '2rem' }}>
        <h1>📊 Session Summary</h1>
        <p><strong>Date:</strong> {new Date(lastSession.timestamp).toLocaleString()}</p>
        <p><strong>Cards reviewed:</strong> {lastSession.total}</p>
        <p><strong>Correct:</strong> {lastSession.correct}</p>
        <p><strong>Accuracy:</strong> {lastSession.accuracy}%</p>
  
        {lastSession.wrongCards.length > 0 && (
          <>
            <h2 style={{ marginTop: '1.5rem' }}>❌ Incorrect Answers</h2>
            <ul>
              {lastSession.wrongCards.map((w, idx) => (
                <li key={idx}>
                  <strong>{w.front}</strong> — Your answer: "{w.userAnswer}" | Correct: "{w.correctAnswer}"
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }  