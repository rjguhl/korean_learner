export const getStorageKey = (email) => `cards_${email}`;

export function loadCards(email) {
  const raw = localStorage.getItem(getStorageKey(email));
  return raw ? JSON.parse(raw) : null;
}

export function saveCards(email, cards) {
  localStorage.setItem(getStorageKey(email), JSON.stringify(cards));
}

export function resetCards(email) {
  localStorage.removeItem(getStorageKey(email));
}