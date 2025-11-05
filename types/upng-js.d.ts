declare module "upng-js" {
  interface UPNG {
    encode(
      frames: ArrayBuffer[],
      width: number,
      height: number,
      cnum: number,
      delays: number[]
    ): ArrayBuffer;

    decode(buffer: ArrayBuffer): {
      width: number;
      height: number;
      depth: number;
      ctype: number;
      frames: ArrayBuffer[];
      tabs: Record<string, any>;
    };

    toRGBA8(image: any): ArrayBuffer[];
  }

  const UPNG: UPNG;
  export default UPNG;
}
