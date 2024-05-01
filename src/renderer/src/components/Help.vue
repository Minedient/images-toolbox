<script setup lang="ts">import Collapsable from './Collapsable.vue';</script>
<template>
    <div id="help" class="column-container">
        <h1>Image Toolbox Help</h1>
        <p>
            This is a simple image encoder/decoder. You can encode text into an image or decode text from an image.
            You can find the source code in <a href="https://github.com/Minedient/images-toolbox" target="_blank">this
                GitHub repository</a>.
        </p>
        <div class="container column-container">
            <Collapsable title="Encode" type="h2">
                <p>
                    Encode images into the WEBP format. You can let the program detect the parameters, or choose the
                    parameters by yourself.
                </p>
            </Collapsable>
            <Collapsable title="Option" type="h2">
                <p>
                    You can change the default quality, compression method, and Z-compression of the encoder. <-- this is not yet implemented
                </p>
            </Collapsable>
            <Collapsable title="resize" type="h2">
                <p>
                    Resize images to a specific width and height. <-- this is not yet implemented
                </p>
            </Collapsable>
        </div>
    </div>
</template>