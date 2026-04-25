import { buildPrompt } from './prompt.js';
import { getVocab, saveVocab, deleteVocab, exportVocab } from './vocab.js';
import { getLog, getStreak, getTotalDays, getTotalSessions, markPracticed, dateKey } from './tracker.js';
import { PHRASES } from './phrases.js';
import {
  speakWithAvatar,
  getDIDKey,
  saveDIDKey,
  getPresenterUrl,
  savePresenterUrl,
  uploadPresenterPhoto,
} from './did.js';

const PROXY_BASE = 'http://localhost:3099';

const STORAGE_KEYS = {
  aiMode: 'nativespeakup_ai_mode',
  avatarOn: 'nativespeakup_avatar_on',
  speakingGoal: 'nativespeakup_speaking_goal',
  model: 'nativespeakup_model',
  ollamaUrl: 'nativespeakup_ollama_url',
  webllmModel: 'nativespeakup_webllm_model',
  hfToken: 'nativespeakup_hf_token',
  cloudUrl: 'nativespeakup_cloud_url',
  cloudKey: 'nativespeakup_cloud_key',
  cloudModel: 'nativespeakup_cloud_model',
};

const DEFAULTS = {
  model: 'gemma3:4b',
  ollamaUrl: 'http://localhost:11434',
  webllmModel: 'gemma3-1b',
  cloudUrl: 'https://api.openai.com/v1',
  cloudModel: 'gpt-4o-mini',
};

// URLs verified: return HTTP 401 (gated) not 404 — correct paths, need HF token + license acceptance
const GEMMA_WEB_MODELS = [
  {
    id: 'gemma3-1b',
    name: 'Gemma 3 · 1B',
    url: 'https://huggingface.co/litert-community/Gemma3-1B-IT/resolve/main/gemma3-1b-it-int4-web.task',
  },
  {
    id: 'gemma-3n-e2b',
    name: 'Gemma 3n · E2B',
    url: 'https://huggingface.co/google/gemma-3n-E2B-it-litert-lm/resolve/main/gemma-3n-E2B-it-int4-Web.litertlm',
  },
];

const MODEL_CACHE = 'nativespeakup-models-v1';

const SPEAKING_GOALS = {
  learn: {
    key: 'learn',
    title: 'Learn Speaking',
    description: 'General speaking practice for learners of any age with simple everyday prompts.',
    topicHint: 'Tap “Generate Topic” for a simple everyday speaking prompt that works for learners of any age.',
    outputLabel: 'Clearer Version',
    scoreLabel: 'Speaking score',
    coachGoal: 'general English speaking practice',
    rewriteTarget: 'clear, natural, age-appropriate spoken English',
    scoreFocus: 'clarity, grammar, simple natural phrasing, and ease of speaking aloud',
    extraGuidance: 'Keep the corrected version warm, simple, and natural. Avoid business jargon unless the user already used it.',
    readyCopy: 'Use the microphone below to practice everyday speaking with clearer, easier English.',
    topics: [
      'Talk about something you enjoy doing in your free time and why you like it.',
      'Describe your morning routine from the time you wake up.',
      'Talk about your favorite food and explain why you enjoy it.',
      'Describe a person who is important to you and what makes them special.',
      'Talk about a place you like visiting and what you do there.',
      'Describe a movie, show, or book you enjoyed recently.',
      'Talk about a skill you want to improve this year.',
      'Describe a happy memory that you still remember clearly.',
      'Talk about your favorite season and what makes it special for you.',
      'Describe how you usually spend a weekend.',
      'Talk about something new you learned recently.',
      'Describe a hobby you would like to try in the future.',
    ],
  },
  confident: {
    key: 'confident',
    title: 'Sound Confident Anywhere',
    description: 'Practice sounding clear, assertive, and natural in everyday conversations anywhere.',
    topicHint: 'Tap “Generate Topic” for a prompt that helps you sound confident in daily life, travel, school, or social situations.',
    outputLabel: 'Confident Version',
    scoreLabel: 'Confidence score',
    coachGoal: 'clear, confident speaking in everyday life',
    rewriteTarget: 'clear, confident, natural English for everyday situations',
    scoreFocus: 'clarity, confidence, directness, and natural spoken flow',
    extraGuidance: 'Make the corrected version sound confident without becoming stiff or corporate. It should work well in daily life, school, travel, or social situations.',
    readyCopy: 'Use the microphone below to practice sounding more confident in everyday conversations.',
    topics: [
      'Introduce yourself to someone you have just met and make a good first impression.',
      'Explain your opinion on a simple topic and support it clearly.',
      'Describe a small problem you solved on your own.',
      'Talk about a time you had to ask for help and how you did it.',
      'Explain how you would politely disagree with someone you respect.',
      'Describe a place you want to visit and why you would enjoy it.',
      'Talk about a goal you are working toward right now.',
      'Describe how you would ask a question confidently in a new place.',
      'Talk about a decision you made recently and why you made it.',
      'Explain how you would encourage a friend who feels nervous.',
      'Describe a time you felt proud of yourself.',
      'Talk about how you would handle a misunderstanding calmly and clearly.',
    ],
  },
  professional: {
    key: 'professional',
    title: 'Sound Professional',
    description: 'Practice polished workplace communication, updates, meetings, and career conversations.',
    topicHint: 'Tap “Generate Topic” for a workplace or professional communication prompt.',
    outputLabel: 'Professional Version',
    scoreLabel: 'Professional score',
    coachGoal: 'confident professional English',
    rewriteTarget: 'confident, polished professional English',
    scoreFocus: 'clarity, professionalism, structure, and confidence for work communication',
    extraGuidance: 'Use polished professional language suitable for work, leadership, meetings, and business communication.',
    readyCopy: 'Use the microphone below to practice stronger professional English for work and career situations.',
    topics: [
      'Describe the project you are working on right now and what your role is.',
      'Talk about a problem you solved at work recently and how you approached it.',
      'Explain a technical concept you use daily as if teaching it to a newcomer.',
      'Describe a time you disagreed with a decision at work and how you handled it.',
      'Talk about a goal you want to achieve in the next three months.',
      'Describe your ideal workday from morning to evening.',
      'Explain how you prioritize tasks when everything feels urgent.',
      'Talk about a piece of feedback you received that changed how you work.',
      'Describe the best team you have ever worked in and what made it great.',
      'Explain how you would onboard yourself to a new codebase or project.',
      'Talk about a skill you are actively trying to improve and why.',
      'Describe a recent meeting, what was discussed, and what was decided.',
      'Explain what you do when you are stuck on a hard problem.',
      'Talk about something you learned in the last week at work.',
      'Describe how you communicate progress on a project to your manager.',
      'Explain a mistake you made at work and what you learned from it.',
      'Talk about what makes a presentation effective in your experience.',
      'Describe a time you had to convince someone to adopt your idea.',
      'Explain how you stay focused when working from home or in a distracting environment.',
      'Talk about where you see yourself professionally in two years.',
    ],
  },
};

