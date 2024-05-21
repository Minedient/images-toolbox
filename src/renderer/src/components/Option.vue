<script setup lang="ts">
import { EncodingConstants as EC } from '../constants/number';
import { AppSettingConstants as ASC } from '../constants/setting';
import { useRunTimeParameters } from '../classes/objects';
import { ref } from 'vue';
import Foldable from './Foldable.vue';
import { showNotification, gridColSpan } from '../classes/func';

// THE parameters that shared between Components
const runTimeParameters = useRunTimeParameters();
const quality = ref(runTimeParameters.quality);
const method = ref(runTimeParameters.method);
const zCompression = ref(runTimeParameters.zCompression);
const outputFolder = ref(runTimeParameters.outputFolder);
const encode = ref(null as typeof Foldable | null);
const resize = ref(null as typeof Foldable | null);
const setting = ref(null as typeof Foldable | null);

const pageStates = ref({
    encode: true,
    resize: false,
    setting: false
});

/**
 * Load the configuration from the main process
 * 1. Sned a request to the main process to load the configuration
 * 2. The main process will send the configuration back
 * 3. The configuration will be saved to the runtime parameters
 * 4. The runtime parameters will be used to update the UI
 */
const loadConfig = () => {
    //@ts-ignore (It is defined in preload.ts)
    window.api.sendToMain('loadConfig');
}

/**
 * Save the configuration to the main process
 * 1. Save the configuration to the runtime parameters
 * 2. Send the configuration to the main process
 * 3. The main process will save the configuration to the file
 */
const saveConfig = () => {
    runTimeParameters.quality = quality.value;
    runTimeParameters.method = method.value;
    runTimeParameters.zCompression = zCompression.value;
    runTimeParameters.outputFolder = outputFolder.value;
    //@ts-ignore (It is defined in preload.ts)
    window.api.sendToMain('saveConfig', JSON.stringify({
        quality: runTimeParameters.quality,
        method: runTimeParameters.method,
        zCompression: runTimeParameters.zCompression,
        outputFolder: runTimeParameters.outputFolder
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

const changeResizeDefaultOutput = (type: string, event: Event) => {
    showNotification('Default output type changed to ' + type);
}

/**
 * Load constant values from the constants file
 * and do a save load cycle
 */
const resetToDefault = () => {
    quality.value = EC.defaultQuality;
    method.value = EC.defaultMethod;
    zCompression.value = EC.defaultZ;
    outputFolder.value = ASC.defaultOutputFolder;
    saveConfig();
    loadConfig();
    showNotification('Reset to default parameters!');
}
const changeState = (page: string) => {
    pageStates.value[page] = !pageStates.value[page];
    switch (page) {
        case 'encode':
            encode.value?.toggle();
            break;
        case 'resize':
            resize.value?.toggle();
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
            <button @click="switchPages('resize')">Resize</button>
            <button @click="switchPages('setting')">Setting</button>
        </div>
        <div class="container column-container">
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
            <Foldable external-only ref="resize">
                <div id="resize-option-panel">
                    <!--Style it later-->
                    <p>Output file type - Not working at this moment</p>
                    <input type="radio" name="outputType" value="auto" id="auto" checked>
                    <label for="auto">Auto</label>
                    <input type="radio" name="outputType" value="png" id="png">
                    <label for="png">PNG</label>
                    <input type="radio" name="outputType" value="jpg" id="jpg">
                    <label for="jpg">JPG</label>
                    <input type="radio" name="outputType" value="webp" id="webp">
                    <label for="webp">WEBP</label>
                </div>
            </Foldable>
            <Foldable external-only ref="setting">
                <div id="setting-option-panel">
                    <!-- Add contents -->
                    <h3 :style="gridColSpan(1,3)">App settings</h3>
                    <label for="outputFolder" class="tooltip" style="text-align: left;" :style="gridColSpan(1,1)">Output folder
                        <span class="tooltip-text">The folder where the output files will be saved</span>
                    </label>
                    <input type="text" id="outputFolder" placeholder="Output Folder" :value="outputFolder" :style="gridColSpan(1,1)">
                    <button @click="saveConfig(); showNotification('Setting Saved!');">Save</button>
                    <button @click="resetToDefault">Reset To Default</button>
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

#holder {
    display: grid;
    grid-template-columns: 1.2fr 10fr;
    margin-top: 10px;
    gap: 10px;
}

#encode-option-panel {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

#setting-option-panel {
    display:grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}
</style>