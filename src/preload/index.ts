import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { CWebp } from 'cwebp'
import { EncodeParameters } from '../renderer/src/classes/objects'
import path from 'path'
import fs from 'fs'

// Custom APIs for renderer
const api = { convertToWebp, sendToMain, recevieFromMain }

const toMainCommands = ['openOutputFolder', 'loadConfig', 'saveConfig', 'getConfig']
const fromMainCommands = ['configLoaded', 'configSaved', 'configReturned']

const platformArch = { platform: process.platform, arch: process.arch }

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
  const ext = path.extname(inputPath).toLowerCase()
  return ext === '.png' || ext === '.bmp' || ext === '.tiff'
}

/**
 * This act as a bridge to send messages to the main process from the renderer
 * @param channel The name of the channel/command to send
 * @param args The arguments
 */
function sendToMain(channel: string, ...args: any[]) {
  if (toMainCommands.includes(channel)) {
    ipcRenderer.send(channel, ...args)
  }
}

/**
 * This act as a bridge to receive messages from the main process in the renderer
 * @param channel The name of the channel/command to receive from
 * @param callback The callback function
 */
function recevieFromMain(channel: string, callback: Function) {
  if (fromMainCommands.includes(channel)) {
    ipcRenderer.on(channel, (_, ...args) => callback(...args))
  }
}

async function convertToWebp(inputPath: string, outputPath: string, params: EncodeParameters) {
  console.log('Input received! ', inputPath, outputPath, params)
  console.log('Final path: ', uniqueFileName(outputPath))

  // Default to the windows version
  let cwebp = CWebp(inputPath, './dependencies/window-x64/cwebp.exe')
  switch (platformArch.platform) {
    case 'win32':
      // Only support x64
      if (platformArch.arch !== 'x64') throw new Error('Unsupported architecture!')
      break
    case 'linux':
      // Only support x64 and arm64
      cwebp =
        platformArch.arch === 'x64'
          ? CWebp(inputPath, './dependencies/linux-x64/cwebp')
          : CWebp(inputPath, './dependencies/linux-arm64/cwebp')
      break
    case 'darwin':
      cwebp =
        platformArch.arch === 'x64'
          ? CWebp(inputPath, './dependencies/mac-x64/cwebp')
          : CWebp(inputPath, './dependencies/mac-arm64/cwebp')
      break
    default:
      throw new Error('Unsupported platform!')
  }
  //var cwebp = CWebp(inputPath, './dependencies/cwebp.exe');
  cwebp.multiThreading()

  // Process parameters
  if (params.isAuto) {
    if (isFileLossLess(inputPath)) {
      cwebp.losslessPreset(params.zCompression)
    } else {
      cwebp.quality(params.quality)
      cwebp.compression(params.method)
    }
  } else {
    if (params.isLossless) {
      cwebp.losslessPreset(params.zCompression)
    } else {
      cwebp.quality(params.quality)
      cwebp.compression(params.method)
    }
  }

  // Make sure the output directory exists
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  // Write the files, with checks for repeat files name
  await cwebp.write(uniqueFileName(outputPath), (err) => {
    console.log(err || 'File encoded successfully')
  })
}
/**
 * Generate a unique file name for the output file
 * @param originalPath
 * @returns Final path of the file to output as
 */
function uniqueFileName(originalPath: string): string {
  const directory = path.dirname(originalPath)
  const ext = path.extname(originalPath)
  const base = path.basename(originalPath, ext)
  let finalPath = originalPath
  let i = 1
  while (fs.existsSync(finalPath)) {
    finalPath = path.join(directory, `${base}-${i}${ext}`)
    i++
  }
  return finalPath
}
