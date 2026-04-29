import { app, BrowserWindow, shell, ipcMain, screen } from 'electron';
import TransportHID from '@ledgerhq/hw-transport-node-hid';
import { FirmaCosmosLedgerWallet } from '@firmachain/firma-js';
import path from 'path';
import { URL } from './config';

app.setPath('userData', path.join(app.getPath('home'), '.firma-station'));

const version = '1.1.0-beta.1';
const offset = 16;
const goalWidth = 1600 + offset;

const ledgerWallet = new FirmaCosmosLedgerWallet(TransportHID);
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

  ipcMain.on('ledger-showAddressOnDevice', async (event) => {
    try {
      await ledgerWallet.showAddressOnDevice();
      event.returnValue = '';
    } catch (err) {
      console.error('[ledger-showAddressOnDevice] error:', err);
      event.returnValue = '';
    }
  });

  ipcMain.on('ledger-getAddressAndPublicKey', async (event) => {
    try {
      const data = await ledgerWallet.getAddressAndPublicKey();
      event.returnValue = data;
    } catch (err) {
      console.error('[ledger-getAddressAndPublicKey] error:', err);
      event.returnValue = null;
    }
  });

  ipcMain.on('ledger-getAddress', async (event) => {
    try {
      const address = await ledgerWallet.getAddress();
      event.returnValue = address;
    } catch (err) {
      console.error('[ledger-getAddress] error:', err);
      event.returnValue = null;
    }
  });

  ipcMain.on('ledger-sign', async (event, arg) => {
    try {
      const message = await ledgerWallet.sign(arg['message'], arg['txtype']);
      event.returnValue = message;
    } catch (err) {
      console.error('[ledger-sign] error:', err);
      event.returnValue = null;
    }
  });

  ipcMain.on('ledger-getPublicKey', async (event) => {
    try {
      const message = await ledgerWallet.getPublicKey();
      event.returnValue = message;
    } catch (err) {
      console.error('[ledger-getPublicKey] error:', err);
      event.returnValue = null;
    }
  });
}

initialize();