const settingsBtn = document.getElementById('settings-btn');
const settingsOverlay = document.getElementById('settings-overlay');
const closeSettingsBtn = document.getElementById('close-settings');

const modelInput = document.getElementById('f-model');
const ollamaUrlInput = document.getElementById('f-ollama-url');
const modelPicker = document.getElementById('model-picker');
const pullCmdText = document.getElementById('pull-cmd-text');
const pullCopyBtn = document.getElementById('pull-copy-btn');
const saveModelBtn = document.getElementById('save-model');
const cloudUrlInput = document.getElementById('f-cloud-url');
const cloudKeyInput = document.getElementById('f-cloud-key');
const cloudModelInput = document.getElementById('f-cloud-model');
const saveCloudBtn = document.getElementById('save-cloud');
const didKeyInput = document.getElementById('f-did-key');
const saveDidBtn = document.getElementById('save-did');
const photoInput = document.getElementById('f-photo');
const choosePhotoBtn = document.getElementById('choose-photo');
const photoStatus = document.getElementById('photo-status');
const modeNoneBtn = document.getElementById('mode-none');
const modeGemmaBtn = document.getElementById('mode-gemma');
const modeGemmaWebBtn = document.getElementById('mode-gemma-web');
const modeCloudBtn = document.getElementById('mode-cloud');
const modeNote = document.getElementById('mode-note');
const gemmaSettings = document.getElementById('gemma-settings');
const gemmaWebSettings = document.getElementById('gemma-web-settings');
const cloudSettings = document.getElementById('cloud-settings');
const avatarSettings = document.getElementById('avatar-settings');

const webllmModelPicker = document.getElementById('webllm-model-picker');
const webllmLoadBtn = document.getElementById('webllm-load-btn');
const webllmTestBtn = document.getElementById('webllm-test-btn');
const webllmTestResult = document.getElementById('webllm-test-result');
const webllmProgressWrap = document.getElementById('webllm-progress-wrap');
const webllmProgressFill = document.getElementById('webllm-progress-fill');
const webllmProgressText = document.getElementById('webllm-progress-text');
const webllmReadyRow = document.getElementById('webllm-ready-row');
const hfTokenInput = document.getElementById('f-hf-token');

const tabSpeak = document.getElementById('tab-speak');
const tabWords = document.getElementById('tab-words');
const tabStreak = document.getElementById('tab-streak');

const paneSpeak = document.getElementById('pane-speak');
const paneWords = document.getElementById('pane-words');
const paneStreak = document.getElementById('pane-streak');
const scrollArea = document.querySelector('.scroll-area');
const setupCard = document.getElementById('setup-card');
const setupKicker = document.getElementById('setup-kicker');
const setupTitle = document.getElementById('setup-title');
const setupCopy = document.getElementById('setup-copy');
const goalLearnBtn = document.getElementById('goal-learn');
const goalConfidentBtn = document.getElementById('goal-confident');
const goalProfessionalBtn = document.getElementById('goal-professional');
const goalCopy = document.getElementById('goal-copy');

const avatarRow = document.getElementById('avatar-row');
const avatarToggle = document.getElementById('avatar-toggle');
const avatarBadge = document.getElementById('avatar-badge');
const avatarWrap = document.getElementById('avatar-wrap');
const avatarStatus = document.getElementById('avatar-status');
const avatarVideo = document.getElementById('avatar-video');

const topicCard = document.getElementById('topic-card');
const topicText = document.getElementById('topic-text');
const newTopicBtn = document.getElementById('new-topic-btn');
const transcriptBox = document.getElementById('transcript-box');
const transcriptText = document.getElementById('transcript-text');
const emptyHint = document.getElementById('empty-hint');

const outputEl = document.getElementById('output');
const speakTranslationCard = document.getElementById('speak-translation-card');
const speakOutputLabel = document.getElementById('speak-output-label');
const speakScoreLabel = document.getElementById('o-score-label');
const oPhrase = document.getElementById('o-phrase');
const oTranslation = document.getElementById('o-translation');
const oImproved = document.getElementById('o-improved');
const oConfPct = document.getElementById('o-conf-pct');
const oConfFill = document.getElementById('o-conf-fill');
const oVword = document.getElementById('o-vword');
const oVipa = document.getElementById('o-vipa');
const oVdef = document.getElementById('o-vdef');
const oVeg = document.getElementById('o-veg');
const oWeak = document.getElementById('o-weak');
const playBtn = document.getElementById('play-btn');
const saveVocabBtn = document.getElementById('save-word-btn');

const phraseFilters = document.getElementById('phrase-filters');
const browseText = document.getElementById('browse-text');
const revealBtn = document.getElementById('reveal-btn');
const browsePrevBtn = document.getElementById('browse-prev');
const browseNextBtn = document.getElementById('browse-next');
const browseCounter = document.getElementById('browse-ctr');
const browseOutput = document.getElementById('browse-output');
const bImproved = document.getElementById('b-improved');
const bConfPct = document.getElementById('b-conf-pct');
const bConfFill = document.getElementById('b-conf-fill');
const bVword = document.getElementById('b-vword');
const bVipa = document.getElementById('b-vipa');
const bVdef = document.getElementById('b-vdef');
const bVeg = document.getElementById('b-veg');
const bWeak = document.getElementById('b-weak');
const browsePlayBtn = document.getElementById('browse-play-btn');
const browseSaveWordBtn = document.getElementById('browse-save-word-btn');

const vocabCount = document.getElementById('vocab-count');
const exportBtn = document.getElementById('export-btn');
const vocabList = document.getElementById('vocab-list');
const vocabEmpty = document.getElementById('vocab-empty');

const streakValue = document.getElementById('s-streak');
const streakMessage = document.getElementById('s-message');
const bestStreakValue = document.getElementById('s-best');
const daysActiveValue = document.getElementById('s-days');
const sessionsValue = document.getElementById('s-sessions');
const wordsSavedValue = document.getElementById('s-words');
const calendarGrid = document.getElementById('cal-grid');

const micDock = document.getElementById('mic-dock');
const micBtn = document.getElementById('mic-btn');
const micStatus = document.getElementById('mic-status');
const micIcon = document.getElementById('mic-icon');
const micHint = document.getElementById('mic-hint');
const timerText = document.getElementById('timer');
const languageSelect = document.getElementById('lang-select');

const toastEl = document.getElementById('toast');

