import { contextBridge} from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { CWebp } from 'cwebp';
import path from 'path';
import fs from 'fs';
import { EncodeParameters } from '../renderer/src/classes/objects';

// Custom APIs for renderer
const api = {convertToWebp}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

function isFileLossLess(inputPath: string): boolean {
  const ext = path.extname(inputPath).toLowerCase();
  return ext === '.png' || ext === '.bmp' || ext === '.tiff';
}

async function convertToWebp(inputPath: string, outputPath: string, params: EncodeParameters){
  console.log("Input received! ",inputPath, outputPath, params)
  console.log("Final path: ", uniqueFileName(outputPath))
  var cwebp = CWebp(inputPath, './dependencies/cwebp.exe');
  cwebp.multiThreading();

  // Process parameters
  if(params.isAuto){
    if(isFileLossLess(inputPath)){
      cwebp.losslessPreset(params.zCompression);
    } else {
      cwebp.quality(params.quality);
      cwebp.compression(params.method);
    }
  } else {
    if(params.isLossless){
      cwebp.losslessPreset(params.zCompression);
    } else {
      cwebp.quality(params.quality);
      cwebp.compression(params.method);
    }
  }

  // Make sure the output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
  }

  // Write the files, with checks for repeat files name
  await cwebp.write(uniqueFileName(outputPath), (err) => {
    console.log(err || 'File encoded successfully');
  });
}
/**
 * Generate a unique file name for the output file
 * @param originalPath 
 * @returns Final path of the file to output as
 */
function uniqueFileName(originalPath: string): string {
  const directory = path.dirname(originalPath);
  const ext = path.extname(originalPath);
  const base = path.basename(originalPath, ext);
  let finalPath = originalPath;
  let i = 1;
  while(fs.existsSync(finalPath)){
    finalPath = path.join(directory, `${base}-${i}${ext}`);
    i++;
  }
  return finalPath;
}
