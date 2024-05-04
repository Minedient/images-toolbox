import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { WindowConstants as WC} from '../renderer/src/constants/number'
import fs from 'fs';

let mainWindow: BrowserWindow;

const configPath = path.join(app.getAppPath(), 'config.json');
// Load the config
let config = JSON.parse(fs.readFileSync(configPath).toString());

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: WC.defaultWidth,
    height: WC.defaultHeight,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Check if config.json exists, if not create it
  if (!fs.existsSync(configPath)){
    fs.writeFileSync(configPath, JSON.stringify({
      "quality": 80,
      "method": 4,
      "zCompression": 6,
    }));
  }

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('openOutputFolder', ()=>{
  shell.openPath(path.join(app.getAppPath(), 'output'));
})

// Load the config file and send it to the renderer
ipcMain.on('loadConfig', ()=>{
  config = JSON.parse(fs.readFileSync(configPath).toString());
  mainWindow.webContents.send('configLoaded', config);
})

// Just send the config to the renderer
// target is the window to send the config to
ipcMain.on('getConfig', (event, target)=>{
  console.log('Sending config to renderer: ', target);
  mainWindow.webContents.send('configReturned', config);
})

ipcMain.on('saveConfig', (event, newConfig)=>{
  fs.writeFileSync(configPath, newConfig);
});