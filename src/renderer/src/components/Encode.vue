<script setup lang="ts">
import { reactive, ref } from 'vue';
import Collapsable from './Collapsable.vue';
import { EncodeParameters, ImageObj, useRunTimeParameters, useImagesData } from '../classes/objects';
import { showNotification } from '../classes/func';

// Use pinia to keep check on the runtime parameters
useRunTimeParameters().$subscribe((_mutation, state) => {
    zCompression.value = state.zCompression;
    quality.value = state.quality;
    method.value = state.method;
});

// Use pinia to keep check on the images data
const imagesDataStore = useImagesData();

const dragzone = ref('');
const imageObjs: ImageObj[] = reactive([]);
const hasDetailed = ref(false);
const dImageObj = reactive(<ImageObj>{});
const selectedImages: ImageObj[] = reactive([]);

// Encoding States
const currentlyEncoding = ref(false);
const encodingProgress = ref(0);
const encodeFinished = ref(false);

// Runtime variables
const isAuto = ref(true);
const isLossless = ref(true);
const zCompression = ref(0);
const quality = ref(0);
const method = ref(0);
const selectedBorder = reactive({
    margin: '2px',
    border: '4px solid var(--image-border-color)'
});

//TODO: Fix - Only the first 100 images is loaded if a directory is dropped
const filesDropped = async (event: DragEvent) => {
    event.preventDefault();
    dragzone.value = '';
    console.log(await readDroppedEntries(event.dataTransfer));
    /*
    const files = (await readDroppedEntries(event.dataTransfer)).flat().filter(file => file.type.startsWith('image/'));
    files.forEach(file => {
        const img = new Image(); img.src = URL.createObjectURL(file);
        img.onload = () => imageObjs.push({ file: file, fileURL: URL.createObjectURL(file), width: img.width, height: img.height });
        // Sync changes to pinia store
        imagesDataStore.images = imageObjs;
    });
    */
}

