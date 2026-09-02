import React from 'react';
import { Composition } from 'remotion';
import { ShoppingShort, shoppingShortSchema } from './ShoppingShort';

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ShoppingShort"
      component={ShoppingShort}
      durationInFrames={900} // 기본값, calculateMetadata가 실제 길이로 덮어씀
      fps={FPS}
      width={1080}
      height={1920}
      schema={shoppingShortSchema}
      defaultProps={{
        audioSrc: '',
        productImage: '',
        productName: '제품명',
        price: '0원',
        captions: [],
      }}
      calculateMetadata={async ({ props }) => {
        const lastEnd =
          props.captions.length > 0
            ? Math.max(...props.captions.map((c) => c.end))
            : 5;
        return {
          durationInFrames: Math.ceil(lastEnd * FPS) + FPS, // 마지막 자막 + 1초 여유
        };
      }}
    />
  );
};
