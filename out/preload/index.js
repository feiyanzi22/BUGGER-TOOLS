"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // 文件操作
  uploadFile: (file, filename) => electron.ipcRenderer.invoke("save-file", file, filename),
  deleteFile: (path) => electron.ipcRenderer.invoke("delete-file", path)
});
