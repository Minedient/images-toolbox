<script setup lang="ts">
import { reactive, ref } from 'vue';

interface ImageObj {
    file: File,
    fileURL: string
}

const dragzone = ref('');
const imagesObjs: ImageObj[] = reactive([]);
const hasDetailed = ref(false);
const dImageObj = reactive(<ImageObj>{});
const epMaxHeight = ref(0);
const isAuto = ref(true);
const isLossless = ref(true);
const zCompression = ref(6);
const quality = ref(80);

//TODO: Use an object to store the image details and update them reactively

const filesDropped = async (event: DragEvent) => {
    event.preventDefault();
    dragzone.value = '';
    const files = (await readDroppedEntries(event.dataTransfer)).flat().filter(file => file.type.startsWith('image/'));
    files.forEach(file => {
        imagesObjs.push({ file: file, fileURL: URL.createObjectURL(file) })
    });
}

const filesSelected = async (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    (files ? [...files].filter(file => file.type.startsWith('image/')) : []).forEach(file => {
        imagesObjs.push({ file: file, fileURL: URL.createObjectURL(file) })
    });
}

const dragleave = (event: DragEvent) => {
    event.preventDefault();
    dragzone.value = '';
}

const dragover = (event: DragEvent) => {
    event.preventDefault();
    dragzone.value = 'dragenter';
}

const clearImagesPanel = () => {
    imagesObjs.forEach(obj => URL.revokeObjectURL(obj.fileURL));
    imagesObjs.splice(0, imagesObjs.length);
    hasDetailed.value = false;
}

const loadImageToDetailedViewer = (event: MouseEvent) => {
    const target = event.target as HTMLImageElement;
    if (hasDetailed.value) {
        if (dImageObj.fileURL === target.src) {
            hasDetailed.value = false;
            return;
        }
    }
    hasDetailed.value = true;
    const imageObj = imagesObjs.find(obj => obj.fileURL === target.src);
    if (imageObj) {
        dImageObj.file = imageObj.file;
        dImageObj.fileURL = imageObj.fileURL;
    };
}

const expandCollapsedDiv = (event: MouseEvent) => {
    const div = (event.target as HTMLElement).nextElementSibling as HTMLElement;
    epMaxHeight.value = epMaxHeight.value === 0 ? div.scrollHeight : 0;
}

const checkboxAuto = (event: Event) => {
    const checkbox = event.target as HTMLInputElement;
    isAuto.value = checkbox.checked;
}

const selectMode = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    isLossless.value = select.value === 'true';
}

const inputZCompression = (event: Event) => {
    const input = event.target as HTMLInputElement;
    zCompression.value = Number(input.value);
}

const inputQuality = (event: Event) => {
    const input = event.target as HTMLInputElement;
    quality.value = Number(input.value);
}

/**
 * Read dropped files and directories
 * @param entries The DataTransfer object containing the files
 * @returns Array of files
 */
async function readDroppedEntries(entries: DataTransfer | null) {
    const directoryEntries = entries ? [...entries.items].map(item => item.webkitGetAsEntry ? item.webkitGetAsEntry() : null).filter(entry => entry) : [];
    if (directoryEntries.length) {
        return await getAllFiles(directoryEntries);
    } else return [];
}

/**
 * Get all files in the directory recursively
 * @param entries The array of directory entries
 * @returns A Promise containing the array of files
 */
async function getAllFiles(entries: any[]) {
    const files = entries.map(entry => traverse(entry, []));
    return Promise.all(files);

    async function traverse(entry, files) {
        if (entry.isDirectory) {
            const dirReader = entry.createReader();
            await new Promise<void>((resolve) => {
                dirReader.readEntries(async dirEntries => {
                    for (let dirEntry of dirEntries) {
                        await traverse(dirEntry, files);
                    }
                    resolve();
                });
            });
        } else if (entry.isFile) {
            await new Promise<void>((resolve) => {
                entry.file((file: File) => { files.push(file); resolve(); });
            });
        }
        return files;
    }
}
</script>

