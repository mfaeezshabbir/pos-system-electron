/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  // Printer operations
  printReceipt: (receiptData) => ipcRenderer.invoke('print-receipt', receiptData),

  // Data operations
  backupData: () => ipcRenderer.invoke('backup-data'),
  restoreData: (backupData) => ipcRenderer.invoke('restore-data', backupData),

  // System info
  getSystemInfo: () => ({
    platform: process.platform,
    version: process.version,
    versions: process.versions
  }),

  on: (channel, callback) => ipcRenderer.on(channel, (_, data) => callback(data)),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
