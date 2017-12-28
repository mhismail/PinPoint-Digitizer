'use strict';

const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const {globalShortcut} = electron;
const {ipcRenderer} = electron;
const {webContents} = electron;


var mainWindow = null;
app.commandLine.appendSwitch('--disable-http-cache');

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        frame: false,
        height: 100,
        //resizable: true,
        width: 100,
        transparent:true
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.maximize()

    
 

});




app.on('window-all-closed', () => {
  app.quit();
});


