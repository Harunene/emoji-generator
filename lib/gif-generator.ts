import GIF from "gif.js";
import type { EffectRenderer, RenderContext } from "./effects/types";
import type { AnimationConfig } from "./types";

export async function generateGIF<TOptions, TContext extends RenderContext>(
  image: HTMLImageElement,
  renderer: EffectRenderer<TOptions, TContext>,
  options: TOptions,
  config: AnimationConfig,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { frameCount, fps, outputSize } = config;
  const frameDelay = Math.floor(1000 / fps); // ms per frame

  // 투명 배경 옵션 확인 (ShatterOptions 타입 가정)
  const isTransparent = (options as any).transparent === true;

  // 투명도 키 색상 (매우 드문 색상 사용 - 밝은 녹색)
  const TRANSPARENCY_KEY_COLOR = "#00FF00";
  const TRANSPARENCY_KEY_HEX = 0x00ff00;

  // 원본 이미지를 캔버스에 그리기
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = outputSize;
  sourceCanvas.height = outputSize;
  const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceCtx) throw new Error("Failed to get source context");

  // 이미지 크기 조정 및 그리기 (정사각형으로)
  const scale = Math.min(outputSize / image.width, outputSize / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const offsetX = (outputSize - scaledWidth) / 2;
  const offsetY = (outputSize - scaledHeight) / 2;

  sourceCtx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

  // 투명 배경인 경우 원본 이미지의 알파 채널 임계값 처리
  if (isTransparent) {
    const imageData = sourceCtx.getImageData(0, 0, outputSize, outputSize);
    const data = imageData.data;
    const alphaThreshold = 128;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];

      if (alpha < alphaThreshold) {
        // 반투명 픽셀을 완전히 투명하게
        data[i] = 0; // R
        data[i + 1] = 0; // G
        data[i + 2] = 0; // B
        data[i + 3] = 0; // A
      } else {
        // 불투명 픽셀 유지 (알파는 255로 설정)
        data[i + 3] = 255;
      }
    }

    sourceCtx.putImageData(imageData, 0, 0);
  }

  // 렌더링 옵션은 그대로 사용 (투명 배경으로 렌더링)
  const renderOptions = options;

  // 독립적인 렌더 컨텍스트 생성
  const renderContext = renderer.createContext(
    outputSize,
    outputSize,
    renderOptions
  );

  // GIF 인코더 생성
  const gifOptions: any = {
    workers: 2,
    quality: 10,
    width: outputSize,
    height: outputSize,
    workerScript: "/gif.worker.js",
  };

  // 투명 배경 설정 - 키 색상을 투명으로 처리
  if (isTransparent) {
    gifOptions.transparent = TRANSPARENCY_KEY_HEX;
  }

  const gif = new GIF(gifOptions);

  // 프레임 렌더링 캔버스
  const renderCanvas = document.createElement("canvas");
  renderCanvas.width = outputSize;
  renderCanvas.height = outputSize;
  const renderCtx = renderCanvas.getContext("2d", {
    willReadFrequently: true,
  });
  if (!renderCtx) throw new Error("Failed to get render context");

  console.log("Generating GIF frames...", {
    isTransparent,
    transparentColor: isTransparent ? TRANSPARENCY_KEY_HEX : "none",
  });

  // 프레임 생성
  for (let frame = 0; frame < frameCount; frame++) {
    // 프레임 렌더링 (투명 배경의 경우 키 색상 사용)
    renderer.renderFrame(
      renderCtx,
      sourceCanvas,
      frame,
      frameCount,
      renderContext,
      renderOptions
    );

    // 투명 배경인 경우: 투명/반투명 픽셀을 키 색상으로 변환
    if (isTransparent) {
      const frameData = renderCtx.getImageData(0, 0, outputSize, outputSize);
      const data = frameData.data;
      const alphaThreshold = 128;
      const keyR = 0x00;
      const keyG = 0xff;
      const keyB = 0x00;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];

        if (alpha < alphaThreshold) {
          // 반투명 또는 투명 픽셀을 키 색상으로 변환
          data[i] = keyR;
          data[i + 1] = keyG;
          data[i + 2] = keyB;
          data[i + 3] = 255;
        } else {
          // 완전 불투명 픽셀은 그대로 유지
          data[i + 3] = 255;
        }
      }

      renderCtx.putImageData(frameData, 0, 0);
    }

    // GIF에 프레임 추가
    gif.addFrame(renderCanvas, {
      delay: frameDelay,
      copy: true,
      dispose: isTransparent ? 2 : -1, // 투명 배경 시 dispose=2 (배경으로 복원)
    });

    // 진행상황 보고
    if (onProgress) {
      onProgress(((frame + 1) / frameCount) * 50); // 0-50%는 프레임 생성
    }

    // 브라우저가 멈추지 않도록 주기적으로 yield
    if (frame % 10 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  console.log("Encoding GIF...");

  // GIF 인코딩
  return new Promise((resolve, reject) => {
    gif.on("progress", (progress) => {
      if (onProgress) {
        onProgress(50 + progress * 50); // 50-100%는 인코딩
      }
    });

    gif.on("finished", (blob) => {
      console.log("GIF size:", blob.size, "bytes");
      resolve(blob);
    });

    gif.on("abort", () => {
      reject(new Error("GIF generation was aborted"));
    });

    gif.render();
  });
}
