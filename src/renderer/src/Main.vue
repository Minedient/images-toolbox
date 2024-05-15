<script setup lang="ts">
import { ref } from 'vue';
import Encode from './components/Encode.vue';
import Option from './components/Option.vue';
import Help from './components/Help.vue';
import Resize from './components/Resize.vue';
import { useRunTimeParameters } from './classes/objects';
const buttonList = ref('buttonList');
const workspaceType = ref('Encode');
const workspaces = {
    'Encode': Encode,
    'Option': Option,
    'Help': Help,
    'Resize': Resize
}
// Functions
const changePage = (page: string) => workspaceType.value = page;

// The code below is used to set a store that allow parameters 
// to be shared between components.
const runTimeParameters = useRunTimeParameters();

//@ts-ignore (It is defined in preload.ts)
window.api.recevieFromMain('configReturned', (data) => {
    runTimeParameters.quality = data.quality;
    runTimeParameters.method = data.method;
    runTimeParameters.zCompression = data.zCompression;
});
//@ts-ignore (It is defined in preload.ts)
window.api.sendToMain('getConfig', 'main');
</script>

<template>
    <div :class="buttonList">
        <button @click="changePage('Encode')">encode</button>
        <button @click="changePage('Resize')">resize</button>
        <!--button @click="changePage('Rotate')">rotate</button -->
        <button @click="changePage('Option')">option</button>
        <button @click="changePage('Help')">help</button>
    </div>

    <!-- This shit took me 6 hours to realize it-->
    <KeepAlive>
        <component :is="workspaces[workspaceType]" />
    </KeepAlive>
</template>

<style>
/* Class */
.buttonList {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 10px;
}
</style>
