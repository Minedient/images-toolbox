# images-toolbox

An Electron application with Vue and TypeScript

The project is aim for my own learning purpose.

This application is still in development. It only capable to encode images into webp format using cwebp.exe provided by Google.

## Limit

Webp format does not support images dimension larger than 16383 x 16383, so the program will not work if one of the image exceed 16383 pixels in either horitzonal or vertical direction. (https://developers.google.com/speed/webp/faq) 

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

Currently, the transcode functionality only works in Window enviornment as ONLY cwebp binary for window is included.

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
