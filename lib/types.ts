export type EffectType = 'shatter';

export interface ShatterOptions {
  pieceCount: number;
  gravity: number;
  spreadDirection: number;
  backgroundColor: string;
  transparent: boolean;
}

export type OutputSize = 256 | 128 | 64;

export interface AnimationConfig {
  frameCount: number;
  fps: number;
  outputSize: OutputSize;
}

export interface EffectOptions {
  type: EffectType;
  shatter: ShatterOptions;
}

export interface Triangle {
  points: [number, number, number, number, number, number]; // x1, y1, x2, y2, x3, y3
  originalPoints: [number, number, number, number, number, number]; // 원본 위치 저장
  centerX: number;
  centerY: number;
  originalCenterX: number;
  originalCenterY: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
}

