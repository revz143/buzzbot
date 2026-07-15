import type { BuzzzApi } from '../shared/types'

declare global {
  interface Window {
    buzzz: BuzzzApi
  }
}

export {}
