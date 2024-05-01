<script setup lang="ts">
import { EncodingConstants as EC} from '../constants/number';
</script>

<template>
    <div class="container" id="option-panel">
        <p>Default Quality: {{ EC.defaultQuality }} </p>
        <p>Default Compression Method: {{ EC.defaultMethod }}</p>
        <p>Default Z-Compression: {{ EC.defaultZ }}</p>
    </div>
</template>

<style>
#option-panel {
    display:grid;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 10px;
}
</style>