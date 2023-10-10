const { app, BrowserWindow } = require('electron');
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.setMenu(null);
  mainWindow.loadFile('./build/index.html');
  //mainWindow.openDevTools();  //디버깅용이기 때문에 배포시 주석처리 할 것. 송하권, 23.10.10
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
  if(process.platform !== "darwin") {
    app.quit();
  }
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});