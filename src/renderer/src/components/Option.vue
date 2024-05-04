<script setup lang="ts">
import { EncodingConstants as EC } from '../constants/number';
import { useRunTimeParameters } from '../classes/objects';

const runTimeParameters = useRunTimeParameters();

//@ts-ignore (It is defined in preload.ts)
window.api.recevieFromMain('configReturned', (data) => {
    runTimeParameters.quality = data.quality;
    runTimeParameters.method = data.method;
    runTimeParameters.zCompression = data.zCompression;
});

const loadConfig = () => {
    //@ts-ignore (It is defined in preload.ts)
    window.api.sendToMain('getConfig');
}

const saveConfig = () => {
    //@ts-ignore (It is defined in preload.ts)
    window.api.sendToMain('saveConfig', JSON.stringify({
        quality: runTimeParameters.quality,
        method: runTimeParameters.method,
        zCompression: runTimeParameters.zCompression
    }));
}

const qualityBarChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    runTimeParameters.quality = parseInt(target.value);
}

const methodBarChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    runTimeParameters.method = parseInt(target.value);
}

const zBarChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    runTimeParameters.zCompression = parseInt(target.value);
}

/**
 * Load from EC and do a save/load cycle 
 */
const resetToDefault = () => {
    runTimeParameters.quality = EC.defaultQuality;
    runTimeParameters.method = EC.defaultMethod;
    runTimeParameters.zCompression = EC.defaultZ;
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
</script>

<template>
    <div class="container" id="holder">
        <div class="container column-container" style="gap:10px">
            <button>Encoding</button>
            <button>Setting</button>
        </div>
        <div class="container" id="option-panel">
            <p>Quality: {{ runTimeParameters.quality }}</p>
            <p>Current Compression Method: {{ runTimeParameters.method }}</p>
            <p>Current Z-Compression: {{ runTimeParameters.zCompression }}</p>
            <input @input="qualityBarChange" id="qualityBar" type="range" min="0" max="100" step="5" :value="runTimeParameters.quality">
            <input @input="methodBarChange" id="methodBar" type="range" min="0" max="6" step="1" :value="runTimeParameters.method">
            <input @input="zBarChange" id="zBar" type="range" min="0" max="9" step="1" :value="runTimeParameters.zCompression">
            <button @click="saveConfig(); showNotification('Setting Saved!');">Save</button>
            <button @click="resetToDefault">Reset To Default</button>
        </div>
    </div>
</template>

<style>
@keyframes fade{
    0%, 100%{opacity:0;}
    33%, 67%{opacity:1;}

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

#option-panel {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
}
</style>