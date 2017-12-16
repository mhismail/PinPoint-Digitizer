'use strict';

const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const {globalShortcut} = electron;
const {ipcRenderer} = electron;

var mainWindow = null;
app.commandLine.appendSwitch('--disable-http-cache');

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        frame: true,
        height: 700,
        resizable: true,
        width: 700
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
	
});

app.on('window-all-closed', () => {
  app.quit();
});
