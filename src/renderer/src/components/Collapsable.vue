<script setup lang="ts">
import { onUpdated, ref } from 'vue';

const props = defineProps({
    title: String,
    type: {
        type: String,
        default: 'h3'
    }
});

// Local states
const maxHeight = ref(0);
const type = ref(props.type);
const composedTitle = ref(props.title + ' ◄');
let toggled = false;

const calcMaxHeight = (state: boolean, div: HTMLElement) => state ? div.scrollHeight : 0;

const onToggle = (event: MouseEvent) => {
    const div = (event.target as HTMLElement).nextElementSibling as HTMLElement;

    toggled = !toggled;

    maxHeight.value = calcMaxHeight(toggled, div);
    composedTitle.value = toggled ? props.title + ' ▼' : props.title + ' ◄';
};

/**
 * Update the max height of the collapsable div when the div is updated
 * Useful for div that changes it content dynamically
 */
onUpdated(() => {
    const div = document.querySelector('.collapsable') as HTMLElement;
    if (div) {
        maxHeight.value = calcMaxHeight(toggled, div);
    }
});
</script>

<template>
    <div>
        <component :is="type" class="n-h3 c-h3" @click="onToggle">{{ composedTitle }}</component>
        <div class="collapsable" :style="{ 'max-height': maxHeight + 'px' }">
            <slot/>
        </div>
    </div>
</template>

<style scoped>
.n-h3 {
    width: 100%;
    margin: 0px;
    padding-top: 5px;
    padding-bottom: 5px;
}

.c-h3 {
    cursor: pointer;
}

.collapsable {
    transition: max-height 0.5s ease;
    overflow: hidden;
    text-align: left;
}
</style>