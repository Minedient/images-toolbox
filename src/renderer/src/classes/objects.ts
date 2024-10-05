import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export interface ImageObj {
  file: File
  fileURL: string
  width: number
  height: number
}

export class EncodeParameters {
  isAuto: boolean
  isLossless: boolean
  zCompression: number
  quality: number
  method: number
  constructor(
    isAuto: boolean,
    isLossless: boolean,
    zCompression: number,
    quality: number,
    method: number
  ) {
    this.isAuto = isAuto
    this.isLossless = isLossless
    this.zCompression = zCompression
    this.quality = quality
    this.method = method
  }
}

/**
 * Pinia store for other pages to access the runtime parameters
 */
export const useRunTimeParameters = defineStore('rtParams', () => {
  const quality = ref(0)
  const method = ref(0)
  const zCompression = ref(0)
  const outputFolder = ref('')
  return { quality, method, zCompression, outputFolder }
})

/**
 * Pinia store for other pages to access the images data imported in encode page
 */
export const useImagesData = defineStore('imagesDataStore', () => {
  const images: ImageObj[] = reactive([])
  return { images }
})

export class MarkovNode {
  value: string = ''
  next: { node: MarkovNode, weight: number }[] = []
  constructor(value: string = '') {
    this.value = value
  }
  addNext(node: MarkovNode, weight: number) {
    this.next.push({ node, weight })
  }
  getNext() {
    let totalWeight = this.next.reduce((acc, cur) => acc + cur.weight, 0)
    let random = Math.random() * totalWeight
    let currentWeight = 0
    for (let i = 0; i < this.next.length; i++) {
      currentWeight += this.next[i].weight
      if (random < currentWeight) {
        return this.next[i].node
      }
    }
    return this.next[this.next.length - 1].node
  }
  getValue() {
    return this.value
  }
}

export class MarkovChain {
  currentState: MarkovNode = new MarkovNode
}