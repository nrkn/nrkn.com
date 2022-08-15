export type Rgb = [number, number, number]

export type Bit = 0 | 1

export type Bitmap = {
  width: number
  height: number
  data: Bit[]
}

export type CreateBitmap = {
  (width: number, height: number, data?: Bit[]): Bitmap
}

export type BlitBitmap = {
  (
    source: Bitmap, dest: Bitmap,
    sx?: number, sy?: number,
    sw?: number, sh?: number,
    dx?: number, dy?: number
  ): void
}

export type LoadFont = {
  (src: string): Promise<Bitmap[]>
}

export type TextDrawList = {
  ( font: Bitmap[], text?: string ): DrawList
}

export type LoadImage = {
  ( src: string ): Promise<HTMLImageElement>
}

export type OnRender = {
  ( bitmap: Bitmap, time: number ): void
}

export type Renderer = {
  start: () => Promise<void>
}

export type CreateRenderer = {
  ( onRender: OnRender ): Renderer
}

export type DrawBitmap = {
  x: number
  y: number
  bitmap: Bitmap
}

export type DrawListData = {
  right: number
  bottom: number
  drawList: DrawBitmap[]
}

export type DrawList = {
  ( dest: Bitmap, list: DrawListData, dx?: number, dy?: number ): void
}