let aiMode = normalizeAIMode(localStorage.getItem(STORAGE_KEYS.aiMode));
let speakingGoal = normalizeSpeakingGoal(localStorage.getItem(STORAGE_KEYS.speakingGoal));
let webllmEngine = null;
let webllmLoading = false;
let webllmModelsPopulated = false;
let avatarOn = getStored(STORAGE_KEYS.avatarOn, 'false') === 'true';
let activeTab = 'speak';
let currentSpeakResponse = null;
let currentBrowseResponse = null;
let recognition = null;
let isListening = false;
let finalTranscript = '';
let timerInterval = null;
let timerSeconds = 0;
let toastTimer = null;
let browseCategory = 'All';
let browseIndex = 0;
let browseFiltered = [...PHRASES];

const speakView = {
  wrap: outputEl,
  meta: oPhrase,
  translation: oTranslation,
  original: null,
  improved: oImproved,
  confPct: oConfPct,
  confFill: oConfFill,
  vocabWord: oVword,
  vocabIpa: oVipa,
  vocabDef: oVdef,
  vocabExample: oVeg,
  weakList: oWeak,
  saveBtn: saveVocabBtn,
};

const browseView = {
  wrap: browseOutput,
  meta: null,
  translation: null,
  original: null,
  improved: bImproved,
  confPct: bConfPct,
  confFill: bConfFill,
  vocabWord: bVword,
  vocabIpa: bVipa,
  vocabDef: bVdef,
  vocabExample: bVeg,
  weakList: bWeak,
  saveBtn: browseSaveWordBtn,
};

settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', event => {
  if (event.target === settingsOverlay) closeSettings();
});
goalLearnBtn.addEventListener('click', () => setSpeakingGoal('learn'));
goalConfidentBtn.addEventListener('click', () => setSpeakingGoal('confident'));
goalProfessionalBtn.addEventListener('click', () => setSpeakingGoal('professional'));
modeNoneBtn.addEventListener('click', () => setAI(null));
modeGemmaBtn.addEventListener('click', () => setAI('gemma'));
modeGemmaWebBtn.addEventListener('click', () => setAI('gemma-web'));
modeCloudBtn.addEventListener('click', () => setAI('cloud'));

webllmModelPicker.addEventListener('click', event => {
  const option = event.target.closest('.model-option');
  if (!option) return;
  const model = option.dataset.webmodel;
  localStorage.setItem(STORAGE_KEYS.webllmModel, model);
  webllmModelPicker.querySelectorAll('.model-option').forEach(btn => {
    btn.classList.toggle('selected', btn === option);
  });
  webllmReadyRow.style.display = 'none';
  webllmEngine = null;
  syncSpeakAvailability();
});

webllmLoadBtn.addEventListener('click', loadWebLLMModel);
webllmTestBtn.addEventListener('click', testModelUrl);

modelPicker.addEventListener('click', event => {
  const option = event.target.closest('.model-option');
  if (!option) return;
  const model = option.dataset.model;
  modelInput.value = model;
  pullCmdText.textContent = `ollama pull ${model}`;
  modelPicker.querySelectorAll('.model-option').forEach(btn => {
    btn.classList.toggle('selected', btn === option);
  });
});

pullCopyBtn.addEventListener('click', async () => {
  const cmd = pullCmdText.textContent;
  if (!cmd || cmd === 'Select a model above') return;
  try {
    await navigator.clipboard.writeText(cmd);
    const original = pullCopyBtn.textContent;
    pullCopyBtn.textContent = '✓';
    setTimeout(() => { pullCopyBtn.textContent = original; }, 1200);
  } catch {
    showToast('Clipboard access was blocked');
  }
});

saveModelBtn.addEventListener('click', () => {
  const model = modelInput.value.trim();
  if (!model) {
    showToast('Select or enter an Ollama model name');
    return;
  }
  const url = ollamaUrlInput.value.trim() || DEFAULTS.ollamaUrl;
  localStorage.setItem(STORAGE_KEYS.model, model);
  localStorage.setItem(STORAGE_KEYS.ollamaUrl, url);
  syncSettingsForm();
  syncModeUI();
  showToast('Gemma settings saved');
});

saveCloudBtn.addEventListener('click', () => {
  const urlValue = cloudUrlInput.value.trim() || getCloudBaseUrl();
  const keyValue = resolveMaskedValue(cloudKeyInput.value, getCloudKey());
  const modelValue = cloudModelInput.value.trim() || getCloudModel();

  if (!urlValue || !keyValue || !modelValue) {
    showToast('Add a cloud URL, API key, and model');
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.cloudUrl, normalizeCloudBaseUrl(urlValue));
  } catch (error) {
    showToast('Enter a valid cloud base URL');
    return;
  }

  localStorage.setItem(STORAGE_KEYS.cloudKey, keyValue);
  localStorage.setItem(STORAGE_KEYS.cloudModel, modelValue);
  syncSettingsForm();
  syncModeUI();
  showToast('Cloud settings saved');
});

saveDidBtn.addEventListener('click', () => {
  const keyValue = resolveMaskedValue(didKeyInput.value, getDIDKey());
  if (!keyValue) {
    showToast('Add a D-ID API key first');
    return;
  }
  saveDIDKey(keyValue);
  syncSettingsForm();
  showToast('Avatar key saved');
});

choosePhotoBtn.addEventListener('click', () => photoInput.click());
photoInput.addEventListener('change', async () => {
  const file = photoInput.files[0];
  if (!file) return;

  const key = getDIDKey();
  if (!key) {
    showToast('Save a D-ID API key first');
    photoInput.value = '';
    return;
  }

  photoStatus.textContent = 'Uploading...';
  choosePhotoBtn.disabled = true;

  try {
    const url = await uploadPresenterPhoto(file, `Basic ${key}`);
    savePresenterUrl(url);
    photoStatus.textContent = 'Photo uploaded ✓';
    showToast('Presenter photo saved');
  } catch (error) {
    photoStatus.textContent = 'Upload failed';
    showToast(error.message.slice(0, 90));
  } finally {
    choosePhotoBtn.disabled = false;
    photoInput.value = '';
  }
});

tabSpeak.addEventListener('click', () => switchTab('speak'));
tabWords.addEventListener('click', () => switchTab('words'));
tabStreak.addEventListener('click', () => switchTab('streak'));

avatarToggle.addEventListener('click', () => {
  avatarOn = !avatarOn;
  localStorage.setItem(STORAGE_KEYS.avatarOn, String(avatarOn));
  syncAvatarUI();

  if (avatarOn && (!getDIDKey() || !getPresenterUrl())) {
    showToast('Avatar uses D-ID video. Add a key and photo in Settings, or it will fall back to audio.');
  }
});

newTopicBtn.addEventListener('click', () => {
  topicText.textContent = randomTopic();
});

micBtn.addEventListener('click', () => {
  if (isListening) {
    recognition?.stop();
    return;
  }
  startRecognition();
});

