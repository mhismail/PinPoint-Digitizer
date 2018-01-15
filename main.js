'use strict';

const electron = require('electron');
const {app, protocol} = electron;
const {BrowserWindow} = electron;
const {globalShortcut} = electron;
const {ipcRenderer} = electron;
const {webContents} = electron;
var path = require('path')


var mainWindow = null;
app.commandLine.appendSwitch('--disable-http-cache');

if (process.platform=="darwin"){
    app.disableHardwareAcceleration()
}

app.on('ready', function() {
     protocol.unregisterProtocol('', () => {
    mainWindow = new BrowserWindow({
        frame: false,
        height: 500,
        //resizable: false,
        width: 500,
        transparent:true,
        icon: path.join(__dirname, 'images/512x512.png')
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.maximize()

    
 
     })
});




app.on('window-all-closed', () => {
  app.quit();
});


