export function normalize(text) {
    return text.toLowerCase().replace(/[.,!?']/g, '').replace(/\s+/g, ' ').trim();
  }
  
  export function levenshtein(a, b) {
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
  
  export function updateCard(card, quality) {
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