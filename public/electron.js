const { app, BrowserWindow, shell, ipcMain } = require("electron");
const electron = require("electron");
const path = require("path");
const TransportHID = require("@ledgerhq/hw-transport-node-hid").default;
const { FirmaWebLedgerWallet } = require("@firmachain/firma-js-ledger");
const { URL } = require(path.resolve(__dirname, "config.js"));

electron.app.setPath("userData", path.join(electron.app.getPath("home"), ".firma-station"));

const version = "1.0.4";
const offset = 16;
const goalWidth = 1600 + offset;

let ledgerWallet = new FirmaWebLedgerWallet(TransportHID);

function initialize() {
  function createWindow() {
    const size = electron.screen.getPrimaryDisplay().workAreaSize;
    const originWidth = size.width;
    const width = originWidth > goalWidth ? goalWidth : originWidth - 100;
    const height = parseInt(width / (1920 / 1080));

    const windowOptions = {
      minWidth: width,
      minHeight: height,
      width: width,
      height: height,
      title: app.getName(),
      show: false,
      webPreferences: {
        nodeIntegration: false,
        enableRemoteModule: false,
        nativeWindowOpen: true,
        webSecurity: false,
        preload: path.resolve(__dirname, "preload.js"),
      },
      resizable: true,
    };

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.setMenu(null);
    mainWindow.loadURL(URL);

    mainWindow.once("ready-to-show", () => {
      mainWindow.webContents.setZoomFactor(mainWindow.getSize()[0] / goalWidth);
      mainWindow.show();

      mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.webContents.send("isElectron", true);
      });
    });

    mainWindow.on("resize", () => {
      mainWindow.webContents.setZoomFactor(mainWindow.getSize()[0] / goalWidth);
    });

    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }

  app.on("ready", createWindow);

  app.on("window-all-closed", function () {
    app.quit();
  });

  app.on("web-contents-created", (e, webContents) => {
    webContents.on("new-window", (event, url) => {
      event.preventDefault();

      if (url.match(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g)) {
        shell.openExternal(url);
      }
    });
  });

  ipcMain.on("version", (event, arg) => {
    event.returnValue = version;
  });

  ipcMain.on("ledger-showAddressOnDevice", async (event, arg) => {
    await ledgerWallet.showAddressOnDevice();
    event.returnValue = "";
  });

  ipcMain.on("ledger-getAddressAndPublicKey", async (event, arg) => {
    let data = await ledgerWallet.getAddressAndPublicKey();
    event.returnValue = data;
  });

  ipcMain.on("ledger-getAddress", async (event, arg) => {
    let address = await ledgerWallet.getAddress();
    event.returnValue = address;
  });

  ipcMain.on("ledger-sign", async (event, arg) => {
    let message = await ledgerWallet.sign(arg["message"]);
    event.returnValue = message;
  });

  ipcMain.on("ledger-getPublicKey", async (event, arg) => {
    let message = await ledgerWallet.getPublicKey();
    event.returnValue = message;
  });
}

initialize();
