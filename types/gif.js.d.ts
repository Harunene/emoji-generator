declare module "gif.js" {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    workerScript?: string;
    width?: number;
    height?: number;
    transparent?: number | string;
    background?: string;
    dither?: boolean | string;
    repeat?: number;
    debug?: boolean;
  }

  interface AddFrameOptions {
    delay?: number;
    copy?: boolean;
    dispose?: number;
  }

  class GIF {
    constructor(options?: GIFOptions);

    addFrame(
      imageOrCanvas:
        | HTMLImageElement
        | HTMLCanvasElement
        | CanvasRenderingContext2D,
      options?: AddFrameOptions
    ): void;

    on(event: "finished", callback: (blob: Blob) => void): void;
    on(event: "progress", callback: (progress: number) => void): void;
    on(event: "abort" | "start", callback: () => void): void;

    render(): void;
    abort(): void;
  }

  export default GIF;
}
