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
            <Collapsable title="Encode" type="h2" static>
                <p>
                    Encode images into the WEBP format. You can let the program detect the parameters, or choose the
                    parameters by yourself.

                    <h3>Basic work flow:</h3>
                    <ul>
                        <li>Choose the image(s) you want to encode by either</li>
                            <ul>
                                <li>Drag and drop the folders contain the images</li>
                                <li>Click on the "Click on me" area to choose the folder</li>
                            </ul>
                        <li>Select the images you want to encode. Tips: You can click on the image to view more details</li>
                        <li>Choose the encoding parameters</li>
                            <ul>
                                <li>Auto: The program will automatically choose <strong>Lossless</strong> or <strong>Lossy</strong> algorithm <br> However, the encoding parameter is determined in the setting of the app. <br> You may want to change the default behaviour if it suit your need.</li>
                                <li>Manual: You can change the parameters on the fly. Notice that this <strong>WILL NOT</strong> change the default behaviour set in option</li>
                            </ul>
                        <li>Click the "Encode selected" button</li>
                        <li>Wait for the encoding process to finish</li>
                    </ul>
                    You can use the "Clear" button to clear the selected images and start a new batch.
                </p>
            </Collapsable>
            <Collapsable title="Option" type="h2" static>
                <p>
                    You can change the default quality, compression method, and Z-compression of the encoder.
                    <h3>Quality</h3>
                    <ul>
                        <li>It specify the compression factor for RGB channel</li>
                        <li>Valid value are 0-100, default is set to 80</li>
                        <li>Smaller value produce smaller files, but larger value produce image with better quality</li>
                    </ul>
                    <h3>Compression Method</h3>
                    <ul>
                        <li>It specify the compression method for the encoder</li>
                        <li>Valid value are 0-6, default is set to 4</li>
                        <li>Smaller value produce smaller files, but larger value produce image with better quality</li>
                    </ul>
                    <h3>Z-Compression</h3>
                    <ul>
                        <li>It is a lossless encoing parameter</li>
                        <li>Valid value are 0-9, default is set to 6</li>
                        <li>Smaller value produce smaller files, but larger value produce image with better quality</li>
                    </ul>
                    After changing the default parameter, save the setting by clicking the "Save" button.
                    The default value can be reset by clicking the "Reset to default" button.
                    For more information, please refer to the <a href="https://developers.google.com/speed/webp/docs/cwebp" target="_blank">Google WebP documentation</a>.
                </p>
            </Collapsable>
            <Collapsable title="resize" type="h2" static>
                <p>
                    Resize images to a specific width and height. <-- this is not yet implemented
                </p>
            </Collapsable>
        </div>
    </div>
</template>

<style>
    .column-container {
        overflow: auto;
    }
</style>