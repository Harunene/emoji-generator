import type { EffectRenderer, ShatterRenderContext } from "./types";
import type { ShatterOptions } from "../types";
import { generateTriangles, updateTriangles, drawTriangle } from "./shatter";

export class ShatterRenderer
  implements EffectRenderer<ShatterOptions, ShatterRenderContext>
{
  createContext(
    width: number,
    height: number,
    options: ShatterOptions
  ): ShatterRenderContext {
    // 항상 새로운 삼각형 생성
    const initialTriangles = generateTriangles(width, height, options);

    // 깊은 복사를 위한 헬퍼 함수
    const deepCopyTriangles = (triangles: typeof initialTriangles) => {
      return triangles.map((t) => ({
        points: [...t.points] as typeof t.points,
        originalPoints: [...t.originalPoints] as typeof t.originalPoints,
        centerX: t.centerX,
        centerY: t.centerY,
        originalCenterX: t.originalCenterX,
        originalCenterY: t.originalCenterY,
        velocityX: t.velocityX,
        velocityY: t.velocityY,
        rotation: t.rotation,
        rotationSpeed: t.rotationSpeed,
      }));
    };

    const initialTrianglesCopy = deepCopyTriangles(initialTriangles);
    const trianglesCopy = deepCopyTriangles(initialTriangles);

    return {
      triangles: trianglesCopy,
      initialTriangles: initialTrianglesCopy,
      frameCount: 0,
      delayFrames: 10,
      reset: function () {
        // 초기 상태로 복원 (random 재생성 없이)
        this.triangles = deepCopyTriangles(this.initialTriangles);
        this.frameCount = 0;
      },
    };
  }

  renderFrame(
    ctx: CanvasRenderingContext2D,
    sourceCanvas: HTMLCanvasElement,
    frameIndex: number,
    totalFrames: number,
    renderContext: ShatterRenderContext,
    options: ShatterOptions
  ): void {
    const { width, height } = ctx.canvas;

    // 배경 지우기
    ctx.clearRect(0, 0, width, height);

    // 배경색 또는 투명 배경 설정
    if (!options.transparent) {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    // 딜레이 프레임 이후 애니메이션 시작
    if (frameIndex < renderContext.delayFrames) {
      // 원본 이미지 표시
      ctx.drawImage(sourceCanvas, 0, 0, width, height);
    } else if (frameIndex < totalFrames) {
      // 삼각형 애니메이션
      renderContext.triangles.forEach((triangle) => {
        drawTriangle(ctx, sourceCanvas, triangle);
      });

      // 다음 프레임을 위해 삼각형 업데이트 (마지막 프레임이 아닐 때만)
      if (frameIndex < totalFrames - 1) {
        renderContext.triangles = updateTriangles(
          renderContext.triangles,
          options,
          1
        );
      }
    }

    renderContext.frameCount = frameIndex;
  }
}