revealBtn.addEventListener('click', revealBrowsePhrase);
browsePrevBtn.addEventListener('click', () => {
  browseIndex = (browseIndex - 1 + browseFiltered.length) % browseFiltered.length;
  renderBrowseCard();
});
browseNextBtn.addEventListener('click', () => {
  browseIndex = (browseIndex + 1) % browseFiltered.length;
  renderBrowseCard();
});

playBtn.addEventListener('click', () => {
  if (!currentSpeakResponse?.corrected) return;
  playCorrection(currentSpeakResponse.corrected);
});

browsePlayBtn.addEventListener('click', () => {
  if (!currentBrowseResponse?.corrected) return;
  playAudio(currentBrowseResponse.corrected);
});

saveVocabBtn.addEventListener('click', () => {
  saveWordFromResponse(currentSpeakResponse, saveVocabBtn);
});

browseSaveWordBtn.addEventListener('click', () => {
  saveWordFromResponse(currentBrowseResponse, browseSaveWordBtn);
});

exportBtn.addEventListener('click', () => {
  const text = exportVocab();
  if (!text) {
    showToast('No saved words yet');
    return;
  }

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nativespeakup-vocab-${dateKey(new Date())}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  showToast('Vocab exported');
});

document.querySelectorAll('.copy-btn[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy);
    const text = target?.textContent?.trim() || '';
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      const original = button.textContent;
      button.textContent = '✓';
      setTimeout(() => {
        button.textContent = original;
      }, 1000);
    } catch {
      showToast('Clipboard access was blocked');
    }
  });
});

syncSettingsForm();
syncSpeakingGoalUI();
syncModeUI();
syncAvatarUI();
buildPhraseFilters();
renderBrowseCard();
renderVocab();
renderStreak();
switchTab('speak');

function openSettings() {
  syncSettingsForm();
  syncModeUI();
  settingsOverlay.style.display = 'flex';
}

function closeSettings() {
  settingsOverlay.style.display = 'none';
}

function syncSettingsForm() {
  modelInput.value = getModelName();
  ollamaUrlInput.value = getOllamaUrl();
  cloudUrlInput.value = getCloudBaseUrl();
  cloudModelInput.value = getCloudModel();
  cloudKeyInput.value = getCloudKey() ? '••••••••' : '';
  didKeyInput.value = getDIDKey() ? '••••••••' : '';
  photoStatus.textContent = getPresenterUrl() ? 'Photo uploaded ✓' : 'No photo uploaded yet';

  const savedModel = getModelName();
  modelPicker.querySelectorAll('.model-option').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.model === savedModel);
  });
  if (savedModel) pullCmdText.textContent = `ollama pull ${savedModel}`;

  webllmReadyRow.style.display = webllmEngine ? 'block' : 'none';
  hfTokenInput.value = getHFToken() ? '••••••••' : '';
}

function setAI(mode) {
  aiMode = normalizeAIMode(mode);
  if (aiMode) {
    localStorage.setItem(STORAGE_KEYS.aiMode, aiMode);
  } else {
    localStorage.removeItem(STORAGE_KEYS.aiMode);
  }

  document.body.classList.toggle('gemma', aiMode === 'gemma' || aiMode === 'gemma-web');
  syncModeUI();

  if (!isSpeakReady()) {
    outputEl.style.display = 'none';
    transcriptBox.style.display = 'none';
    emptyHint.style.display = 'none';
  }
}

function setSpeakingGoal(goal) {
  speakingGoal = normalizeSpeakingGoal(goal);
  localStorage.setItem(STORAGE_KEYS.speakingGoal, speakingGoal);
  syncSpeakingGoalUI();

  currentSpeakResponse = null;
  outputEl.style.display = 'none';

  if (!isListening) {
    transcriptBox.style.display = 'none';
    topicText.textContent = randomTopic(speakingGoal);
  }

  syncModeUI();
  showToast(`${getCurrentSpeakingGoal().title} selected`);
}

function syncAvatarUI() {
  avatarToggle.classList.toggle('on', avatarOn);
  avatarBadge.classList.toggle('on', avatarOn);
  avatarBadge.textContent = avatarOn ? 'ON' : 'OFF';

  if (!avatarOn) {
    avatarWrap.style.display = 'none';
    avatarStatus.textContent = '';
    avatarVideo.pause();
    avatarVideo.removeAttribute('src');
    avatarVideo.load();
    avatarVideo.style.display = 'none';
  }
}

function switchTab(tab) {
  activeTab = tab;

  tabSpeak.classList.toggle('active', tab === 'speak');
  tabWords.classList.toggle('active', tab === 'words');
  tabStreak.classList.toggle('active', tab === 'streak');

  paneSpeak.style.display = tab === 'speak' ? 'block' : 'none';
  paneWords.style.display = tab === 'words' ? 'flex' : 'none';
  paneStreak.style.display = tab === 'streak' ? 'flex' : 'none';

  if (tab === 'words') {
    renderBrowseCard();
    renderVocab();
  }
  if (tab === 'streak') renderStreak();
  syncSpeakAvailability();
}

function buildPhraseFilters() {
  const categories = ['All', ...new Set(PHRASES.map(phrase => phrase.category))];
  phraseFilters.replaceChildren();

  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = `chip${category === browseCategory ? ' on' : ''}`;
    button.textContent = category;
    button.addEventListener('click', () => {
      browseCategory = category;
      browseFiltered = category === 'All'
        ? [...PHRASES]
        : PHRASES.filter(phrase => phrase.category === category);
      browseIndex = 0;
      buildPhraseFilters();
      renderBrowseCard();
    });
    phraseFilters.appendChild(button);
  });
}

function renderBrowseCard() {
  if (!browseFiltered.length) return;

  const phrase = browseFiltered[browseIndex];
  browseText.textContent = `"${phrase.translation}"`;
  browseCounter.textContent = `${browseIndex + 1} / ${browseFiltered.length}`;
  revealBtn.textContent = 'Show Professional Version';
  revealBtn.disabled = false;
  browseOutput.style.display = 'none';
  currentBrowseResponse = null;
  syncSaveButton(browseView.saveBtn, null);
}

function revealBrowsePhrase() {
  const phrase = browseFiltered[browseIndex];
  if (!phrase) return;

  const response = normalizeResponse({
    translation: phrase.translation,
    corrected: phrase.corrected,
    confidence: phrase.confidence || 68,
    vocab_word: phrase.vocab_word,
    vocab_ipa: phrase.vocab_ipa || '',
    vocab_meaning: phrase.vocab_meaning,
    vocab_example: phrase.vocab_example || '',
    why_weak: phrase.why_weak,
  });

  currentBrowseResponse = response;
  fillAnalysisView(browseView, response);
  browseOutput.style.display = 'flex';
  revealBtn.textContent = 'Revealed ✓';
  revealBtn.disabled = true;
  animateCards(browseOutput);
  focusElement(browseOutput);
}

function startRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    showToast('Use Chrome or Safari for speech recognition');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = languageSelect.value;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;
    finalTranscript = '';
    transcriptText.textContent = 'Listening for your words...';
    transcriptBox.style.display = 'block';
    transcriptBox.classList.add('listening');
    outputEl.style.display = 'none';
    emptyHint.style.display = 'none';

    micBtn.classList.add('listening');
    micBtn.classList.remove('processing');
    micStatus.className = 'mic-status live';
    micStatus.textContent = 'listening...';
    micIcon.textContent = '⏹';
    micHint.textContent = 'Tap to stop';
    focusElement(transcriptBox);
    startTimer();
  };

  recognition.onresult = event => {
    let interimTranscript = '';

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const text = event.results[index][0].transcript;
      if (event.results[index].isFinal) {
        finalTranscript += `${text} `;
      } else {
        interimTranscript += text;
      }
    }

    transcriptBox.style.display = 'block';
    transcriptBox.classList.remove('listening');
    transcriptText.textContent = `${finalTranscript}${interimTranscript}`.trim();
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove('listening');
    stopTimer();

    const spokenText = finalTranscript.trim();
    if (spokenText) {
      processWithAI(spokenText);
      return;
    }

    transcriptBox.classList.remove('listening');
    transcriptBox.style.display = 'none';
    emptyHint.style.display = 'block';
    resetMicToIdle('ready');
  };

  recognition.onerror = event => {
    isListening = false;
    stopTimer();
    resetMicToIdle(event.error === 'not-allowed' ? 'mic blocked' : 'ready');
    transcriptBox.classList.remove('listening');
    if (!finalTranscript.trim()) {
      transcriptBox.style.display = 'none';
      emptyHint.style.display = 'block';
    }

    if (event.error === 'not-allowed') {
      showToast('Microphone access was denied');
    } else if (event.error === 'no-speech') {
      showToast('No speech detected');
    } else {
      showToast(`Speech error: ${event.error}`);
    }
  };

  recognition.start();
}

function startTimer() {
  timerSeconds = 0;
  timerText.textContent = '0:00';
  timerText.style.display = 'block';

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerSeconds += 1;
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerText.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerText.style.display = 'none';
}

function resetMicToIdle(statusText = 'ready') {
  micBtn.classList.remove('listening', 'processing');
  micStatus.className = 'mic-status';
  micStatus.textContent = statusText;
  micIcon.textContent = '🎙';
  micHint.textContent = 'Tap to record · tap again to stop';
}

async function processWithAI(text) {
  if (!isSpeakReady()) {
    showToast('Choose Gemma or finish Cloud setup from the menu first.');
    return;
  }

  micBtn.classList.add('processing');
  micStatus.className = 'mic-status working';
  micStatus.textContent = aiMode === 'gemma' ? 'checking local Gemma...'
    : aiMode === 'gemma-web' ? 'thinking on-device...'
    : 'calling cloud AI...';
  micIcon.textContent = '⌛';
  micHint.textContent = 'Processing your speech...';
  transcriptBox.classList.remove('listening');

  const languageName = languageSelect.selectedOptions[0]?.dataset.name || 'English';
  const prompt = buildPrompt(text, languageName, getCurrentSpeakingGoal());

  try {
    const response = aiMode === 'gemma'
      ? await processWithOllama(prompt)
      : aiMode === 'gemma-web'
      ? await processWithWebLLM(prompt)
      : await processWithCloud(prompt);

    currentSpeakResponse = normalizeResponse(response);
    updateSpeakTranslationVisibility(languageName);
    fillAnalysisView(speakView, currentSpeakResponse, languageName === 'English' ? '' : `From ${languageName}`);

    emptyHint.style.display = 'none';
    outputEl.style.display = 'flex';
    animateCards(outputEl);
    focusElement(outputEl);

    markPracticed();
    renderStreak();

    if (avatarOn && currentSpeakResponse.corrected) {
      playCorrection(currentSpeakResponse.corrected);
    }
  } catch (error) {
    showToast(error.message.slice(0, 110));
  } finally {
    resetMicToIdle('ready');
  }
}

async function processWithOllama(prompt) {
  const ollamaBase = `${getOllamaUrl()}/api/chat`;
  let response;

  try {
    response = await fetch(ollamaBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: getModelName(),
        stream: false,
        format: 'json',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch {
    throw new Error('Cannot reach Ollama. Make sure it is running and the URL in settings is correct.');
  }

  if (!response.ok) {
    throw new Error('Gemma could not answer. Make sure Ollama is running and the model is downloaded.');
  }

  const data = await response.json();
  return parseJSON(data.message?.content?.trim() || '{}');
}

async function processWithCloud(prompt) {
  const baseUrl = getCloudBaseUrl();
  const key = getCloudKey();
  const model = getCloudModel();

  if (!baseUrl || !key || !model) {
    throw new Error('Cloud AI needs a base URL, API key, and model in Settings.');
  }

  let response;

  try {
    response = await fetch(`${PROXY_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'X-Target-Host': baseUrl,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch {
    throw new Error('Cloud AI needs the local proxy running. Start it with: node scripts/did-proxy.js');
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Cloud AI ${response.status}: ${body.slice(0, 90) || 'request failed'}`);
  }

  const data = await response.json();
  const content = extractAssistantText(data.choices?.[0]?.message?.content);

  if (!content) {
    throw new Error('Cloud AI returned an empty response');
  }

  return parseJSON(content);
}

async function processWithWebLLM(prompt) {
  if (!webllmEngine) {
    throw new Error('Open the menu and tap "Load Model" to download Gemma to your device first.');
  }

  const text = await webllmEngine.generateResponse(prompt);
  if (!text) throw new Error('On-device model returned an empty response');
  return parseJSON(text);
}

function renderWebModels() {
  const savedId = getWebLLMModel();
  webllmModelPicker.querySelectorAll('.model-option').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.webmodel === savedId);
  });
  webllmModelsPopulated = true;
}

