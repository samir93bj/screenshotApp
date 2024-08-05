const { BrowserWindow } = require('electron');
const path = require('path');

/**
 * Create a new BrowserWindow instance and load the index.html file
 */
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../index.html'));
}

/**
 * Listen for the "activate" event and create a new BrowserWindow instance if there are no windows open
 * @param {App} app
 * @returns {void}
 */
function setupAppEvents(app) {
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

module.exports = { createWindow, setupAppEvents };
