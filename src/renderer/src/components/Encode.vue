<script setup lang="ts">
import { ref } from 'vue';
const dragzone = ref('');
const images = ref(<File[]>[]);
const imagesURL = ref(<string[]>[]);
const hasDetailed = ref(false);
const detailed= ref(<string>'');

//TODO: Use an object to store the image details and update them reactively

const filesDropped = async (event: DragEvent) => {
    event.preventDefault();
    dragzone.value = '';
    const files = (await readDroppedEntries(event.dataTransfer)).flat().filter(file => file.type.startsWith('image/'));
    images.value = files;
    console.log(files);
}

const filesSelected = async (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    images.value = files ? [...files].filter(file => file.type.startsWith('image/')) : [];
    console.log(files);
}

const dragleave = (event: DragEvent) => {
    event.preventDefault();
    dragzone.value = '';
}

const dragover = (event: DragEvent) => {
    event.preventDefault();
    dragzone.value = 'dragenter';
}

const getURL = (file: File) => {
    const str = URL.createObjectURL(file);
    imagesURL.value.push(str);
    return str;
};
const clearURL = (file: string) => {
    URL.revokeObjectURL(file);}

const clearImagesPanel = () => {
    images.value = [];
    imagesURL.value.forEach(s=>clearURL(s));
    imagesURL.value = [];
}

const loadImageToDetailedViewer = (event: MouseEvent) => {
    const target = event.target as HTMLImageElement;
    hasDetailed.value = true;
    detailed.value = target.src;
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
        <img v-for="image in images" :src="getURL(image)" @click="loadImageToDetailedViewer">
    </div>
    <div class="container vertical" id="detailed-viewer">
        <img v-if="hasDetailed" :src="detailed">
        <hr v-if="hasDetailed" class="fw-hr">
        <p v-if="hasDetailed">Name: </p>
        <p v-if="hasDetailed">Type: </p>
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

#detailed-viewer img{
    width: 100%;
    height: auto;
    border-radius: 5px;
    border: 1px solid black;
    margin: 5px;
    transition: transform 0.2s ease;
}
</style>