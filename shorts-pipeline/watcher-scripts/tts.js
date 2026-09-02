// ElevenLabs TTS(with timestamps) 호출 + 문자단위 타임스탬프를 단어단위 captions로 변환

const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel (기본 예시 보이스)
const WORDS_PER_CAPTION = 1; // 자막을 몇 단어씩 묶어서 보여줄지 (1=단어별, 2~3=구 단위)

/**
 * ElevenLabs "with-timestamps" 엔드포인트 호출
 * @returns {Promise<{ audioBuffer: Buffer, alignment: object }>}
 */
async function generateTTS({ text, voiceId, apiKey }) {
  const vId = voiceId || DEFAULT_VOICE_ID;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${vId}/with-timestamps`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2', // 한국어 지원 모델
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ElevenLabs API 오류 (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const audioBuffer = Buffer.from(data.audio_base64, 'base64');

  return { audioBuffer, alignment: data.alignment };
}

/**
 * 문자 단위 alignment -> 단어 단위 captions 배열 변환
 * @param {object} alignment - { characters, character_start_times_seconds, character_end_times_seconds }
 * @param {string} productName
 * @param {string} price
 * @returns {Array<{text: string, start: number, end: number, isProduct?: boolean}>}
 */
function alignmentToCaptions(alignment, productName, price) {
  const { characters, character_start_times_seconds: starts, character_end_times_seconds: ends } = alignment;

  // 1. 문자 배열 -> 단어 배열로 묶기 (공백 기준)
  const words = [];
  let current = { text: '', start: null, end: null };

  for (let i = 0; i < characters.length; i++) {
    const ch = characters[i];
    if (ch === ' ' || ch === '\n') {
      if (current.text.length > 0) {
        words.push(current);
        current = { text: '', start: null, end: null };
      }
      continue;
    }
    if (current.start === null) current.start = starts[i];
    current.text += ch;
    current.end = ends[i];
  }
  if (current.text.length > 0) words.push(current);

  // 2. WORDS_PER_CAPTION개씩 묶어서 caption 청크 생성
  const captions = [];
  for (let i = 0; i < words.length; i += WORDS_PER_CAPTION) {
    const chunk = words.slice(i, i + WORDS_PER_CAPTION);
    captions.push({
      text: chunk.map((w) => w.text).join(' '),
      start: chunk[0].start,
      end: chunk[chunk.length - 1].end,
    });
  }

  // 3. 제품명/가격과 겹치는 단어 isProduct 마킹 (콤마·공백 제거 후 부분일치)
  const normalize = (s) => (s || '').replace(/[,\s]/g, '');
  const productTokens = [normalize(productName), normalize(price)].filter(Boolean);

  for (const cap of captions) {
    const normText = normalize(cap.text);
    if (productTokens.some((tok) => tok.length > 0 && (tok.includes(normText) || normText.includes(tok)))) {
      cap.isProduct = true;
    }
  }

  return captions;
}

module.exports = { generateTTS, alignmentToCaptions };
