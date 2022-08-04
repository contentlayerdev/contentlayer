// TODO remove this file when `imagescript` has TS types published on npm

declare module 'imagescript' {
  export class Image {
    private __width__: number
    private __height__: number
    private __buffer__: ArrayBuffer
    private __view__: DataView
    private __u32__: Uint32Array
    bitmap: Uint8ClampedArray

    constructor(width: number, height: number)

    private toString(): string

    get width(): number

    get height(): number

    *[Symbol.iterator](): void

    *iterateWithColors(): Generator<[x: number, y: number, color: number], void, unknown>

    static rgbaToColor(r: number, g: number, b: number, a: number): number

    static rgbToColor(r: number, g: number, b: number): number

    static hslaToColor(h: number, s: number, l: number, a: number): number

    static hslToColor(h: number, s: number, l: number): number

    static rgbaToHSLA(r: number, g: number, b: number, a: number): number[]

    static colorToRGBA(color: number): number[]

    static colorToRGB(color: number): number[]

    getPixelAt(x: number, y: number): number

    getRGBAAt(x: number, y: number): Uint8ClampedArray

    setPixelAt(x: number, y: number, pixelColor: number): Image

    private __set_pixel__(x: number, y: number, pixelColor: number): void

    private __check_boundaries__(x: number, y: number): void

    private static get __out_of_bounds__(): string

    fill(color: number | colorFunction): Image

    clone(): Image

    static get RESIZE_NEAREST_NEIGHBOR(): string

    static get RESIZE_AUTO(): number

    scale(factor: number, mode?: string): Image

    private __scale__(factor: number, mode?: string)

    resize(width: number, height: number, mode?: string): Image

    contain(width: number, height: number, mode?: string): Image

    fit(width: number, height: number, mode?: string): Image

    cover(width: number, height: number, mode?: string): Image

    private __resize__(width: number, height: number, mode?: string): Image

    private __resize_nearest_neighbor__(width: number, height: number): Image

    crop(x: number, y: number, width: number, height: number): Image

    private __crop__(x: number, y: number, width: number, height: number): Image

    drawBox(x: number, y: number, width: number, height: number, color: number | colorFunction): Image

    private __fast_box__(x: number, y: number, width: number, height: number, color: number): Image

    drawCircle(x: number, y: number, radius: number, color: number | colorFunction): Image

    cropCircle(max?: boolean, feathering?: number): Image

    opacity(opacity: number, absolute?: boolean): Image

    red(saturation: number, absolute?: boolean): Image

    green(saturation: number, absolute?: boolean): Image

    blue(saturation: number, absolute?: boolean): Image

    private __set_channel_value__(value: number, absolute: boolean, offset: number): void

    lightness(value: number, absolute?: boolean): Image

    saturation(value: number, absolute?: boolean): Image

    composite(source: Image, x?: number, y?: number): Image

    invert(): Image

    invertValue(): Image

    invertSaturation(): Image

    invertHue(): Image

    hueShift(degrees: number): Image

    averageColor(): number

    dominantColor(ignoreBlack?: boolean, ignoreWhite?: boolean, bwThreshold?: number): number

    rotate(angle: number, resize?: boolean): Image

    private __apply__(image: Image | Frame): Image | Frame

    static gradient(colors: { [position: number]: number }): (position: number) => number

    roundCorners(radius?: number): Image

    private static __gradient__(startColor: number, endColor: number): number

    fisheye(radius?: number): Image

    async encode(compression?: number, metadata?: PNGMetadata): Promise<Uint8Array>
    async encode(metadata?: PNGMetadata): Promise<Uint8Array>

    async encodeJPEG(quality?: number): Promise<Uint8Array>

    async encodeWEBP(quality?: null | number): Promise<Uint8Array>

    static async encode(data: Buffer | Uint8Array): Promise<Image>

    static get SVG_MODE_SCALE(): number

    static get SVG_MODE_WIDTH(): number

    static get SVG_MODE_HEIGHT(): number

    static async renderSVG(svg: string, size?: number, mode?: number): Promise<Image>

    static async renderText(
      font: Uint8Array,
      scale: number,
      text: string,
      color?: number,
      layout?: TextLayout,
    ): Promise<Image>
  }

  export class Frame extends Image {
    static get DISPOSAL_KEEP(): string

    static get DISPOSAL_PREVIOUS(): string

    static get DISPOSAL_BACKGROUND(): string

    private static __convert_disposal_mode__(mode: string | number): any

    constructor(
      width: number,
      height: number,
      duration?: number,
      xOffset?: number,
      yOffset?: number,
      disposalMode?: typeof Frame.DISPOSAL_KEEP | string,
    )

    toString(): string

    static from(
      image: Image,
      duration?: number,
      xOffset?: number,
      yOffset?: number,
      disposalMode?: typeof Frame.DISPOSAL_KEEP | string,
    ): Frame

    resize(width: number, height: number, mode?: typeof Image.RESIZE_NEAREST_NEIGHBOR | string): Image
  }

  export class GIF extends Array {
    constructor(frames: Frame[], loopCount?: number)

    get width(): number

    get height(): number

    toString(): string

    *[Symbol.iterator](): Generator<Frame, void, *>

    slice(start: number, end: number): GIF

    get duration(): number

    async encode(quality?: number): Promise<Uint8Array>

    static async decode(data: Buffer | Uint8Array, onlyExtractFirstFrame?: boolean): Promise<GIF>

    resize(width: number, height: number, mode?: typeof Image.RESIZE_NEAREST_NEIGHBOR | string): void
  }

  export class TextLayout {
    constructor(options?: {
      maxWidth?: number
      maxHeight?: number
      wrapStyle?: string
      verticalAlign?: string
      horizontalAlign?: string
      wrapHardBreaks?: boolean
    })
  }

  export class ImageType {
    static getType(data: Buffer | Uint8Array): string | null

    static isPNG(view: DataView): boolean

    static isJPEG(view: DataView): boolean

    static isTIFF(view: DataView): boolean

    static isGIF(view: DataView): boolean
  }

  export function decode(data: Uint8Array | Buffer, onlyExtractFirstFrame?: boolean): Promise<GIF | Image>

  type colorFunction = (x: number, y: number) => number

  type PNGMetadata = {
    title?: string
    author?: string
    description?: string
    copyright?: string
    creationTime?: string | number | Date
    software?: string
    disclaimer?: string
    warning?: string
    source?: string
    comment?: string
  }
}