async function testModelUrl() {
  const modelId = getWebLLMModel();
  const modelConfig = GEMMA_WEB_MODELS.find(m => m.id === modelId);
  if (!modelConfig) { webllmTestResult.textContent = 'Select a model first'; return; }

  const token = resolveHFToken();
  if (!token) { webllmTestResult.textContent = '✗ Paste your HuggingFace token first'; return; }

  webllmTestBtn.disabled = true;
  webllmTestResult.textContent = 'Testing…';

  try {
    const res = await fetch(modelConfig.url, {
      method: 'HEAD',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const bytes = parseInt(res.headers.get('content-length') || '0', 10);
      const mb = bytes ? ` · ${(bytes / 1048576).toFixed(0)} MB` : '';
      webllmTestResult.textContent = `✓ Accessible${mb} — ready to load`;
      localStorage.setItem(STORAGE_KEYS.hfToken, token);
      syncSettingsForm();
    } else if (res.status === 401 || res.status === 403) {
      webllmTestResult.textContent = '✗ Token rejected or license not accepted on this model's HF page';
    } else {
      webllmTestResult.textContent = `✗ HTTP ${res.status}`;
    }
  } catch {
    webllmTestResult.textContent = '✗ Network error — check your connection';
  } finally {
    webllmTestBtn.disabled = false;
  }
}

async function fetchWithProgress(url, onProgress) {
  const token = resolveHFToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(url, { headers });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Access denied. Check your HuggingFace token and accept the Gemma license on the model\'s HF page.');
    }
    throw new Error(`Model download failed (HTTP ${response.status}).`);
  }

  const total = parseInt(response.headers.get('Content-Length') || '0', 10);
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total > 0) {
      onProgress(received / total, `${(received / 1048576).toFixed(0)} MB / ${(total / 1048576).toFixed(0)} MB`);
    } else {
      onProgress(0, `${(received / 1048576).toFixed(0)} MB downloaded…`);
    }
  }

  const merged = new Uint8Array(received);
  let pos = 0;
  for (const chunk of chunks) { merged.set(chunk, pos); pos += chunk.length; }
  return merged.buffer;
}

async function getCachedModel(url) {
  try {
    const cache = await caches.open(MODEL_CACHE);
    const cached = await cache.match(url);
    return cached ? cached.arrayBuffer() : null;
  } catch {
    return null;
  }
}

async function setCachedModel(url, buffer) {
  try {
    const cache = await caches.open(MODEL_CACHE);
    await cache.put(url, new Response(buffer, { headers: { 'Content-Type': 'application/octet-stream' } }));
  } catch {
    // cache write failure is non-fatal
  }
}

async function loadWebLLMModel() {
  if (webllmLoading) return;

  const token = resolveHFToken();
  if (!token) { showToast('Paste your HuggingFace token in settings first'); return; }
  localStorage.setItem(STORAGE_KEYS.hfToken, token);

  const modelId = getWebLLMModel();
  const modelConfig = GEMMA_WEB_MODELS.find(m => m.id === modelId);
  if (!modelConfig) { showToast('Select a model first'); return; }

  webllmLoading = true;
  webllmLoadBtn.disabled = true;
  webllmLoadBtn.textContent = 'Loading…';
  webllmProgressWrap.style.display = 'flex';
  webllmReadyRow.style.display = 'none';
  webllmProgressFill.style.width = '0%';
  webllmProgressText.textContent = 'Checking cache…';

  try {
    let modelBuffer = await getCachedModel(modelConfig.url);

    if (modelBuffer) {
      webllmProgressFill.style.width = '55%';
      webllmProgressText.textContent = 'Loaded from cache…';
    } else {
      webllmProgressText.textContent = 'Downloading model…';
      modelBuffer = await fetchWithProgress(modelConfig.url, (pct, label) => {
        webllmProgressFill.style.width = `${Math.round(pct * 50)}%`;
        webllmProgressText.textContent = label;
      });
      await setCachedModel(modelConfig.url, modelBuffer);
    }

    webllmProgressFill.style.width = '70%';
    webllmProgressText.textContent = 'Loading WASM runtime…';

    const { FilesetResolver, LlmInference } = await import(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai'
    );

    const genAi = await FilesetResolver.forGenAiTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm'
    );

    webllmProgressFill.style.width = '88%';
    webllmProgressText.textContent = 'Initializing model…';

    if (webllmEngine) { try { webllmEngine.close(); } catch { /* ignore */ } }

    webllmEngine = await LlmInference.createFromOptions(genAi, {
      baseOptions: { modelAssetBuffer: new Uint8Array(modelBuffer) },
      maxTokens: 600,
      topK: 40,
      temperature: 0.2,
      randomSeed: 42,
    });

    webllmProgressFill.style.width = '100%';
    await new Promise(r => setTimeout(r, 300));

    webllmProgressWrap.style.display = 'none';
    webllmReadyRow.style.display = 'block';
    webllmLoadBtn.textContent = 'Reload Model';
    syncSpeakAvailability();
    showToast(`${modelConfig.name} loaded — ready to coach`);
  } catch (error) {
    webllmProgressWrap.style.display = 'none';
    webllmLoadBtn.textContent = 'Load Model';
    showToast(error.message.slice(0, 100));
  } finally {
    webllmLoading = false;
    webllmLoadBtn.disabled = false;
  }
}

function parseJSON(raw) {
  let text = String(raw || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) text = match[0];
  }

  text = text
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/\}\s*\{/g, '},{')
    .trim();

  return JSON.parse(text);
}

function fillAnalysisView(view, response, metaText) {
  if (view.meta) view.meta.textContent = metaText || '';
  if (view.translation) view.translation.textContent = response.translation;
  if (view.original) view.original.textContent = response.translation;
  if (view.improved) view.improved.textContent = response.corrected;
  if (view.vocabWord) view.vocabWord.textContent = response.vocab_word || '—';
  if (view.vocabIpa) view.vocabIpa.textContent = response.vocab_ipa || '';
  if (view.vocabDef) view.vocabDef.textContent = response.vocab_meaning || '—';
  if (view.vocabExample) view.vocabExample.textContent = response.vocab_example || '—';

  if (view.confPct) view.confPct.textContent = `${response.confidence}%`;
  if (view.confFill) {
    view.confFill.style.width = '0%';
    requestAnimationFrame(() => {
      view.confFill.style.width = `${response.confidence}%`;
    });
  }

  if (view.weakList) renderWeakList(view.weakList, response.why_weak);
  if (view.saveBtn) syncSaveButton(view.saveBtn, response);
}

function renderWeakList(container, reasons) {
  container.replaceChildren();

  reasons.forEach((reason, index) => {
    const item = document.createElement('div');
    item.className = 'weak-item';

    const number = document.createElement('div');
    number.className = 'weak-num';
    number.textContent = String(index + 1);

    const copy = document.createElement('div');
    copy.className = 'weak-copy';

    const heading = document.createElement('b');
    heading.textContent = reason.heading;

    copy.appendChild(heading);
    copy.append(` - ${reason.detail}`);

    item.append(number, copy);
    container.appendChild(item);
  });
}

function normalizeResponse(response) {
  const reasons = Array.isArray(response?.why_weak)
    ? response.why_weak
    : [{ heading: 'Style', detail: String(response?.why_weak || 'The phrasing sounded less confident than it could be.') }];

  return {
    translation: String(response?.translation || '—').trim(),
    corrected: String(response?.corrected || '—').trim(),
    confidence: clampConfidence(response?.confidence),
    vocab_word: String(response?.vocab_word || '').trim(),
    vocab_ipa: String(response?.vocab_ipa || '').trim(),
    vocab_meaning: String(response?.vocab_meaning || '').trim(),
    vocab_example: String(response?.vocab_example || '').trim(),
    why_weak: reasons.map(reason => ({
      heading: String(reason?.heading || 'Reason').trim(),
      detail: String(reason?.detail || '').trim() || 'The phrasing could be more direct and confident.',
    })),
  };
}

function clampConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 70;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function saveWordFromResponse(response, button) {
  if (!response?.vocab_word) {
    showToast('No vocab word to save yet');
    return;
  }

  if (isWordSaved(response.vocab_word)) {
    syncSaveButton(button, response);
    showToast('That word is already saved');
    return;
  }

  saveVocab({
    word: response.vocab_word,
    meaning: response.vocab_meaning,
    context: response.corrected,
    savedAt: new Date().toISOString(),
  });

  syncSaveButton(button, response);
  renderVocab();
  renderStreak();
  showToast(`Saved "${response.vocab_word}"`);
}

function syncSaveButton(button, response) {
  const hasWord = Boolean(response?.vocab_word);
  const isSaved = hasWord && isWordSaved(response.vocab_word);
  button.disabled = !hasWord || isSaved;
  button.textContent = isSaved ? 'Saved ✓' : '+ Save Word';
}

function renderVocab() {
  const words = getVocab();
  vocabCount.textContent = `${words.length} word${words.length === 1 ? '' : 's'} saved`;
  vocabList.replaceChildren();

  if (!words.length) {
    vocabEmpty.style.display = 'block';
    return;
  }

  vocabEmpty.style.display = 'none';

  words.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'vocab-item';

    const copy = document.createElement('div');

    const word = document.createElement('div');
    word.className = 'vi-word';
    word.textContent = entry.word;

    const meaning = document.createElement('div');
    meaning.className = 'vi-meaning';
    meaning.textContent = entry.meaning || 'No meaning saved.';

    const context = document.createElement('div');
    context.className = 'vi-context';
    context.textContent = entry.context || '';

    copy.append(word, meaning, context);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'del-btn';
    deleteBtn.type = 'button';
    deleteBtn.textContent = '✕';
    deleteBtn.setAttribute('aria-label', `Delete ${entry.word}`);
    deleteBtn.addEventListener('click', () => {
      deleteVocab(entry.word);
      renderVocab();
      renderStreak();
      syncSaveButton(saveVocabBtn, currentSpeakResponse);
      syncSaveButton(browseSaveWordBtn, currentBrowseResponse);
      showToast(`Removed "${entry.word}"`);
    });

    item.append(copy, deleteBtn);
    vocabList.appendChild(item);
  });
}

function renderStreak() {
  const log = getLog();
  const currentStreak = getStreak();

  streakValue.textContent = String(currentStreak);
  streakMessage.textContent = buildStreakMessage(currentStreak, log);
  bestStreakValue.textContent = String(getLongestStreak(log));
  daysActiveValue.textContent = String(getTotalDays());
  sessionsValue.textContent = String(getTotalSessions());
  wordsSavedValue.textContent = String(getVocab().length);

  renderCalendar(log);
}

function updateSpeakTranslationVisibility(languageName) {
  const showTranslation = languageName !== 'English';
  speakTranslationCard.style.display = showTranslation ? 'block' : 'none';
  oPhrase.textContent = showTranslation ? `From ${languageName}` : '';
}

function syncSpeakingGoalUI() {
  const goal = getCurrentSpeakingGoal();

  goalLearnBtn.classList.toggle('active', goal.key === 'learn');
  goalConfidentBtn.classList.toggle('active', goal.key === 'confident');
  goalProfessionalBtn.classList.toggle('active', goal.key === 'professional');
  goalLearnBtn.setAttribute('aria-pressed', String(goal.key === 'learn'));
  goalConfidentBtn.setAttribute('aria-pressed', String(goal.key === 'confident'));
  goalProfessionalBtn.setAttribute('aria-pressed', String(goal.key === 'professional'));

  goalCopy.textContent = goal.description;
  speakOutputLabel.textContent = goal.outputLabel;
  speakScoreLabel.textContent = goal.scoreLabel;
}

function syncModeUI() {
  document.body.classList.toggle('gemma', aiMode === 'gemma' || aiMode === 'gemma-web');
  modeNoneBtn.classList.toggle('active', !aiMode);
  modeGemmaBtn.classList.toggle('active', aiMode === 'gemma');
  modeGemmaWebBtn.classList.toggle('active', aiMode === 'gemma-web');
  modeCloudBtn.classList.toggle('active', aiMode === 'cloud');

  gemmaSettings.hidden = aiMode !== 'gemma';
  gemmaWebSettings.hidden = aiMode !== 'gemma-web';
  if (aiMode === 'gemma-web') renderWebModels();
  cloudSettings.hidden = aiMode !== 'cloud';
  avatarSettings.hidden = !aiMode;

  if (!aiMode) {
    modeNote.textContent = 'Choose a mode to unlock the matching speaking setup.';
  } else if (aiMode === 'gemma') {
    modeNote.textContent = 'Gemma Local is selected. Ollama must be running on your Mac.';
  } else if (aiMode === 'gemma-web') {
    modeNote.textContent = 'Gemma On-Device selected. Load the model once to activate it.';
  } else {
    modeNote.textContent = 'Cloud AI is selected. Only cloud settings are shown below.';
  }

  syncSpeakAvailability();
}

function syncSpeakAvailability() {
  const goal = getCurrentSpeakingGoal();
  const ready = isSpeakReady();

  if (!aiMode) {
    setupKicker.textContent = 'Default View';
    setupTitle.textContent = `Choose your AI to start ${goal.title}.`;
    setupCopy.innerHTML = `Open the top-right menu and pick <b>Gemma On-Device</b> to run Gemma in your browser, <b>Gemma Local</b> for Ollama on Mac, or <b>Cloud AI</b> for an API key setup.`;
  } else if (aiMode === 'gemma-web' && !ready) {
    setupKicker.textContent = 'Gemma On-Device';
    setupTitle.textContent = 'Load the model to activate.';
    setupCopy.innerHTML = `Open the menu, pick a model under <b>Gemma On-Device</b>, and tap <b>Load Model</b>. It downloads once to your browser — then works offline with no API key.`;
  } else if (aiMode === 'cloud' && !ready) {
    setupKicker.textContent = 'Cloud AI';
    setupTitle.textContent = 'Finish your Cloud AI setup.';
    setupCopy.innerHTML = `Add a <b>base URL</b>, <b>API key</b>, and <b>model</b> in the menu to turn on <b>${goal.title}</b> with your cloud provider.`;
  } else {
    setupKicker.textContent = goal.title;
    setupTitle.textContent = 'Speaking mode is ready.';
    setupCopy.innerHTML = goal.readyCopy;
  }

  setupCard.style.display = ready ? 'none' : 'block';
  avatarRow.style.display = ready ? 'flex' : 'none';
  topicCard.style.display = ready ? 'flex' : 'none';
  micDock.style.display = activeTab === 'speak' && ready ? 'flex' : 'none';

  if (!ready) {
    avatarWrap.style.display = 'none';
    transcriptBox.style.display = 'none';
    transcriptBox.classList.remove('listening');
    outputEl.style.display = 'none';
    emptyHint.style.display = 'none';
  } else if (!isListening && outputEl.style.display === 'none' && transcriptBox.style.display === 'none') {
    emptyHint.style.display = 'block';
  }
}

