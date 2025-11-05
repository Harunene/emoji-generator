// 렌더 컨텍스트 - 각 이펙트가 프레임 간 상태를 유지하기 위해 사용
export interface RenderContext {
  reset(): void;
  // 이펙트별로 필요한 상태를 여기에 저장
}

// 이펙트 렌더러 인터페이스
export interface EffectRenderer<
  TOptions = any,
  TContext extends RenderContext = RenderContext
> {
  // 컨텍스트 생성
  createContext(width: number, height: number, options: TOptions): TContext;

  // 특정 프레임 렌더링
  renderFrame(
    ctx: CanvasRenderingContext2D,
    sourceCanvas: HTMLCanvasElement,
    frameIndex: number,
    totalFrames: number,
    renderContext: TContext,
    options: TOptions
  ): void;
}

// Shatter 이펙트용 렌더 컨텍스트
export interface ShatterRenderContext extends RenderContext {
  triangles: import("../types").Triangle[];
  initialTriangles: import("../types").Triangle[]; // 초기 상태 저장
  frameCount: number;
  delayFrames: number;
}
