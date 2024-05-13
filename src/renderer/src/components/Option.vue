<script setup lang="ts">
import { EncodingConstants as EC } from '../constants/number';
import { useRunTimeParameters } from '../classes/objects';
import { ref } from 'vue';
import Foldable from './Foldable.vue';

// THE parameters that shared between Components
const runTimeParameters = useRunTimeParameters();
const quality = ref(runTimeParameters.quality);
const method = ref(runTimeParameters.method);
const zCompression = ref(runTimeParameters.zCompression);
const encode = ref(null as typeof Foldable | null);
const setting = ref(null as typeof Foldable | null);

const pageStates = ref({
    encode: true,
    setting: false
});

const loadConfig = () => {
    //@ts-ignore (It is defined in preload.ts)
    window.api.sendToMain('loadConfig');
}

const saveConfig = () => {
    runTimeParameters.quality = quality.value;
    runTimeParameters.method = method.value;
    runTimeParameters.zCompression = zCompression.value;
    //@ts-ignore (It is defined in preload.ts)
    window.api.sendToMain('saveConfig', JSON.stringify({
        quality: runTimeParameters.quality,
        method: runTimeParameters.method,
        zCompression: runTimeParameters.zCompression
    }));
}

const qualityBarChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    quality.value = parseInt(target.value);
}

const methodBarChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    method.value = parseInt(target.value);
}

const zBarChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    zCompression.value = parseInt(target.value);
}

/**
 * Load from EC and do a save/load cycle 
 */
const resetToDefault = () => {
    quality.value = EC.defaultQuality;
    method.value = EC.defaultMethod;
    zCompression.value = EC.defaultZ;
    saveConfig();
    loadConfig();
    showNotification('Reset to default parameters!');
}
const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.classList.add('notification');

    document.body.appendChild(notification);

    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}
const changeState = (page: string) => {
    pageStates.value[page] = !pageStates.value[page];
    switch (page) {
        case 'encode':
            encode.value?.toggle();
            break;
        case 'setting':
            setting.value?.toggle();
            break;
        default:
            break;
    }
}
const switchPages = (page: string) => {
    //if the page is already shown, do nothing
    if (pageStates.value[page]) return;

    // Find the current page and hide it
    const currentPage = Object.keys(pageStates.value).find(key => pageStates.value[key]) || '';
    changeState(currentPage);
    changeState(page);
}
</script>
<template>
    <div class="container" id="holder">
        <div class="container column-container" style="gap:10px">
            <button @click="switchPages('encode')">Encoding</button>
            <button @click="switchPages('setting')">Setting</button>
        </div>
        <div class="container" style="flex-direction: column;">
            <Foldable init external-only ref="encode">
                <div id="encode-option-panel">
                    <p>Quality: {{ quality }}</p>
                    <p>Current Compression Method: {{ method }}</p>
                    <p>Current Z-Compression: {{ zCompression }}</p>
                    <input @input="qualityBarChange" id="qualityBar" type="range" min="0" max="100" step="5"
                        :value="quality">
                    <input @input="methodBarChange" id="methodBar" type="range" min="0" max="6" step="1"
                        :value="method">
                    <input @input="zBarChange" id="zBar" type="range" min="0" max="9" step="1" :value="zCompression">
                    <button @click="saveConfig(); showNotification('Setting Saved!');">Save</button>
                    <button @click="resetToDefault">Reset To Default</button>
                </div>
            </Foldable>
            <Foldable external-only ref="setting">
                <div id="setting-option-panel">
                    <!-- Add contents -->
                </div>
            </Foldable>
        </div>
    </div>
</template>

<style>
@keyframes fade {

    0%,
    100% {
        opacity: 0;
    }

    33%,
    67% {
        opacity: 1;
    }

}

.notification {
    position: fixed;
    width: 280px;
    padding: 10px;
    bottom: 0;
    left: calc(50% - 150px);
    text-align: center;
    background-color: #333;
    color: white;
    z-index: 1000;
    font-size: 1.5em;
    animation: fade 3s;
}

#holder {
    display: grid;
    grid-template-columns: 1fr 10fr;
    margin-top: 10px;
    gap: 10px;
}

#encode-option-panel {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
}
</style>