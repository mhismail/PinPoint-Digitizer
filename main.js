'use strict';

const electron = require('electron');
const {app, protocol} = electron;
const {BrowserWindow} = electron;
const {globalShortcut} = electron;
const {ipcRenderer} = electron;
const {webContents} = electron;


var mainWindow = null;
app.commandLine.appendSwitch('--disable-http-cache');
//app.disableHardwareAcceleration()

app.on('ready', function(event) {
        event.preventDefault();
    setTimeout(() => {
    mainWindow = new BrowserWindow({
        frame: false,
        height: 500,
        //resizable: false,
        width: 500,
        transparent:true,
  	backgroundColor: '#00000000',
  	webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
  	}

    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.maximize()
	},500)


});




app.on('window-all-closed', () => {
  app.quit();
});