<template>

    <div class="container vertical" id="tweaker">
        <div class="borderless-container" id="dropzone" :class="dragzone">
            <input type="file" id="file-input" multiple webkitdirectory hidden @change="filesSelected">
            <label for="file-input" @dragover="dragover" @dragleave="dragleave" @drop="filesDropped">Drop files here or
                click on me</label>
        </div>
        <div id="button-list">
            <button class="small-button" @click="">Encode all</button>
            <button class="small-button" @click="">Encode selected</button>
            <button class="small-button" @click="clearImagesPanel">Clear Selection</button>
        </div>
        <hr class="fw-hr">
        <div class="container vertical">
            <h3 id="c-h3" @click="expandCollapsedDiv">Encoding parameters</h3>
            <div id="encoding-parameters" :style="{ 'max-height': epMaxHeight + 'px' }">
                <div id="is-auto">
                    <p>Auto?</p>
                    <input type="checkbox" checked @change="checkboxAuto">
                </div>
                <div id="manual-parameters">
                    <label for="mode-select">Choose mode: </label>
                    <select id="mode-select" name="mode" :disabled=isAuto @change="selectMode">
                        <option value=true>Lossless</option>
                        <option value=false>Lossy</option>
                    </select>
                    <div id="left-right-panel">
                        <div id="left-column" v-if="isLossless">
                            <p>Z-Compression</p>
                            <input id="z-compression" type="range" min="0" max="9" step="1" value="6" :disabled=isAuto @input="inputZCompression">
                            <label for="z-compression">{{zCompression}}</label>
                        </div>
                        <div id="right-column" v-if="!isLossless">
                            <p>Quality</p>
                            <input id="quality" type="range" min="0" max="100" step="5" value="100" :disabled=isAuto @input="inputQuality">
                            <label for="quality">{{quality}}</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!--Images Viewer-->
    <div class="container" id="images-viewer">
        <img v-for="image in imagesObjs" :src="image.fileURL" @click="loadImageToDetailedViewer">
    </div>

    <!--Detailed Viewer-->
    <div class="container vertical" id="detailed-viewer">
        <div v-if="hasDetailed">
            <img :src="dImageObj.fileURL">
            <hr class="fw-hr">
            <h3>Details</h3>
            <div id="detailed-info-grid">
                <p>Name: </p>
                <p>{{ dImageObj.file.name }}</p>
                <p>Type: </p>
                <p>{{ dImageObj.file.type }}</p>
                <p>Size: </p>
                <p>{{ ((dImageObj.file.size) / 1024.0).toFixed(3) }} kB</p>
                <p>L. M: </p>
                <p>{{ new Date(dImageObj.file.lastModified) }}</p>
            </div>
        </div>
    </div>
</template>

<style>
.dragenter {
    background-color: var(--container-dark);
}

.vertical {
    flex-direction: column;
}

.fw-hr {
    width: 100%;
}

#dropzone {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px dashed #ccc;
    border-radius: 5px;
    aspect-ratio: 16/9;
}

#dropzone:hover {
    background-color: var(--background-soft-dark);
}

#dropzone label {
    cursor: pointer;
    width: calc(100% - 80px);
    height: 100%;
    padding-left: 40px;
    padding-right: 40px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}

#images-viewer {
    flex-wrap: wrap;
    padding: 5px;
}

#images-viewer img {
    width: auto;
    height: 200px;
    border-radius: 5px;
    border: 1px solid black;
    cursor: pointer;
    margin: 5px;
    transition: transform 0.2s ease;
}

#images-viewer img:hover {
    transform: scale(1.05);
}

#button-list {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    column-gap: 5px;
}

#detailed-viewer {
    align-items: center;
}

#detailed-viewer img {
    width: 100%;
    height: auto;
    border-radius: 5px;
    border: 1px solid black;
    margin: 5px;
    transition: transform 0.2s ease;
}

#detailed-info-grid {
    display: inline-grid;
    grid-template-columns: auto 1fr;
    grid-column-gap: 10px;
}

#detailed-info-grid p {
    margin-top: 5px;
    margin-bottom: 5px;
}

#encoding-parameters {
    transition: max-height 0.5s ease;
    overflow: hidden;
    line-height: 0.3em;
    text-align: left;
}

#c-h3 {
    cursor: pointer;
    width: 100%;
    margin: 0px;
    padding-top: 5px;
    padding-bottom: 5px;
}

#is-auto {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 10px;
}

#left-right-panel {
    display: flex;
    align-items: center;
}
#left-right-panel div{
    flex-grow: 1;
}
</style>