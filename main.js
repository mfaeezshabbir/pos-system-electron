// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

// Use dynamic import for electron-store
let Store;
(async () => {
  Store = (await import('electron-store')).default
  const store = new Store()

  // Initialize store schema
  store.set('schema', {
    inventory: {
      type: 'array',
      default: []
    },
    transactions: {
      type: 'array',
      default: []
    },
    settings: {
      type: 'object',
      default: {}
    }
  })
})()

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Load the index.html from a url in development
  // and from the filesystem in production
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers
ipcMain.handle('print-receipt', async (event, { data, options }) => {
  try {
    const printer = mainWindow.webContents.getPrinter()
    
    if (!printer) {
      throw new Error('No printer found')
    }

    // Create a temporary window to print from
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true
      }
    })

    // Load the receipt data
    await printWindow.loadURL(`data:application/pdf;base64,${Buffer.from(data).toString('base64')}`)

    // Print the receipt
    const result = await printWindow.webContents.print(options)
    
    // Close the temporary window
    printWindow.close()

    return { success: true }
  } catch (error) {
    console.error('Printing error:', error)
    return { success: false, error: error.message }
  }
})
