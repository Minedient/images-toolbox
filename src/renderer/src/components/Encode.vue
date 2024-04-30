<script setup lang="ts">
import { reactive, ref } from 'vue';
import Collapsable from './Collapsable.vue';

interface ImageObj {
    file: File,
    fileURL: string
}

const dragzone = ref('');
const imagesObjs: ImageObj[] = reactive([]);
const hasDetailed = ref(false);
const dImageObj = reactive(<ImageObj>{});
const selectedImages: ImageObj[] = reactive([]);

const isAuto = ref(true);
const isLossless = ref(true);
const zCompression = ref(6);
const quality = ref(80);
const method = ref(4);

const selectedBorder = reactive({
    margin: '2px',
    border: '4px solid var(--image-border-color)'
});


const filesDropped = async (event: DragEvent) => {
    event.preventDefault();
    dragzone.value = '';
    const files = (await readDroppedEntries(event.dataTransfer)).flat().filter(file => file.type.startsWith('image/'));
    files.forEach(file => {
        imagesObjs.push({ file: file, fileURL: URL.createObjectURL(file) })
    });
}

const filesSelected = async (event: Event) => {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    const files = target.files;
    (files ? [...files].filter(file => file.type.startsWith('image/')) : []).forEach(file => {
        imagesObjs.push({ file: file, fileURL: URL.createObjectURL(file) })
    });
    
    //Ensure the input is cleared so that the same files can be selected again and trigger the change event correctly
    target.value = '';
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
    // Revoke all object URLs and clear the imagesObjs array
    imagesObjs.forEach(obj => URL.revokeObjectURL(obj.fileURL));
    imagesObjs.splice(0, imagesObjs.length);

    //Set the detailed viewer to false
    hasDetailed.value = false;

    //Clear the selected images array
    selectedImages.splice(0, selectedImages.length);
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

const inputMethod = (event: Event) => {
    const input = event.target as HTMLInputElement;
    method.value = Number(input.value);
}

const addToselectedImages = (event: Event) => {
    const element = event.target as HTMLImageElement;
    const clickedImage = imagesObjs.find(obj => obj.fileURL === element.src);
    if (clickedImage) {
        if (selectedImages.includes(clickedImage)) {
            selectedImages.splice(selectedImages.indexOf(clickedImage), 1);
        } else selectedImages.push(clickedImage);
    }
}

const isImageSelected = (url: string) => {
    const image = imagesObjs.find(obj => obj.fileURL === url);
    return image !== undefined && selectedImages.includes(image);
}

const selectAll = () => {
    deselectAll();
    imagesObjs.forEach(obj => selectedImages.push(obj));
}

const deselectAll = () => {
    selectedImages.splice(0, selectedImages.length);
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
    <!--Create a temporary div here during encoding to show the progress bar, when fished. Show a 'Finished!' text and disappear with animation after 3 seconds-->
    <!--TODO-->

    <div class="container" id="workspace">
        <!--Tweaker and Infos-->
        <div class="container vertical" id="tweaker">
            <div class="borderless-container" id="dropzone" :class="dragzone">
                <input type="file" id="file-input" multiple webkitdirectory hidden @change="filesSelected">
                <label for="file-input" @dragover="dragover" @dragleave="dragleave" @drop="filesDropped">Drop files here
                    or
                    click on me</label>
            </div>
            <div id="button-list">
                <button class="small-button" @click="">Encode all</button>
                <button class="small-button" @click="">Encode selected</button>
                <button class="small-button" @click="clearImagesPanel">Clear All</button>
            </div>
            <div id="button-list">
                <button v-if="imagesObjs.length !== 0" class="small-button" @click="selectAll">Select all</button>
                <button v-if="imagesObjs.length !== 0" class="small-button" @click="deselectAll">Deselect all</button>
            </div>
            <hr class="fw-hr">
            <p class="short-p">Total number of images: {{ imagesObjs.length }}</p>
            <hr class="fw-hr">
            <div class="container vertical">
                <Collapsable title="Encoding parameters">
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
                            <div id="left-column" :hidden="!isLossless">
                                <p>Z-Compression</p>
                                <input id="z-compression" type="range" min="0" max="9" step="1" value="6"
                                    :disabled=isAuto @input="inputZCompression">
                                <label for="z-compression">{{ zCompression }}</label>
                            </div>
                            <div id="right-column" :hidden="isLossless">
                                <p>Quality</p>
                                <input id="quality" type="range" min="0" max="100" step="5" value="100" :disabled=isAuto
                                    @input="inputQuality">
                                <label for="quality">{{ quality }}</label>
                                <p>Method</p>
                                <input id="method " type="range" min="0" max="6" step="1" value="4" :disabled=isAuto
                                    @input="inputMethod">
                                <label for="method">{{ method }}</label>
                            </div>
                        </div>
                    </div>
                </Collapsable>
            </div>
            <hr class="fw-hr">
            <div v-if="imagesObjs.length !== 0" id="selected-images" class="container vertical">
                <h3 class="n-h3">Selected Images</h3>
                <p v-if="selectedImages.length == 0">No images selected</p>
                <p v-else>Selected images: {{ selectedImages.length }}</p>
                <p class="short-p">Press ctrl + mouse click to select images.</p>
                <p class="short-p">Ctrl + Click again to deselect it.</p>
            </div>
        </div>

        <!--Images Viewer-->
        <div class="container" id="images-viewer">
            <img v-for="image in imagesObjs" :src="image.fileURL" @click.ctrl="addToselectedImages"
                @click.exact="loadImageToDetailedViewer" :style="isImageSelected(image.fileURL) ? selectedBorder : ''">
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
            <div v-else-if="imagesObjs.length !==0" style="text-align: center;">
                <p>No image selected</p>
                <p>Click on an image to select it</p>
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

.n-h3 {
    width: 100%;
    margin: 0px;
    padding-top: 5px;
    padding-bottom: 5px;
}

.short-p {
    margin: 5px 0 5px 0;
}

/* ID */
#workspace {
    display: grid;
    grid-template-columns: 1fr 1.8fr 1.2fr;
    grid-column-gap: 10px;
    margin-top: 10px;
    width: auto;
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

#left-right-panel div {
    flex-grow: 1;
}
</style>