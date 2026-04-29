import { app, BrowserWindow, shell, ipcMain, screen } from 'electron';
import path from 'path';
import { URL } from './config';

app.setPath('userData', path.join(app.getPath('home'), '.firma-station'));

const version = '1.0.6';
const offset = 16;
const goalWidth = 1600 + offset;

let mainWindow: BrowserWindow | null = null;

function initialize(): void {
  function createWindow(): void {
    const size = screen.getPrimaryDisplay().workAreaSize;
    const originWidth = size.width;
    const width = originWidth > goalWidth ? goalWidth : originWidth - 100;
    const height = Math.floor(width / (1920 / 1080));

    mainWindow = new BrowserWindow({
      minWidth: width,
      minHeight: height,
      width,
      height,
      title: app.getName(),
      show: false,
      webPreferences: {
        nodeIntegration: false,
        webSecurity: false,
        preload: path.resolve(__dirname, 'preload.js'),
      },
      resizable: true,
    });
    mainWindow.setMenu(null);
    mainWindow.loadURL(URL);

    mainWindow.once('ready-to-show', () => {
      if (!mainWindow) return;
      mainWindow.webContents.setZoomFactor(mainWindow.getSize()[0] / goalWidth);
      mainWindow.show();

      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow?.webContents.send('isElectron', true);
      });
    });

    mainWindow.on('resize', () => {
      if (!mainWindow) return;
      mainWindow.webContents.setZoomFactor(mainWindow.getSize()[0] / goalWidth);
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('web-contents-created', (_event, webContents) => {
    webContents.setWindowOpenHandler(({ url }) => {
      if (url.match(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g)) {
        shell.openExternal(url);
      }
      return { action: 'deny' };
    });
  });

  ipcMain.on('version', (event) => {
    event.returnValue = version;
  });
}

initialize();
