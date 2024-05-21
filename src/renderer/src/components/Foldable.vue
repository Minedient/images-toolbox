<!--Foldable.vue Create a foldable component containerr
    Usage: <Foldable>...</Foldable>
    Props:
        static: Boolean, if the foldable component is static
                Static foldable component will not change its height
                when the content is updated
        external: Boolean, if the foldable component can be triggered by an external event
        externalOnly: Boolean, if the foldable component can only be triggered by an external event
                The diffrent between external and externalOnly is that externalOnly will not toggle 
                the component when clicked by user
        init: Boolean, set the initial state of the foldable component to be unfolded
    When using external, the parent component should create a reference to the component,
    and call the toggle function to toggle the collapsable component
    Example:
    <template>
        <Foldable static external>
            <p>
                Resize images to a specific width and height.
            </p>
        </Foldable>
    </template>
    <script setup>
        import { ref } from 'vue';
        const foldable = ref(null);
        foldable.value?.toggle();
    </script>

    Different between Foldable and Collapsable:
    - In Foldable, the whole content can be clicked to toggle the component, there is no
        clickable title or bar.
    - In Collapsable, the title is clickable to toggle the component. So it always occupy
        a certain height in the document.
-->
<script setup lang="ts">
import { onMounted, onUpdated, ref } from 'vue';
import { calcMaxHeight } from '../classes/func';

let toggled = false;

// Constants
const maxHeight = ref(0)
const thisTag = ref(null as HTMLElement | null)
const props = defineProps({
    static: {
        type: Boolean,
        default: false
    },
    external: {
        type: Boolean,
        default: false
    },
    externalOnly: {
        type: Boolean,
        default: false
    },
    init: {
        type: Boolean,
        default: false
    }

})
// Functions
const valueChange = (div: HTMLElement) => {
    toggled = !toggled
    maxHeight.value = calcMaxHeight(toggled, div);
}
const getState = () => {
    return toggled;
}
const toggle = () => {
    if (!props.external && !props.externalOnly) return;
    valueChange(thisTag.value as HTMLElement);
}
const onToggle = (event: MouseEvent) => {
    if (props.externalOnly) return;
    valueChange(event.target as HTMLElement);
}
/**
 * Vue lifecycle hooks
 */
onUpdated(() => {
    if (props.static) return
    const div = thisTag.value;
    if (div) maxHeight.value = calcMaxHeight(toggled, div)
});

onMounted(() => {
    if (props.init) valueChange(thisTag.value as HTMLElement)
});

defineExpose({ toggle, getState })
</script>
<template>
    <div class="collapsable n" :class="{ c: !externalOnly, closed: !toggled }" ref="thisTag" @click="onToggle"
        :style="{ 'max-height': maxHeight + 'px' }">
        <slot />
    </div>
</template>
<style scoped>
.n {
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

.c {
    cursor: pointer;
}

.collapsable {
    transition: max-height 0.5s ease;
    overflow: hidden;
    text-align: left;
}
</style>