import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let pyProc = null;

// === ЛОГИРОВАНИЕ В ФАЙЛ (ЧТОБЫ ВИДЕТЬ ОШИБКИ) ===
// Лог будет лежать здесь: /Users/ТВОЕ_ИМЯ/Library/Application Support/SculptorPro/server_log.txt
const logPath = path.join(app.getPath('userData'), 'server_log.txt');

function logToFile(message) {
  try {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
  } catch (e) {
    console.error('Log error:', e);
  }
}

// === ЗАПУСК СЕРВЕРА ===
const createPyProc = () => {
  // 1. Жесткий путь для ПРОДАКШЕНА
  let scriptName = 'server';
  if (process.platform === 'win32') scriptName += '.exe';

  // Путь: Внутри приложения/Contents/Resources/api/server
  const scriptPath = path.join(process.resourcesPath, 'api', scriptName);
  const scriptDir = path.dirname(scriptPath);

  logToFile(`🚀 Attempting to start server from: ${scriptPath}`);
  logToFile(`jw Working directory: ${scriptDir}`);

  // Проверка: существует ли файл?
  if (!fs.existsSync(scriptPath)) {
    logToFile('❌ CRITICAL: Server file NOT found at this path!');
    return;
  }

  // 2. Запуск
  pyProc = spawn(scriptPath, [], {
    cwd: scriptDir, // Рабочая папка = папка где лежит сервер (чтобы видеть конфиг)
    detached: false,
    stdio: 'pipe'
  });

  if (pyProc) {
    logToFile('✅ Process spawned. PID: ' + pyProc.pid);

    pyProc.stdout.on('data', (data) => {
      logToFile(`[PY STDOUT]: ${data.toString().trim()}`);
    });

    pyProc.stderr.on('data', (data) => {
      logToFile(`[PY STDERR]: ${data.toString().trim()}`);
    });

    pyProc.on('error', (err) => {
      logToFile(`❌ Process ERROR: ${err.message}`);
    });

    pyProc.on('close', (code) => {
      logToFile(`⚠️ Process exited with code: ${code}`);
    });
  }
};

const exitPyProc = () => {
  if (pyProc) {
    logToFile('Killing process before exit...');
    pyProc.kill();
    pyProc = null;
  }
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#09090b',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    title: "Sculptor Pro",
  });

  // ВСЕГДА грузим файл сборки (никакого локалхоста)
  const indexHtml = path.join(__dirname, '../dist/index.html');
  logToFile(`Loading UI from: ${indexHtml}`);
  mainWindow.loadURL(`file://${indexHtml}`);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  logToFile('=== APP STARTED ===');
  createPyProc();
  createWindow();
});

app.on('will-quit', exitPyProc);

app.on('window-all-closed', function () {
  app.quit();
});

// IPC handler'ы оставляем как есть
ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Movies', extensions: ['mp4', 'mkv', 'mov', 'avi'] }]
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      event.reply('selected-file', result.filePaths[0]);
    }
  });
});

ipcMain.on('open-audio-dialog', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'm4a', 'flac'] }]
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      event.reply('selected-audio', result.filePaths[0]);
    }
  });
});

ipcMain.on('open-folder', (event, path) => {
  shell.openPath(path);
});