// One-shot TTS + captions + props.json generator (reuses tts.js logic)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { generateTTS, alignmentToCaptions } = require('./tts.js');

const ROOT = path.join(__dirname, '..');

const job = {
  id: 'chaekal-001',
  productName: '고성능 채칼',
  price: '19900원',
  script:
    '이거 정말 편해요. 채칼 쓸 때마다 손 다칠까봐 무서웠던 분들 있죠? ' +
    '고성능 채칼은 손에 칼날이 닿지 않아서 편하게 손질할 수 있어요. ' +
    '감자, 양파, 마늘, 토마토까지 전부 돼요. ' +
    '잔여물도 거의 없고 깔끔하게 싹 썰려요. ' +
    '손 다칠 걱정이 없으니까 요리 준비가 훨씬 편해졌어요. ' +
    '고성능 채칼 지금 19900원. 댓글에 안전 남겨주시면 바로 보내드릴게요.',
  productImage: 'assets/products/chaekal-001.jpg',
};

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY missing in .env');

  console.log('[1/3] Calling ElevenLabs TTS...');
  const { audioBuffer, alignment } = await generateTTS({
    text: job.script,
    voiceId: job.voiceId,
    apiKey,
  });

  const audioPath = path.join(ROOT, 'audio', `${job.id}.mp3`);
  fs.mkdirSync(path.dirname(audioPath), { recursive: true });
  fs.writeFileSync(audioPath, audioBuffer);
  console.log('  saved', audioPath, `(${audioBuffer.length} bytes)`);

  console.log('[2/3] Building captions from alignment...');
  const captions = alignmentToCaptions(alignment, job.productName, job.price);
  console.log(`  ${captions.length} caption chunks, duration ~${captions[captions.length - 1].end.toFixed(2)}s`);

  console.log('[3/3] Writing props.json...');
  const props = {
    audioSrc: `../audio/${job.id}.mp3`,
    productImage: `../${job.productImage}`,
    productName: job.productName,
    price: job.price,
    captions,
  };
  const propsPath = path.join(ROOT, 'audio', `${job.id}.props.json`);
  fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));
  console.log('  saved', propsPath);
}

main().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
