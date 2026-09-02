# 고성능 채칼 쇼핑쇼츠 — 로컬 실행 가이드

이 폴더는 이미 다 준비되어 있어요 (대본, 제품 이미지, TTS 스크립트, Remotion 프로젝트).
**딱 3개 명령어만 순서대로 실행하면 mp4가 나옵니다.**

## 준비물
- 컴퓨터에 Node.js 설치되어 있어야 함 (없으면 https://nodejs.org 에서 LTS 버전 설치)
- 이 zip을 원하는 폴더에 풀기

## 실행 순서

```bash
# 1) TTS 나레이션 + 자막 타이밍 생성 (ElevenLabs 호출)
cd shorts-pipeline/watcher-scripts
npm install
node generate-one.js

# 2) Remotion 프로젝트 준비 (최초 1회만, Chrome 다운로드 포함이라 몇 분 걸릴 수 있음)
cd ../remotion-project
npm install

# 3) 렌더링 (mp4 생성)
npx remotion render src/index.ts ShoppingShort ../output/chaekal-001.mp4 --props=../audio/chaekal-001.props.json
```

끝나면 `shorts-pipeline/output/chaekal-001.mp4` 파일이 완성본입니다.

## 이미 들어있는 것
- `.env` — ElevenLabs API 키 (본인이 주신 키 그대로 들어있음)
- `watcher-scripts/generate-one.js` — TikTok 벤치마킹 구조로 작성한 대본
- `assets/products/chaekal-001.jpg` — 임시 제품 이미지 (플레이스홀더, 실제 제품 사진 있으면 같은 경로에 덮어쓰면 됨)

## 대본 (참고용)
> 이거 정말 편해요. 채칼 쓸 때마다 손 다칠까봐 무서웠던 분들 있죠?
> 고성능 채칼은 손에 칼날이 닿지 않아서 편하게 손질할 수 있어요.
> 감자, 양파, 마늘, 토마토까지 전부 돼요.
> 잔여물도 거의 없고 깔끔하게 싹 썰려요.
> 손 다칠 걱정이 없으니까 요리 준비가 훨씬 편해졌어요.
> 고성능 채칼 지금 19900원. 댓글에 안전 남겨주시면 바로 보내드릴게요.

대본이나 제품 이미지를 바꾸고 싶으면 `watcher-scripts/generate-one.js` 안의 `job` 객체를 수정한 뒤 다시 1번부터 실행하면 됩니다.
