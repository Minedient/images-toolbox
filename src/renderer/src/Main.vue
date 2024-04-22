<script setup lang="ts">
import { ref } from 'vue';
import Encode from './components/Encode.vue';
import Option from './components/Option.vue';
const buttonList = ref('buttonList');
const workspaceType = ref('Encode');
const workspaces = {
    'Encode': Encode,
    'Option': Option
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
        <button @click="changePage('About')">about</button>
        <button @click="changePage('Help')">help</button>
    </div>
    <div class="container" id="workspace">
        <!-- This shit took me 6 hours to realize it-->
        <KeepAlive>
            <component :is="workspaces[workspaceType]" />
        </KeepAlive>
    </div>
</template>

<style>
/* Class */
.buttonList {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 10px;
}

/* ID */
#workspace {
    display: grid;
    grid-template-columns: 1fr 1.8fr 1.2fr;
    grid-column-gap: 10px;
    margin-top: 10px;
    width: auto;
}
</style>
