"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Download, Loader2, Play, Pause } from "lucide-react";
import { generateAPNG, downloadBlob } from "@/lib/apng-generator";
import type { EffectRenderer, RenderContext } from "@/lib/effects/types";
import type { OutputSize } from "@/lib/types";

interface EffectPreviewProps<
  TOptions = any,
  TContext extends RenderContext = RenderContext
> {
  image: HTMLImageElement | null;
  options: TOptions;
  renderer: EffectRenderer<TOptions, TContext>;
  totalFrames?: number;
  fps?: number;
  outputSize: OutputSize;
  onResetImage?: () => void;
}

export default function EffectPreview<
  TOptions,
  TContext extends RenderContext
>({
  image,
  options,
  renderer,
  totalFrames = 120,
  fps = 30,
  outputSize,
  onResetImage,
}: EffectPreviewProps<TOptions, TContext>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderContextRef = useRef<TContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [contextKey, setContextKey] = useState(0); // 컨텍스트 재생성 추적

  // 특정 프레임 렌더링
  const renderFrame = useCallback(
    (frameIndex: number) => {
      if (
        !canvasRef.current ||
        !sourceCanvasRef.current ||
        !renderContextRef.current
      )
        return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      renderer.renderFrame(
        ctx,
        sourceCanvasRef.current,
        frameIndex,
        totalFrames,
        renderContextRef.current,
        options
      );
    },
    [renderer, options, totalFrames]
  );

  // 캔버스 및 렌더 컨텍스트 초기화
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // 캔버스 크기를 출력 크기로 설정 (정사각형)
    canvas.width = outputSize;
    canvas.height = outputSize;

    // 원본 이미지 캔버스 생성
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = outputSize;
    sourceCanvas.height = outputSize;
    const sourceCtx = sourceCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    if (!sourceCtx) return;

    // 이미지를 정사각형 캔버스에 맞춰 그리기
    const scale = Math.min(outputSize / image.width, outputSize / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const offsetX = (outputSize - scaledWidth) / 2;
    const offsetY = (outputSize - scaledHeight) / 2;
    sourceCtx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
    sourceCanvasRef.current = sourceCanvas;

    // 렌더 컨텍스트 초기화
    renderContextRef.current = renderer.createContext(
      outputSize,
      outputSize,
      options
    );
    setCurrentFrame(0);

    // 컨텍스트가 재생성되었음을 표시 (애니메이션 재생 useEffect 트리거)
    setContextKey((prev) => prev + 1);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [image, options, renderer, outputSize]);

  // 애니메이션 재생
  useEffect(() => {
    if (!isPlaying || isDraggingSlider || !renderContextRef.current) {
      return;
    }

    let lastTime = performance.now();
    const frameInterval = 1000 / fps;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= frameInterval) {
        setCurrentFrame((prev) => {
          const nextFrame = prev + 1;
          if (nextFrame >= totalFrames) {
            // 애니메이션 재시작
            if (renderContextRef.current) {
              renderContextRef.current.reset();
            }
            return 0;
          }
          return nextFrame;
        });
        lastTime = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, fps, totalFrames, isDraggingSlider, contextKey]); // contextKey 추가

  // 현재 프레임 렌더링
  useEffect(() => {
    renderFrame(currentFrame);
  }, [currentFrame, renderFrame]);

  const handleGenerate = async () => {
    if (!image) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const blob = await generateAPNG(
        image,
        renderer,
        options,
        {
          frameCount: totalFrames,
          fps,
          outputSize,
        },
        (p) => setGenerationProgress(Math.round(p))
      );

      // 자동 다운로드
      const timestamp = new Date().getTime();
      downloadBlob(
        blob,
        `animated-effect-${outputSize}x${outputSize}-${timestamp}.png`
      );

      // 다운로드 성공 메시지 (previewUrl 설정하지 않음)
      alert("APNG가 다운로드되었습니다!");
    } catch (error) {
      console.error("Failed to generate APNG:", error);
      alert("APNG 생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSliderChange = (value: number[]) => {
    const targetFrame = value[0];

    // 슬라이더 드래그 시작 시 재생 중이었다면 일시정지
    if (isPlaying) {
      setIsPlaying(false);
    }

    // 즉시 해당 프레임으로 점프 (삼각형 초기화 후 시뮬레이션)
    if (
      renderContextRef.current &&
      sourceCanvasRef.current &&
      canvasRef.current
    ) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // 초기 상태로 리셋
      renderContextRef.current.reset();

      // 목표 프레임까지 시뮬레이션
      for (let i = 0; i <= targetFrame; i++) {
        renderer.renderFrame(
          ctx,
          sourceCanvasRef.current,
          i,
          totalFrames,
          renderContextRef.current,
          options
        );
      }
    }

    setCurrentFrame(targetFrame);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
        {!image ? (
          <div className="text-center text-muted-foreground">
            <p>이미지를 업로드하면 미리보기가 표시됩니다</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center bg-muted/10 rounded-lg overflow-hidden p-4">
              <canvas
                ref={canvasRef}
                style={{
                  width: `${outputSize}px`,
                  height: `${outputSize}px`,
                  imageRendering: "pixelated",
                }}
                className="border border-muted"
              />
            </div>

            <div className="w-full max-w-[500px] space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm text-muted-foreground">
                  프레임: {currentFrame + 1} / {totalFrames}
                </Label>
                <Label className="text-sm text-muted-foreground">
                  {((currentFrame / totalFrames) * 100).toFixed(0)}%
                </Label>
              </div>
              <Slider
                value={[currentFrame]}
                onValueChange={handleSliderChange}
                onPointerDown={() => setIsDraggingSlider(true)}
                onPointerUp={() => setIsDraggingSlider(false)}
                min={0}
                max={totalFrames - 1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex gap-2 w-full max-w-xs flex-col">
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      일시정지
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      재생
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  size="lg"
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      생성 중... {generationProgress}%
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      APNG 다운로드
                    </>
                  )}
                </Button>
              </div>
            </div>

            {onResetImage && (
              <button
                onClick={onResetImage}
                className="w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors mt-4"
              >
                다른 이미지 업로드
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
