// lib/typing/words.ts
//
// Hand-authored lowercase word pool for the typing game's Words stages —
// kid-friendly everyday words + math vocabulary (add, sum, plus, half…) so
// the typing game doubles as English vocab exposure.
//
// `wordsFor(letters)` filters to words spellable with the learned keys.
// Verified: every cumulative key set from unit 4 up yields ≥ 12 words
// (unit 4 = a d f g h j k l s → dad/add/ask/glad/flag/salad/half/…).

const WORDS: string[] = [
  // --- unit 4 letters (a d f g h j k l s) ---
  'dad', 'sad', 'add', 'gas', 'has', 'had', 'ask', 'all', 'fall', 'hall',
  'glad', 'flag', 'dash', 'salad', 'glass', 'flash', 'shall', 'half',
  'lads', 'sag', 'gal', 'ash', 'lash',
  // --- + e i (unit 5) ---
  'he', 'she', 'is', 'his', 'if', 'like', 'life', 'fish', 'dish', 'desk',
  'idea', 'seal', 'slide', 'lake', 'leaf', 'safe', 'side', 'hide', 'kids',
  'less', 'else', 'shake', 'skill', 'field', 'said', 'sail', 'hill',
  'fill', 'silk', 'shelf', 'jade',
  // --- + r u (unit 6) ---
  'run', 'rule', 'ruler', 'sure', 'sugar', 'jar', 'dear', 'hair', 'girl',
  'user', 'rush', 'fur', 'fire', 'read', 'are', 'ear', 'hear', 'here',
  'ride', 'rise', 'grass', 'dress', 'fresh', 'share', 'shark', 'rugs',
  'guard', 'radius', 'ladder',
  // --- + t y (unit 7) ---
  'try', 'yes', 'salt', 'just', 'little', 'turtle', 'eight', 'digit',
  'study', 'start', 'tree', 'star', 'its', 'sit', 'eat', 'ate', 'late',
  'gate', 'that', 'this', 'they', 'stay', 'yeti', 'tiger', 'light',
  'right', 'sister', 'faster', 'daughter', 'guitar', 'thirty',
  // --- + w o q p (unit 8) ---
  'two', 'four', 'plus', 'word', 'work', 'group', 'square', 'equal',
  'house', 'water', 'people', 'apple', 'play', 'park', 'wood', 'door',
  'pool', 'stop', 'top', 'hop', 'ship', 'sheep', 'horse', 'happy',
  'purple', 'yellow', 'power', 'paper', 'tulip', 'quiet', 'quest',
  'photo', 'sport', 'party', 'together',
  // --- + v m b n (unit 9) ---
  'number', 'minus', 'seven', 'nine', 'ten', 'sum', 'name', 'move',
  'brain', 'banana', 'mom', 'man', 'moon', 'sun', 'nut', 'bee', 'bird',
  'bear', 'lion', 'monkey', 'mouse', 'brave', 'jump', 'game', 'time',
  'money', 'minute', 'morning', 'seventy', 'ninety', 'even', 'noon',
  'mango', 'melon', 'lemon', 'begin', 'burger', 'button', 'brown',
  'eleven', 'twenty', 'hundred',
  // --- + c x z (unit 10) ---
  'zero', 'six', 'sixty', 'count', 'dozen', 'exact', 'pizza', 'zebra',
  'box', 'cat', 'ice', 'nice', 'face', 'juice', 'circle', 'crazy',
  'cool', 'cake', 'candy', 'clock', 'crab', 'excited', 'zigzag',
  'zoom', 'maze', 'prize', 'exam', 'mix', 'next', 'zoo', 'centimeter',
];

// Dedupe + keep the list honest (letters only).
const CLEAN = [...new Set(WORDS)].filter((w) => /^[a-z]+$/.test(w));

// Words spellable using ONLY the given letters (space handled by caller).
export function wordsFor(letters: string[]): string[] {
  const set = new Set(letters);
  return CLEAN.filter((w) => [...w].every((ch) => set.has(ch)));
}
