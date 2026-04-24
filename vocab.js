const STORAGE_KEY = 'nativespeakup_vocab';

export function saveVocab(entry) {
  const words = getVocab();
  const exists = words.find(w => w.word.toLowerCase() === entry.word.toLowerCase());
  if (!exists) words.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

export function getVocab() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function deleteVocab(word) {
  const words = getVocab().filter(w => w.word.toLowerCase() !== word.toLowerCase());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

export function exportVocab() {
  return getVocab()
    .map(w => `${w.word}: ${w.meaning}`)
    .join('\n');
}
