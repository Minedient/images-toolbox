<!--Collapsable.vue Create component for a collapsable container
    Usage: <Collapsable>...</Collapsable>
    Props:
        title: String, the title of the collapsable component (required)
        type: String, the type of the title, default to 'h3'
        static: Boolean, if the collapsable component is static
                Static collapsable component will not change its height
                when the content is updated
        externalTrigger: Boolean, if the collapsable component is triggered by an external event

    When using externalTrigger, the parent component should create a reference to the component,
    and call the toggle function to toggle the collapsable component
    Example:
    <template>
        <Collapsable title="Resize" type="h2" static externalTrigger>
            <p>
                Resize images to a specific width and height.
            </p>
        </Collapsable>
    </template>
    <script setup>
        import { ref } from 'vue';
        const resizeCollapsable = ref(null);
        resizeCollapsable.value?.toggle();
    </script>
-->
<script setup lang="ts">
import { onUpdated, ref } from 'vue';
import { calcMaxHeight } from '../classes/func';

// Get a reference to the clickable component
const thisTag = ref(null as HTMLElement | null);

/**
 * Properties of the collapsable component
 * @param {String} title The title of the collapsable component
 * @param {Boolean} static If the collapsable component is static
 *                         Static collapsable component will not change its height
 *                         when the content is updated
 * @param {Boolean} externalTrigger If the collapsable component is triggered by an external event
 */
const props = defineProps({
    title: String,
    type: {
        type: String,
        default: 'h3'
    },
    static: {
        type: Boolean,
        default: false
    },
    externalTrigger: {
        type: Boolean,
        default: false
    }
});

// Expose the toggle function to the parent component
// Only works if the externalTrigger is set to true
defineExpose({ toggle })

function toggle() {
    if (!props.externalTrigger) return;
    thisTag.value?.click();
}

// Local states
const maxHeight = ref(0);
const type = ref(props.type);
const composedTitle = ref(props.title + ' ◄');
let toggled = false;

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
    if (props.static) return;
    const div = document.querySelector('.collapsable') as HTMLElement;
    if (div) {
        maxHeight.value = calcMaxHeight(toggled, div);
    }
});
</script>

<template>
    <component :is="type" class="n-h3 c-h3" :class="{ closed: !toggled }" @click="onToggle" ref="thisTag">{{ composedTitle
        }}</component>
    <div class="collapsable" :style="{ 'max-height': maxHeight + 'px' }">
        <slot />
    </div>
</template>

<style scoped>
.n-h3 {
    width: 100%;
    margin: 0px;
    padding-top: 5px;
    padding-bottom: 5px;
}
/* Ensure it does not have any padding when closed */
.closed {
    padding-top: 0px;
    padding-bottom: 0px;
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