import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

export const captionSchema = z.object({
  text: z.string(),
  start: z.number(), // seconds
  end: z.number(), // seconds
  isProduct: z.boolean().optional(), // true => 제품명/가격 등 강조할 단어
});

export const shoppingShortSchema = z.object({
  audioSrc: z.string(),
  productImage: z.string(),
  productName: z.string(),
  price: z.string(),
  captions: z.array(captionSchema),
});

type Props = z.infer<typeof shoppingShortSchema>;

const resolveSrc = (src: string) => (src.startsWith('http') ? src : staticFile(src));

export const ShoppingShort: React.FC<Props> = ({
  audioSrc,
  productImage,
  productName,
  price,
  captions,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;

  // 배경 이미지 슬로우 줌 (Ken Burns)
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const activeCaption = captions.find((c) => t >= c.start && t < c.end);

  // 등장 애니메이션 (강조 자막은 살짝 더 튀게)
  const captionProgress = activeCaption
    ? interpolate(
        frame,
        [Math.round(activeCaption.start * fps), Math.round(activeCaption.start * fps) + 6],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'Pretendard, Apple SD Gothic Neo, sans-serif' }}>
      {/* 배경 제품 이미지 */}
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={resolveSrc(productImage)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>

      {/* 어둡게 살짝 오버레이 (자막 가독성) */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* 제품명 / 가격 배지 - 항상 상단 고정 노출 */}
      <div
        style={{
          position: 'absolute',
          top: 90,
          left: 40,
          right: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <div
          style={{
            background: 'rgba(0,0,0,0.72)',
            color: '#fff',
            fontSize: 38,
            fontWeight: 800,
            padding: '10px 22px',
            borderRadius: 14,
            maxWidth: '90%',
          }}
        >
          {productName}
        </div>
        <div
          style={{
            background: '#FF3B30',
            color: '#fff',
            fontSize: 46,
            fontWeight: 900,
            padding: '10px 26px',
            borderRadius: 14,
          }}
        >
          {price}
        </div>
      </div>

      {/* 자막 - isProduct 인 단어/구는 노란색 확대 강조 */}
      {activeCaption && (
        <div
          style={{
            position: 'absolute',
            bottom: 240,
            left: 40,
            right: 40,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontSize: activeCaption.isProduct ? 78 : 58,
              fontWeight: 900,
              color: activeCaption.isProduct ? '#FFD60A' : '#ffffff',
              WebkitTextStroke: '3px rgba(0,0,0,0.9)',
              lineHeight: 1.3,
              transform: `scale(${0.85 + 0.15 * captionProgress})`,
              opacity: Math.min(1, captionProgress + 0.4),
            }}
          >
            {activeCaption.text}
          </span>
        </div>
      )}

      <Audio src={resolveSrc(audioSrc)} />
    </AbsoluteFill>
  );
};
