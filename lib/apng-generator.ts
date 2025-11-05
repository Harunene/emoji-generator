import UPNG from 'upng-js';
import type { EffectRenderer, RenderContext } from './effects/types';
import type { AnimationConfig } from './types';

export async function generateAPNG<TOptions, TContext extends RenderContext>(
  image: HTMLImageElement,
  renderer: EffectRenderer<TOptions, TContext>,
  options: TOptions,
  config: AnimationConfig,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { frameCount, fps, outputSize } = config;
  const frameDuration = Math.floor(1000 / fps); // ms per frame
  
  // 원본 이미지를 캔버스에 그리기
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = outputSize;
  sourceCanvas.height = outputSize;
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!sourceCtx) throw new Error('Failed to get source context');
  
  // 이미지 크기 조정 및 그리기 (정사각형으로)
  const scale = Math.min(outputSize / image.width, outputSize / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const offsetX = (outputSize - scaledWidth) / 2;
  const offsetY = (outputSize - scaledHeight) / 2;
  
  sourceCtx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
  
  // 독립적인 렌더 컨텍스트 생성 (미리보기와 공유하지 않음)
  const renderContext = renderer.createContext(outputSize, outputSize, options);
  
  // 프레임 생성 (UPNG.encode는 ArrayBuffer 배열을 기대함)
  const frames: ArrayBuffer[] = [];
  const delays: number[] = [];
  
  const renderCanvas = document.createElement('canvas');
  renderCanvas.width = outputSize;
  renderCanvas.height = outputSize;
  const renderCtx = renderCanvas.getContext('2d', { willReadFrequently: true });
  if (!renderCtx) throw new Error('Failed to get render context');
  
  for (let frame = 0; frame < frameCount; frame++) {
    // 프레임 렌더링
    renderer.renderFrame(
      renderCtx,
      sourceCanvas,
      frame,
      frameCount,
      renderContext,
      options
    );
    
    // 프레임 데이터 추출
    const imageData = renderCtx.getImageData(0, 0, outputSize, outputSize);
    
    // ArrayBuffer를 직접 사용 (UPNG는 ArrayBuffer를 기대함)
    frames.push(imageData.data.buffer);
    delays.push(frameDuration);
    
    // 첫 프레임 디버그
    if (frame === 0) {
      const testData = new Uint8Array(imageData.data.buffer);
      console.log('First frame check:', {
        bufferSize: imageData.data.buffer.byteLength,
        hasNonZero: testData.some(v => v !== 0),
        firstPixels: Array.from(testData.slice(0, 20))
      });
    }
    
    // 진행상황 보고 (비동기로 UI 업데이트 허용)
    if (onProgress) {
      onProgress((frame + 1) / frameCount * 100);
    }
    
    // 브라우저가 멈추지 않도록 주기적으로 yield
    if (frame % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  console.log('Encoding APNG with', frames.length, 'frames');
  
  // APNG 인코딩 (cnum: 0 = lossless/truecolor with alpha)
  const apng = UPNG.encode(frames, outputSize, outputSize, 0, delays);
  
  console.log('APNG size:', apng.byteLength, 'bytes');
  
  return new Blob([apng], { type: 'image/png' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