const filesSelected = async (event: Event) => {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    const files = target.files;
    (files ? [...files].filter(file => file.type.startsWith('image/')) : []).forEach(file => {
        const img = new Image(); img.src = URL.createObjectURL(file);
        img.onload = () => imageObjs.push({ file: file, fileURL: URL.createObjectURL(file), width: img.width, height: img.height });
        // Sync changes to pinia store
        imagesDataStore.images = imageObjs;
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
    // Revoke all object URLs and clear the imageObjs array
    imageObjs.forEach(obj => URL.revokeObjectURL(obj.fileURL));
    imageObjs.splice(0, imageObjs.length);

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
    const imageObj = imageObjs.find(obj => obj.fileURL === target.src);
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
    const clickedImage = imageObjs.find(obj => obj.fileURL === element.src);
    if (clickedImage) {
        if (selectedImages.includes(clickedImage)) {
            selectedImages.splice(selectedImages.indexOf(clickedImage), 1);
        } else selectedImages.push(clickedImage);
    }
}

const isImageSelected = (url: string) => {
    const image = imageObjs.find(obj => obj.fileURL === url);
    return image !== undefined && selectedImages.includes(image);
}

const selectAll = () => {
    deselectAll();
    imageObjs.forEach(obj => selectedImages.push(obj));
}

const deselectAll = () => {
    selectedImages.splice(0, selectedImages.length);
}

//@ts-ignore (Depreceated and will be removed in the future)
const sendToResize = (mode: string) => {
    (mode === 'all')? imagesDataStore.images = imageObjs : imagesDataStore.images = selectedImages;
    showNotification('Images sent to resize page!');
}

/**
 * Use cwebp to convert the images to webp format
 * By default, the images is saved in the program directory under the 'output' folder
 * TODO: Allow user to choose the output directory and default behavior
 * 
 * @param arr 
 */
const convertToWebp = (arr: ImageObj[]) => {
    currentlyEncoding.value = true;

    // Extract the list of infos from the array of ImageObj
    const infos = arr.map(obj => ({ path: obj.file.path, name: obj.file.name }));

    // Call the function to convert the images to webp
    infos.forEach(info => {
        const name = info.name.split('.').slice(0, -1).join('.');
        const outputPath = './output/' + name + '.webp';
        const parmas = new EncodeParameters(isAuto.value, isLossless.value, zCompression.value, quality.value, method.value);

        //@ts-ignore (It is defined in preload.ts)
        // Convert the image to webp and update the progress bar
        window.api.convertToWebp(info.path, outputPath, parmas).then(() => {
            encodingProgress.value++;

            // If all images are encoded, show a 'Finished!' text and disappear with animation after 3 seconds
            if (encodingProgress.value === infos.length) {
                encodeFinished.value = true;    // Show the 'Finished!' text
                setTimeout(() => {
                    encodeFinished.value = false;
                    currentlyEncoding.value = false;
                    encodingProgress.value = 0;
                }, 3000);
            }
        });
    });
}

const openFolder = () => {
    //@ts-ignore (It is defined in preload.ts)
    window.api.sendToMain('openOutputFolder');
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
            let dirEntries;
            do {
                dirEntries = await new Promise<any[]>((resolve) => dirReader.readEntries(resolve));
                for (let dirEntry of dirEntries) {
                    await traverse(dirEntry, files);
                }
            } while (dirEntries.length);
            /*
            await new Promise<void>((resolve) => {
                dirReader.readEntries(async dirEntries => {
                    for (let dirEntry of dirEntries) {
                        await traverse(dirEntry, files);
                    }
                    resolve();
                });
            });
            */
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
    <div id="encode-related">
        <p v-if="currentlyEncoding && !encodeFinished">Encoding...{{ encodingProgress }}/{{ selectedImages.length }}</p>
        <p v-else-if="encodeFinished">Finished!</p>
        <progress v-if:="currentlyEncoding" id="encoding-progress" :value="encodingProgress"
            :max="selectedImages.length"></progress>
    </div>

    <div class="container" id="workspace">
        <!--Tweaker and Infos-->
        <div>
            <div class="container vertical sticky-10" id="tweaker">
                <div class="borderless-container" id="dropzone" :class="dragzone">
                    <input type="file" id="file-input" multiple webkitdirectory hidden @change="filesSelected">
                    <label for="file-input" @dragover="dragover" @dragleave="dragleave" @drop="filesDropped">Drop files
                        here
                        or
                        click on me</label>
                </div>
                <div id="button-list">
                    <button class="small-button" @click="openFolder">Open folder</button>
                    <button class="small-button" @click="convertToWebp(selectedImages)">Encode selected</button>
                    <button class="small-button" @click="clearImagesPanel">Clear All</button>
                </div>
                <div id="button-list">
                    <button v-if="imageObjs.length !== 0" class="small-button" @click="selectAll">Select all</button>
                    <button v-if="imageObjs.length !== 0" class="small-button" @click="deselectAll">Deselect
                        all</button>
                </div>
                <hr class="fw-hr">
                <p class="short-p">Total number of images: {{ imageObjs.length }}</p>
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
                                    <!--TODO rewrite the value to reflect default value set by config.json-->
                                    <input id="z-compression" type="range" min="0" max="9" step="1"
                                        :value="zCompression" :disabled=isAuto @input="inputZCompression">
                                    <label for="z-compression">{{ zCompression }}</label>
                                </div>
                                <div id="right-column" :hidden="isLossless">
                                    <p>Quality</p>
                                    <input id="quality" type="range" min="0" max="100" step="5" :value="quality"
                                        :disabled=isAuto @input="inputQuality">
                                    <label for="quality">{{ quality }}</label>
                                    <p>Method</p>
                                    <input id="method " type="range" min="0" max="6" step="1" :value="method"
                                        :disabled=isAuto @input="inputMethod">
                                    <label for="method">{{ method }}</label>
                                </div>
                            </div>
                        </div>
                    </Collapsable>
                </div>
                <hr v-if="imageObjs.length !== 0" class="fw-hr">
                <div v-if="imageObjs.length !== 0" id="selected-images" class="container vertical">
                    <h3 v-if="selectedImages.length == 0">No images selected</h3>
                    <h3 v-else>Selected images: {{ selectedImages.length }}</h3>
                    <p class="short-p">Press ctrl + mouse click to select images.</p>
                    <p class="short-p">Ctrl + Click again to deselect it.</p>
                </div>
            </div>
        </div>

        <!--Images Viewer-->
        <div class="container" id="images-viewer">
            <img v-for="image in imageObjs" :src="image.fileURL" @click.ctrl="addToselectedImages"
                @click.exact="loadImageToDetailedViewer" :style="isImageSelected(image.fileURL) ? selectedBorder : ''">
        </div>

        <!--Detailed Viewer-->
        <div class="container vertical" id="detailed-viewer">
            <div v-if="hasDetailed" class="sticky-10">
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
            <div v-else-if="imageObjs.length !== 0" style="text-align: center;" class="sticky-10">
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

.short-p {
    margin: 5px 0 5px 0;
}

/* Useful*/
.sticky-10 {
    position: sticky;
    top: 10px;
}

/* ID */
#encode-related {
    display: grid;
    grid-template-columns: 150px 1fr;
}

#encode-related p {
    margin-top: 10px;
    margin-bottom: 0px
}

#encoding-progress {
    width: 100%;
    height: 20px;
    margin-top: 10px;
}

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