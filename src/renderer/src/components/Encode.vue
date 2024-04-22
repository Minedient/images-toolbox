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
    hasDetailed.value = true;
    const imageObj = imagesObjs.find(obj => obj.fileURL === target.src);
    if (imageObj) {
        dImageObj.file = imageObj.file;
        dImageObj.fileURL = imageObj.fileURL;
    };
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
        <div id="button-list"><button class="small-button" @click="clearImagesPanel">Clear Selection</button></div>
        <hr class="fw-hr">

    </div>
    <div class="container" id="images-viewer">
        <img v-for="image in imagesObjs" :src="image.fileURL" @click="loadImageToDetailedViewer">
    </div>
    <div class="container vertical" id="detailed-viewer">
        <img v-if="hasDetailed" :src="dImageObj.fileURL">
        <hr v-if="hasDetailed" class="fw-hr">
        <p v-if="hasDetailed">Name: {{ dImageObj.file.name }}</p>
        <p v-if="hasDetailed">Type: {{ dImageObj.file.type }}</p>
        <p v-if="hasDetailed">Size: {{ ((dImageObj.file.size) / 1024.0).toFixed(3) }} kB</p>
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
</style>