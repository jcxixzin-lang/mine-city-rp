const { app, BrowserWindow } = require('electron');

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
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Maximiza para garantir que o menu e a viewport do jogo ocupem a tela.
  win.maximize();
  win.loadURL('https://mine-city-rp.onrender.com/');

  // Evita zoom acidental alterar a escala/layout do jogo.
  win.webContents.on('zoom-changed', () => {
    win.webContents.setZoomFactor(1);
  });
  win.webContents.setZoomFactor(1);

  // Se a janela for redimensionada, o navegador atualiza a viewport;
  // o Three.js usa window.resize para ajustar câmera e renderização.
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});