function isSpeakReady() {
  if (aiMode === 'gemma') return Boolean(getModelName());
  if (aiMode === 'gemma-web') return Boolean(webllmEngine);
  if (aiMode === 'cloud') return hasCloudConfig();
  return false;
}

function hasCloudConfig() {
  return Boolean(getCloudBaseUrl() && getCloudKey() && getCloudModel());
}

function getCurrentSpeakingGoal() {
  return SPEAKING_GOALS[speakingGoal] || SPEAKING_GOALS.learn;
}

function renderCalendar(log) {
  calendarGrid.replaceChildren();

  for (let offset = 29; offset >= 0; offset -= 1) {
    const day = new Date();
    day.setDate(day.getDate() - offset);

    const cell = document.createElement('div');
    cell.className = 'cal-day';
    cell.textContent = String(day.getDate());

    const key = dateKey(day);
    if (log[key]?.count > 0) cell.classList.add('done');
    if (offset === 0) cell.classList.add('today');

    calendarGrid.appendChild(cell);
  }
}

function buildStreakMessage(currentStreak, log) {
  const practicedToday = Boolean(log[dateKey(new Date())]?.count);

  if (currentStreak === 0 && !practicedToday) {
    return 'Start today with one recording to begin your streak.';
  }

  if (currentStreak === 0 && practicedToday) {
    return 'Nice start. Come back tomorrow to turn today into a streak.';
  }

  if (practicedToday) {
    return `You practiced today. That pushes your streak to ${currentStreak} day${currentStreak === 1 ? '' : 's'}.`;
  }

  return `You are on a ${currentStreak}-day streak. One more session today keeps it alive.`;
}

function getLongestStreak(log) {
  const keys = Object.keys(log)
    .filter(key => log[key]?.count > 0)
    .sort();

  let longest = 0;
  let current = 0;
  let previousKey = null;

  keys.forEach(key => {
    if (!previousKey) {
      current = 1;
    } else {
      current = daysBetween(previousKey, key) === 1 ? current + 1 : 1;
    }

    longest = Math.max(longest, current);
    previousKey = key;
  });

  return longest;
}

function daysBetween(previousKey, nextKey) {
  const previous = new Date(`${previousKey}T12:00:00`);
  const next = new Date(`${nextKey}T12:00:00`);
  return Math.round((next - previous) / 86400000);
}

function playCorrection(text) {
  if (!text) return;

  if (!avatarOn) {
    playAudio(text);
    return;
  }

  avatarWrap.style.display = 'flex';
  avatarVideo.pause();
  avatarVideo.removeAttribute('src');
  avatarVideo.style.display = 'none';
  avatarStatus.textContent = 'Preparing avatar...';

  speakWithAvatar(text, {
    onStatus: message => {
      avatarWrap.style.display = 'flex';
      avatarStatus.textContent = message;
    },
    onVideo: url => {
      avatarWrap.style.display = 'flex';
      avatarVideo.src = url;
      avatarVideo.style.display = 'block';
      avatarStatus.textContent = '';
      avatarVideo.onended = () => {
        avatarVideo.style.display = 'none';
        avatarWrap.style.display = 'none';
      };
      avatarVideo.play().catch(() => {});
    },
  });
}

function playAudio(text) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

function animateCards(container) {
  container.querySelectorAll('.card').forEach((card, index) => {
    if (card.style.display === 'none') return;
    card.style.animation = 'none';
    void card.offsetHeight;
    card.style.animation = `fadeUp 0.3s ease ${index * 0.05}s both`;
  });
}

function focusElement(element) {
  if (!element) return;
  requestAnimationFrame(() => {
    if (scrollArea) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function showToast(message) {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2600);
}

function randomTopic(goalKey = speakingGoal) {
  const topics = (SPEAKING_GOALS[goalKey] || getCurrentSpeakingGoal()).topics;
  return topics[Math.floor(Math.random() * topics.length)];
}

function extractAssistantText(content) {
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';

  return content
    .map(part => {
      if (typeof part === 'string') return part;
      if (typeof part?.text === 'string') return part.text;
      return '';
    })
    .join('')
    .trim();
}

function isWordSaved(word) {
  if (!word) return false;
  return getVocab().some(entry => entry.word.toLowerCase() === word.toLowerCase());
}

function getModelName() {
  return getStored(STORAGE_KEYS.model, DEFAULTS.model);
}

function getOllamaUrl() {
  return getStored(STORAGE_KEYS.ollamaUrl, DEFAULTS.ollamaUrl).replace(/\/$/, '');
}

function getWebLLMModel() {
  return getStored(STORAGE_KEYS.webllmModel, DEFAULTS.webllmModel);
}

function getHFToken() {
  return localStorage.getItem(STORAGE_KEYS.hfToken) || '';
}

function resolveHFToken() {
  const raw = hfTokenInput.value.trim();
  if (!raw) return getHFToken();
  return /^•+$/.test(raw) ? getHFToken() : raw;
}

function getCloudBaseUrl() {
  return getStored(STORAGE_KEYS.cloudUrl, DEFAULTS.cloudUrl);
}

function getCloudKey() {
  return getStored(STORAGE_KEYS.cloudKey, '');
}

function getCloudModel() {
  return getStored(STORAGE_KEYS.cloudModel, DEFAULTS.cloudModel);
}

function getStored(key, fallback) {
  return localStorage.getItem(key) || fallback;
}

function resolveMaskedValue(value, existing) {
  const trimmed = value.trim();
  if (!trimmed) return existing || '';
  return /^•+$/.test(trimmed) ? existing || '' : trimmed;
}

function normalizeCloudBaseUrl(value) {
  let raw = value.trim();
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  const url = new URL(raw);
  url.search = '';
  url.hash = '';

  if (!url.pathname || url.pathname === '/') {
    url.pathname = '/v1';
  }

  return url.toString().replace(/\/$/, '');
}

function normalizeAIMode(value) {
  return value === 'gemma' || value === 'gemma-web' || value === 'cloud' ? value : null;
}

function normalizeSpeakingGoal(value) {
  return Object.prototype.hasOwnProperty.call(SPEAKING_GOALS, value) ? value : 'learn';
}
