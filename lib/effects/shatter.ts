import Delaunator from "delaunator";
import type { Triangle, ShatterOptions } from "../types";

export function generateTriangles(
  width: number,
  height: number,
  options: ShatterOptions
): Triangle[] {
  // 랜덤 포인트 생성 (Delaunay 삼각분할을 위해)
  const points: number[] = [];

  // 가장자리에 포인트 추가 (경계 유지)
  const edgePoints = 10;
  for (let i = 0; i <= edgePoints; i++) {
    const t = i / edgePoints;
    points.push(width * t, 0); // 상단
    points.push(width * t, height); // 하단
    points.push(0, height * t); // 왼쪽
    points.push(width, height * t); // 오른쪽
  }

  // 내부에 랜덤 포인트 추가
  const numRandomPoints = Math.max(options.pieceCount - edgePoints * 4, 20);
  for (let i = 0; i < numRandomPoints; i++) {
    points.push(Math.random() * width, Math.random() * height);
  }

  // Delaunay 삼각분할
  const delaunay = Delaunator.from(
    points
      .map((_, i) => (i % 2 === 0 ? [points[i], points[i + 1]] : null))
      .filter(Boolean) as [number, number][]
  );

  const triangles: Triangle[] = [];

  // 삼각형 생성
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    const p1Index = delaunay.triangles[i] * 2;
    const p2Index = delaunay.triangles[i + 1] * 2;
    const p3Index = delaunay.triangles[i + 2] * 2;

    const x1 = points[p1Index];
    const y1 = points[p1Index + 1];
    const x2 = points[p2Index];
    const y2 = points[p2Index + 1];
    const x3 = points[p3Index];
    const y3 = points[p3Index + 1];

    // 중심점 계산
    const centerX = (x1 + x2 + x3) / 3;
    const centerY = (y1 + y2 + y3) / 3;

    // 중심에서의 각도 계산
    const angleFromCenter = Math.atan2(
      centerY - height / 2,
      centerX - width / 2
    );

    // 흩어지는 방향 계산
    const spreadFactor = options.spreadDirection / 100;
    const baseVelocityX = Math.cos(angleFromCenter) * spreadFactor * 5;
    const baseVelocityY = Math.sin(angleFromCenter) * spreadFactor * 5;

    // 약간의 랜덤성 추가
    const velocityX = baseVelocityX + (Math.random() - 0.5) * 2;
    const velocityY = baseVelocityY + (Math.random() - 0.5) * 2;

    triangles.push({
      points: [x1, y1, x2, y2, x3, y3],
      originalPoints: [x1, y1, x2, y2, x3, y3],
      centerX,
      centerY,
      originalCenterX: centerX,
      originalCenterY: centerY,
      velocityX,
      velocityY,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    });
  }

  return triangles;
}

export function updateTriangles(
  triangles: Triangle[],
  options: ShatterOptions,
  deltaTime: number = 1
): Triangle[] {
  return triangles.map((triangle) => {
    // 중력 적용
    const newVelocityY = triangle.velocityY + options.gravity * deltaTime;

    // 위치 업데이트
    const newCenterX = triangle.centerX + triangle.velocityX * deltaTime;
    const newCenterY = triangle.centerY + newVelocityY * deltaTime;

    // 회전 업데이트
    const newRotation = triangle.rotation + triangle.rotationSpeed * deltaTime;

    // 포인트들을 새로운 중심과 회전에 맞게 업데이트
    const deltaX = newCenterX - triangle.centerX;
    const deltaY = newCenterY - triangle.centerY;

    const newPoints: [number, number, number, number, number, number] = [
      triangle.points[0] + deltaX,
      triangle.points[1] + deltaY,
      triangle.points[2] + deltaX,
      triangle.points[3] + deltaY,
      triangle.points[4] + deltaX,
      triangle.points[5] + deltaY,
    ];

    return {
      ...triangle,
      points: newPoints,
      centerX: newCenterX,
      centerY: newCenterY,
      velocityY: newVelocityY,
      rotation: newRotation,
    };
  });
}

export function drawTriangle(
  ctx: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  triangle: Triangle
) {
  const [x1, y1, x2, y2, x3, y3] = triangle.points;
  const [ox1, oy1, ox2, oy2, ox3, oy3] = triangle.originalPoints;

  ctx.save();

  // 1. 먼저 현재 위치로 이동하고 회전 적용
  ctx.translate(triangle.centerX, triangle.centerY);
  ctx.rotate(triangle.rotation);

  // 2. 원본 삼각형 좌표를 로컬 좌표계로 변환 (중심 기준)
  const lx1 = ox1 - triangle.originalCenterX;
  const ly1 = oy1 - triangle.originalCenterY;
  const lx2 = ox2 - triangle.originalCenterX;
  const ly2 = oy2 - triangle.originalCenterY;
  const lx3 = ox3 - triangle.originalCenterX;
  const ly3 = oy3 - triangle.originalCenterY;

  // 3. 로컬 좌표로 클리핑 경로 생성
  ctx.beginPath();
  ctx.moveTo(lx1, ly1);
  ctx.lineTo(lx2, ly2);
  ctx.lineTo(lx3, ly3);
  ctx.closePath();
  ctx.clip();

  // 4. 원본 이미지를 로컬 좌표계에 그리기
  ctx.drawImage(
    sourceCanvas,
    -triangle.originalCenterX,
    -triangle.originalCenterY
  );

  ctx.restore();
}
