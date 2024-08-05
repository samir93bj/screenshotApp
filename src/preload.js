const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  takeScreenshot: (url, format) =>
    ipcRenderer.invoke("take-screenshot", { url, format }),
});
