<script setup lang="ts">
import { onActivated, onMounted, reactive, ref } from 'vue';
import { ImageObj, useImagesData } from '../classes/objects';
import { showNotification, gridColSpan, gridAreaSpan } from '../classes/func';
import Foldable from './Foldable.vue';

// Runtime variables
const keepRatio = ref(true);
const scale = ref(1);
const original = reactive({ width: 0, height: 0 } as ImageObj);
const resized = reactive({ width: 0, height: 0 } as ImageObj);
const targetWidth = ref(0);
const targetHeight = ref(0);
const presets = ref([0.25, 0.5, 2, 3, 4]);
// Objects
const imageObjs: ImageObj[] = reactive([]);
const ipl = ref(null as HTMLDivElement | null);

const imagesDataStore = useImagesData();

function selectImage(image: ImageObj) {
    original.fileURL = image.fileURL;
    if (image.width && image.height) {
        original.width = image.width;
        original.height = image.height;
    } else {
        const img = new Image();
        img.src = image.fileURL;
        original.width = img.width;
        original.height = img.height;

        // Update the image object, so next time it will be faster
        image.width = img.width;
        image.height = img.height;
    }
    targetWidth.value = original.width;
    targetHeight.value = original.height;
}

const settingChange = (type: string, event: Event) => {
    const target = event.target as HTMLInputElement;
    switch (type) {
        case 'scale':
            scale.value = parseFloat(target.value);
            targetWidth.value = original.width * scale.value;
            targetHeight.value = original.height * scale.value;
            break;
        case 'width':
            if (keepRatio.value) {
                scale.value = parseFloat(target.value) / original.width;
                targetHeight.value = original.height * scale.value;
                targetWidth.value = parseFloat(target.value);
            } else {
                targetWidth.value = parseFloat(target.value);
            }
            break;
        case 'height':
            if (keepRatio.value) {
                scale.value = parseFloat(target.value) / original.height;
                targetWidth.value = original.width * scale.value;
                targetHeight.value = parseFloat(target.value);
            } else {
                targetHeight.value = parseFloat(target.value);
            }
            break;
        case 'reset':
            scale.value = 1;
            targetWidth.value = original.width;
            targetHeight.value = original.height;
            break;
    }
}

const directResize = (dScale: number) => {
    const element = document.getElementById('scaleInput') as HTMLInputElement;
    const event = new Event('input');
    element.value = dScale.toString();
    element.dispatchEvent(event);
    resize();
}

const resize = () => {
    /*  PLaceholder for the future
    */
    const img = new Image();
    img.src = original.fileURL;
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth.value;   //target width is used directly to set the width of the canvas, same for the height
    canvas.height = targetHeight.value;
    // Draw the image
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Set details of the resized image
    resized.fileURL = canvas.toDataURL();
    resized.width = canvas.width;
    resized.height = canvas.height;
    //resized.file = new File([canvas.toDataURL()], 'resized.png');
    showNotification('Image Resized!');
}

const updateKeepRatio = (event: Event) => {
    keepRatio.value = (event.target as HTMLInputElement).checked;
}

