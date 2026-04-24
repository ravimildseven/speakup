// Proxied locally to avoid CORS — run: node scripts/did-proxy.js
const DID_BASE = 'http://localhost:3099';

export function getDIDKey() {
  return localStorage.getItem('did_api_key') || '';
}

export function saveDIDKey(key) {
  localStorage.setItem('did_api_key', key.trim());
}

export function getPresenterUrl() {
  return localStorage.getItem('did_presenter_url') || '';
}

export function savePresenterUrl(url) {
  localStorage.setItem('did_presenter_url', url.trim());
}

export async function uploadPresenterPhoto(file, auth) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${DID_BASE}/images`, {
    method: 'POST',
    headers: { Authorization: auth },
    body: formData,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Upload failed ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.url;
}

export async function speakWithAvatar(text, { onStatus, onVideo } = {}) {
  const key = getDIDKey();
  const presenterUrl = getPresenterUrl();

  if (!key) {
    onStatus?.('Add a D-ID API key in Settings to enable video. Playing audio only for now.');
    fallbackTTS(text);
    return;
  }
  if (!presenterUrl) {
    onStatus?.('Upload a presenter photo in Settings to enable video. Playing audio only for now.');
    fallbackTTS(text);
    return;
  }

  const auth = 'Basic ' + key;
  onStatus?.('Generating avatar...');

  try {
    const talkId = await createTalk(text, auth, presenterUrl);
    const videoUrl = await waitForTalk(talkId, auth, onStatus);
    console.log('[D-ID] video ready:', videoUrl);
    onVideo?.(videoUrl);
  } catch (err) {
    console.error('[D-ID]', err.message);
    onStatus?.(`Avatar failed: ${err.message}`);
    fallbackTTS(text);
  }
}

async function createTalk(text, auth, presenterUrl) {
  const res = await fetch(`${DID_BASE}/talks`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      source_url: presenterUrl,
      script: {
        type: 'text',
        input: text,
        provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' },
      },
      config: { fluent: true, pad_audio: 0 },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`D-ID ${res.status}: ${body}`);
  }

  const { id } = await res.json();
  return id;
}

async function waitForTalk(id, auth, onStatus, attempt = 0) {
  if (attempt > 24) throw new Error('Timed out waiting for D-ID video');
  await delay(2500);

  const res = await fetch(`${DID_BASE}/talks/${id}`, {
    headers: { Authorization: auth, Accept: 'application/json' },
  });
  const data = await res.json();

  if (data.status === 'done') {
    console.log('[D-ID] full response:', data);
    const url = data.result_url;
    if (!url || !url.includes('.mp4')) {
      throw new Error(`No video in response — got: ${url || 'empty'}`);
    }
    return url;
  }
  if (data.status === 'error') throw new Error(data.error?.description || data.error?.kind || 'D-ID processing error');

  onStatus?.(`Generating avatar... ${Math.round((attempt + 1) * 2.5)}s`);
  return waitForTalk(id, auth, onStatus, attempt + 1);
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fallbackTTS(text) {
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'en-US';
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}
