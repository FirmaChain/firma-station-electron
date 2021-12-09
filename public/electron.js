const { app, BrowserWindow, shell, ipcMain } = require("electron");
const electron = require("electron");
const path = require("path");

electron.app.setPath("userData", path.join(electron.app.getPath("home"), ".firma-station"));

const version = "1.0.2";
const offset = 16;
const goalWidth = 1500 + offset;

function initialize() {
  function createWindow() {
    const size = electron.screen.getPrimaryDisplay().workAreaSize;
    const originWidth = size.width;
    const width = originWidth > goalWidth ? goalWidth : originWidth;
    const height = parseInt(width / (1920 / 1080));

    const windowOptions = {
      minWidth: width,
      minHeight: height,
      width: width,
      height: height,
      title: app.getName(),
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
    mainWindow.loadURL("https://station-colosseum.firmachain.dev");

    mainWindow.once("ready-to-show", () => {
      mainWindow.show();
      mainWindow.webContents.setZoomFactor(mainWindow.getSize()[0] / goalWidth);
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
}

initialize();
