<script setup lang="ts">
import { ref } from 'vue';
import Encode from './components/Encode.vue';
import Option from './components/Option.vue';
import Help from './components/Help.vue';
const buttonList = ref('buttonList');
const workspaceType = ref('Encode');
const workspaces = {
    'Encode': Encode,
    'Option': Option,
    'Help': Help
}
// Functions
const changePage = (page: string) => workspaceType.value = page;

</script>

<template>
    <div :class="buttonList">
        <button @click="changePage('Encode')">encode</button>
        <button @click="changePage('Resize')">resize</button>
        <button @click="changePage('Rotate')">rotate</button>
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
