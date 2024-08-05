const { app, ipcMain } = require("electron");
const { handleScreenshot } = require("./screenshot");
const { createWindow, setupAppEvents } = require("./config");

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("take-screenshot", handleScreenshot);

setupAppEvents(app);
