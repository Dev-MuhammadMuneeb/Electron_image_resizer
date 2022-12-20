const path = require("path");
const os = require("os");
const fs = require("fs");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const resizeImg = require('resize-img');

process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow;

//Create the main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  //Open DevTools if in dev env
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "./renders/index.html"));
}

//Create ABOUT Window
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renders/about.html"));
}

//App is ready
app.whenReady().then(() => {
  createMainWindow();

  //Implement Menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  //Remove mainWindow from memory onClose
  mainWindow.on('closed', ()=> (mainWindow = null));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows.length === 0) {
      createMainWindow();
    }
  });
});

//Menu template
const menu = [
  {
    role: "fileMenu",
  },
  //for window users
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  //for Mac users
  ...(isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
];

// Respond to ipcRenderer resize
ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageResizer");
  resizeImage(options);
});

// Resize the image
async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    //create filename
    const filename = path.basename(imgPath);

    //create dest folder if not exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    //write file to dest
    fs.writeFileSync(path.join(dest, filename), newPath);

    //send success to render
    mainWindow.webContents.send("image:done");

    //open dest folder
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}

// for mac users
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
