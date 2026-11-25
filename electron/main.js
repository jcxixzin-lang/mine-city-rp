const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: 'Mine City RP',
    backgroundColor: '#160027',
    autoHideMenuBar: true,
    maximizable: true,
    resizable: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  win.maximize();
  win.loadFile(path.join(__dirname, '..', 'index.html'));
  win.webContents.setZoomFactor(1);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});