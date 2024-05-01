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