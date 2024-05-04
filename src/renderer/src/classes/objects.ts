import { defineStore } from 'pinia';
import { ref } from 'vue';

export class EncodeParameters {
    isAuto: boolean;
    isLossless: boolean;
    zCompression: number;
    quality: number;
    method: number;
    constructor(isAuto: boolean, isLossless: boolean, zCompression: number, quality: number, method: number) {
        this.isAuto = isAuto;
        this.isLossless = isLossless;
        this.zCompression = zCompression;
        this.quality = quality;
        this.method = method;
    }
}

export const useRunTimeParameters = defineStore('rtParams', () => {
    const quality = ref(0);
    const method = ref(0);
    const zCompression = ref(0);
    return { quality, method, zCompression };
})