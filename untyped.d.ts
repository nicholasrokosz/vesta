declare module 'iso-3166-1' {
  export const whereAlpha2: (alpha2: string) => { alpha3: string } | undefined
}
