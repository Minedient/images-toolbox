<script setup lang="ts">
import { onActivated, onMounted, reactive, ref } from 'vue';
import { ImageObj, useImagesData } from '../classes/objects';

const scale = ref(1);
const original = ref('');
const resized = ref('');
const imageObjs: ImageObj[] = reactive([]);
const selected = ref(null as ImageObj | null)
const ipl = ref(null as HTMLDivElement | null);

const mousePos = ref({ x: 0});
const dragPos = ref({ x: 0});

const imagesDataStore = useImagesData();

const setScale = (event: Event) => {
    scale.value = parseFloat((event.target as HTMLInputElement).value);
}
const resetScale = () => {
    (document.querySelector('#scaleBar') as HTMLInputElement).value = '1';
    scale.value = 1;
}

//Lifecycle hooks, update it "seamlessly"
onActivated(() => {
    imageObjs.splice(0, imageObjs.length, ...imagesDataStore.images);
});
// Allow to drag the image picker list
onMounted(() => {
    let down = false; 
    let initialX = 0;
    let initialLeft = 0;
    ipl.value?.addEventListener('mousedown', (event) => {
        down = true;
        initialX = event.clientX - ipl.value!.offsetLeft;
        initialLeft = ipl.value!.scrollLeft;
    });
    ipl.value?.addEventListener('mousemove', (event)=>{
        if(!down) return;
        const x = event.clientX - ipl.value!.offsetLeft;
        const move = x - initialX;
        ipl.value!.scrollLeft = initialLeft - move;
    });
    ipl.value?.addEventListener('mouseup', () => {
        down = false;
    });
    ipl.value?.addEventListener('mouseleave', () => {
        down = false;
    });
});
</script>
<template>
    <div class="container" id="resize-main">
        <div id="left-panel">
            <div class="grid-container" id="resizer">
                <h3>Scale : {{ scale }}</h3>
                <button class="small-button" id="resetButton" @click="resetScale">Reset</button>
                <input id="scaleBar" value="1" type="range" min="0.01" max="8" step="0.01" @input="setScale">
            </div>
            <hr class="fw-hr">
            <div class="cotainer column-container">
                <div id="image-picker-wrapper">
                    <img id="bigger-image" v-if="imageObjs.length !== 0" :src="original">
                    <div id="image-picker-list" ref="ipl">
                        <p v-if="imageObjs.length === 0">Select images in encode</p>
                        <div v-for="image in imageObjs" :key="image.fileURL">
                            <img class="no-drag" :src="image.fileURL" @dblclick="original = image.fileURL">
                        </div>
                    </div>
                </div>
                <hr class="fw-hr">
                <p>Click and drag to scroll</p>
                <p>Double click to choose image</p>
            </div>
        </div>
        <div id="middle-panel" class="container">
            <h3>Original image: {{ original}}</h3>
        </div>
        <div id="right-panel" class="container">
            <h3>Resized image: {{ }}</h3>
        </div>
    </div>
</template>
<style scoped>
#resize-main {
    margin-top: 10px;
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(200px, 1.33fr) 2fr 2fr;  /*limit the size of the first column is the key*/
}

#resizer {
    grid-template-columns: 2fr 1fr;
}

#scaleBar {
    grid-column: 1 / span 2;
}

#image-picker-wrapper {
    display: flex;
    align-items: center;
    flex-direction: column;
}

#bigger-image { /*Use max-width and max-height to limit the size of the image*/
    padding: 20px;
    max-width: 90%;
    max-height: 300px;
    background-color: rgba(255,255,255,0.1 );
}

#image-picker-list {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
}

#image-picker-list img {
    width: auto;
    height: 100px;
}

</style>