'use strict';

const electron = require('electron');
const {app, protocol} = electron;
const {BrowserWindow} = electron;
const {globalShortcut} = electron;
const {ipcRenderer} = electron;
const {webContents} = electron;


var mainWindow = null;
app.commandLine.appendSwitch('--disable-http-cache');
app.disableHardwareAcceleration()

app.on('ready', function() {
     protocol.unregisterProtocol('', () => {
    mainWindow = new BrowserWindow({
        frame: false,
        height: 500,
        //resizable: false,
        width: 500,
        transparent:true
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.maximize()

    
 
     })
});




app.on('window-all-closed', () => {
  app.quit();
});


