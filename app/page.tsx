"use client";

import { useState, useMemo } from "react";
import ImageUploader from "@/components/ImageUploader";
import EffectOptions from "@/components/EffectOptions";
import EffectPreview from "@/components/EffectPreview";
import AnimationOptions from "@/components/AnimationOptions";
import { ShatterRenderer } from "@/lib/effects/ShatterRenderer";
import type {
  EffectOptions as EffectOptionsType,
  OutputSize,
} from "@/lib/types";
import { TwitterLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [outputSize, setOutputSize] = useState<OutputSize>(128);
  const [options, setOptions] = useState<EffectOptionsType>({
    type: "shatter",
    shatter: {
      pieceCount: 80,
      gravity: 0.8,
      spreadDirection: 50,
      backgroundColor: "#000000",
      transparent: true,
    },
  });

  // 렌더러 인스턴스 (재사용)
  const renderer = useMemo(() => new ShatterRenderer(), []);

  const handleImageLoad = (img: HTMLImageElement) => {
    setImage(img);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            이미지 생성기
          </h1>
          <p className="text-muted-foreground">
            광고덕지덕지된 사이트 화나서 내가 직접 만들었음
          </p>
        </div>

        {!image ? (
          <div className="max-w-2xl mx-auto">
            <ImageUploader onImageLoad={handleImageLoad} />
          </div>
        ) : (
          <div className="grid lg:grid-cols-[350px_1fr] gap-6">
            {/* 옵션 패널 - 데스크톱에서 왼쪽 */}
            <div className="order-2 lg:order-1 space-y-4">
              <AnimationOptions
                outputSize={outputSize}
                onOutputSizeChange={setOutputSize}
              />
              <EffectOptions options={options} onChange={setOptions} />
            </div>

            {/* 미리보기 - 데스크톱에서 오른쪽, 모바일에서 위 */}
            <div className="order-1 lg:order-2">
              <EffectPreview
                image={image}
                options={options.shatter}
                renderer={renderer}
                totalFrames={60}
                fps={30}
                outputSize={outputSize}
                onResetImage={() => setImage(null)}
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-center items-center text-sm space-x-2 text-muted-foreground h-10">
          <TwitterLogoIcon />
          &nbsp;or 𝕏 :<Link href="https://twitter.com/harunene">@harunene</Link>
        </div>
      </div>
    </main>
  );
}
