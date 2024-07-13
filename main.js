const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron")
const path = require("path")
const os = require("os")
const fs = require("fs")
const dotenv = require("dotenv")
const ResizeImg = require("resize-img")

dotenv.config()

const isDev = process.env.NODE_ENV !== "production"
const isMac = process.platform === 'darwin'

let mainWindow;

// create a window of our application
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: "First App Image Resizer",
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js")
        }
    })

    mainWindow.loadFile(path.join(__dirname, "renderer/index.html"))
    if (isDev) {
        mainWindow.webContents.openDevTools()
    }
}
// create about window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: "First App About Image Resizer",
        width: 300,
        height: 300,
    })

    aboutWindow.loadFile(path.join(__dirname, "renderer/about.html"))
}

app.whenReady().then(() => {
    // create a app window
    createMainWindow()

    // implement menu
    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    // Remove mainWindow from memory when close
    mainWindow.on("closed", () => {
        mainWindow = null
    })

    // create a new app window when no window present
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
    })

})

// menu template 
const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu: [{
            label: "About",
        }]
    }] : []),
    {
        label: "File",
        submenu: [{
            label: "Quit",
            click: () => app.quit(),
            accelerator: "CmdOrCtrl+w",
        }]
    },
    ...(!isMac && [{
        label: "Help",
        submenu: [{
            label: "About",
            click: () => {
                createAboutWindow()
            }
        }]
    }])
]

// respond to ipcRenderer
ipcMain.on("image:resize", (e, options) => {
    options.dest = path.join(os.homedir(), "Pictures/imageResizer")
    resizeImage(options)
})

// Resize image function
async function resizeImage({ imgPath, width, height, dest }) {
    try {
        const newPath = await ResizeImg(fs.readFileSync(imgPath), {
            width: +width, // + symbol converts the width string into number
            height: +height // + symbol converts the height string into number
        })

        // create file with same name
        const filename = path.basename(imgPath)

        // create dest folder if not exists
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest)
        }

        // write the file to the Destination
        fs.writeFileSync(path.join(dest, filename), newPath)

        // send Success to renderer
        mainWindow.webContents.send("image:done")

        // open the dest folder
        shell.openPath(dest)

    } catch (err) {
        console.log(err)
    }
}

// handle the closing of the windows and application
app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})