//Lifecycle hooks, update it "seamlessly"
onActivated(() => {
    imageObjs.splice(0, imageObjs.length, ...imagesDataStore.images);
    original.fileURL = (original.fileURL === '') ? imageObjs[0]?.fileURL ?? '' : original.fileURL;
});
onMounted(() => {
    // Drag related
    let down = false;
    let initialX = 0;
    let initialLeft = 0;
    ipl.value?.addEventListener('mousedown', (event) => {
        down = true;
        initialX = event.clientX - ipl.value!.offsetLeft;
        initialLeft = ipl.value!.scrollLeft;
    });
    ipl.value?.addEventListener('mousemove', (event) => {
        if (!down) return;
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
    // Wheel related
    ipl.value?.addEventListener('wheel', (event) => {
        ipl.value!.scrollLeft += event.deltaY * 0.3;
    });
});
</script>
<template>
    <div class="container" id="resize-main">
        <div id="left-panel">
            <h3 style="text-align: center;">Pick an image!</h3>
            <hr class="fw-hr">
            <div class="cotainer column-container">
                <div id="image-picker-wrapper">
                    <div id="image-picker-list" ref="ipl">
                        <p v-if="imageObjs.length === 0">Select images in encode</p>
                        <div v-for="image in imageObjs" :key="image.fileURL">
                            <img class="no-drag" :src="image.fileURL" @dblclick="selectImage(image)">
                        </div>
                    </div>
                </div>
            </div>
            <hr class="fw-hr">
            <p>Click and drag to scroll</p>
            <p>Double click to choose image</p>
            <hr class="fw-hr">
            <p>Resize presets</p>
            <div id="resizePresetList">
                <button class="small-button" @click="directResize(0.25);">0.25x</button>
                <button class="small-button" @click="directResize(0.5);">0.5x</button>
                <button class="small-button" @click="directResize(2);">2x</button>
                <button class="small-button" @click="directResize(3);">3x</button>
                <button class="small-button" @click="directResize(4);">4x</button>
            </div>
            <hr class="fw-hr">
            <Foldable init externalOnly>
                <div class="grid-container" id="resizer">
                    <h3 class="n-h3" :style="gridColSpan(1, 4)" style="text-align: center;">Resize control</h3>
                    <label :style="gridColSpan(1, 3)">Keep Aspect Ratio?</label>
                    <input type="checkbox" id="keepRatio" checked @input="updateKeepRatio">
                    <label v-if="keepRatio" for="scaleInput" class="tooltip" :style="gridAreaSpan(3, 1, 2, 2)">Scale:
                        <span class="tooltip-text">It
                            set the scale of resizing</span></label>
                    <input v-if="keepRatio" id="scaleInput" type="number" :value="scale" min="0.01" max="8" step="0.01"
                        placeholder="0.01-8" @input="settingChange('scale', $event)">
                    <button v-if="keepRatio" class="small-button" id="resetButton"
                        @click="settingChange('reset', $event)">Reset</button>
                    <input v-if="keepRatio" id="scaleBar" :value="scale" type="range" min="0.01" max="8" step="0.01"
                        @input="settingChange('scale', $event)" :style="gridColSpan(3, 2)">
                    <!--div belows exists even if not keep ratio-->
                    <label for="newWidth" :style="gridColSpan(1, 2)">
                        New Width:
                    </label>
                    <input type="number" id="newWidth" :style="gridColSpan(3, 2)" :value="targetWidth"
                        @change="settingChange('width', $event)">
                    <label for="targetHeight
                " :style="gridColSpan(1, 2)">
                        New Height:
                    </label>
                    <input type="number" id="targetHeight
                " :style="gridColSpan(3, 2)" :value="targetHeight
                    " @change="settingChange('height', $event)">
                </div>
            </Foldable>

            <button @click="resize">Resize!</button>
        </div>
        <div id="middle-panel" class="container column-container">
            <h3>Original image: {{ original.width }}x{{ original.height }}</h3>
            <div class="image-wrapper">
                <img :src="original.fileURL" alt="Original Image">
            </div>
        </div>
        <div id="right-panel" class="container column-container">
            <h3>Resized image: {{ resized.width }}x{{ resized.height }}</h3>
            <div class="image-wrapper">
                <img :src="resized.fileURL" alt="Resized Image">
            </div>

        </div>
    </div>
</template>
<style scoped>
#resize-main {
    margin-top: 10px;
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(133px, 1.33fr) minmax(200px, 2fr) minmax(200px, 2fr);
    /*limit the size of the first column is the key*/
}

#resizePresetList {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
}

#resizer {
    grid-template-columns: 1fr 1fr 1fr 1fr;
}

#resizer label {
    text-align: center;
    padding: 5px;
}

#scaleBar {
    grid-column: 2 / span 2;
}

#image-picker-wrapper {
    display: flex;
    align-items: center;
    flex-direction: column;
}

#bigger-image {
    /*Use max-width and max-height to limit the size of the image*/
    padding: 20px;
    max-width: 90%;
    max-height: 300px;
    background-color: rgba(255, 255, 255, 0.1);
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

/* Fixed to the size of its parent with square aspect ratio, center it contents, unpollated area is filled */
.image-wrapper {
    display: flex;
    max-width: 100%;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    background-color: rgba(255, 255, 255, 0.1);
}

/*Try it best to fit either width or height*/
.image-wrapper img {
    max-width: 100%;
    max-height: 100%;
}
</style>