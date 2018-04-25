'use strict';

const electron = require('electron');
const {app, protocol} = electron;
const {BrowserWindow} = electron;
const {globalShortcut} = electron;
const {ipcRenderer} = electron;
const {webContents} = electron;


var mainWindow = null;
app.commandLine.appendSwitch('--disable-http-cache');


app.on('ready', function() {
    setTimeout(() => {
    mainWindow = new BrowserWindow({
        frame: false,
        height: 500,
        //resizable: false,
        width: 500,
        transparent:true,
  	backgroundColor: '#00000000'

    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.maximize()
	},100)


});




app.on('window-all-closed', () => {
  app.quit();
});



