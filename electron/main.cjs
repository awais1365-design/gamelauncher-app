const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

let win;

const FILE_URL = 'https://github.com/ip7z/7zip/releases/download/26.00/7z2600-mac.tar.xz';

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

/* =====================================================
   ✅ DOWNLOAD FILE
===================================================== */
ipcMain.on('download-file', (event) => {
  if (!win) return;

  const savePath = dialog.showSaveDialogSync({
    title: 'Save File',
    defaultPath: '7z2600-mac.tar.xz'
  });

  if (!savePath) {
    event.sender.send('download-complete', { success: false });
    return;
  }

  win.webContents.session.once('will-download', (e, item) => {
    item.setSavePath(savePath);

    item.on('updated', () => {
      const percent = Math.round(
        (item.getReceivedBytes() / item.getTotalBytes()) * 100
      );
      event.sender.send('download-progress', percent);
    });

    item.once('done', (e, state) => {
      if (state === 'completed') {
        event.sender.send('download-complete', {
          success: true,
          path: savePath
        });
      } else {
        event.sender.send('download-complete', {
          success: false,
          error: state
        });
      }
    });
  });

  win.webContents.downloadURL(FILE_URL);
});

/* =====================================================
   ✅ INSTALL APP (Extract .tar.xz + save to backend)
===================================================== */
ipcMain.handle('install-app', async (event, filePath) => {
  const installDir = path.join(app.getPath('userData'), 'apps');

  if (!fs.existsSync(installDir)) {
    fs.mkdirSync(installDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    // Extract tar.xz file
    exec(`tar -xJf "${filePath}" -C "${installDir}"`, async (err) => {
      if (err) {
        console.error("Extraction error:", err);
        reject("Extraction failed");
      } else {
        // -------------------------------
        // 1️⃣ Prepare app info
        // -------------------------------
        const installedApp = {
          name: path.basename(filePath, path.extname(filePath)), // file name
          path: installDir, // extracted folder
          version: "1.0.0", // you can later parse real version
        };

        // -------------------------------
        // 2️⃣ Send to NestJS backend
        // -------------------------------
        try {
          const res = await fetch('http://localhost:3000/apps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(installedApp),
          });
          const data = await res.json();
          console.log("Saved to backend:", data);
        } catch (e) {
          console.error("Failed to save app to backend:", e);
        }

        // -------------------------------
        // 3️⃣ Resolve installation path
        // -------------------------------
        resolve(installDir);
      }
    });
  });
});


/* =====================================================
   ✅ RUN / PLAY APP
===================================================== */
ipcMain.handle('run-app', async (event, appPath) => {
  return new Promise((resolve, reject) => {
    exec(`open "${appPath}"`, (err) => {
      if (err) {
        console.error("Launch error:", err);
        reject("Failed to launch app");
      } else {
        resolve("App launched");
      }
    });
  });
});
