/**
 * ==============================================================================
 * VENTREXS AI — OFFICIAL DESKTOP SHELL MAIN PROCESS
 * ==============================================================================
 * Production Electron wrapper for Ventrexs AI SaaS application.
 *
 * Security Policies Enforced:
 * - contextIsolation: true (prevents prototype pollution & bridge tampering)
 * - nodeIntegration: false (disables raw Node.js API in renderer)
 * - sandbox: true (runs renderer in strict Chromium sandbox)
 * - webSecurity: true (enforces same-origin and CSP directives)
 * - Navigation Guard: external links open strictly via shell.openExternal
 * - Zero hardcoded secrets in desktop bundle
 */

const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

// Determine execution environment and target URL
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const DEFAULT_REMOTE_URL = process.env.VENTREXS_APP_URL || 'https://ventrexs.com';
const LOCAL_DEV_URL = 'http://localhost:3000';
const TARGET_URL = isDev && process.env.USE_LOCAL === 'true' ? LOCAL_DEV_URL : DEFAULT_REMOTE_URL;

let mainWindow = null;
let splashWindow = null;

/**
 * Creates the high-fidelity startup splash window
 */
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 340,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    center: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  });
}

/**
 * Creates the primary application window with enterprise security
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Ventrexs AI — Business Operations Platform',
    backgroundColor: '#050812',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      enableRemoteModule: false,
    },
  });

  // Load the target SaaS application
  mainWindow.loadURL(TARGET_URL);

  // Smooth transition from splash window to main window once loaded
  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.destroy();
      splashWindow = null;
    }
    mainWindow.show();
    mainWindow.focus();
  });

  // Navigation Guard: Prevent in-app navigation to unauthorized domains
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    try {
      const parsed = new URL(targetUrl);
      const isAllowedHost =
        parsed.hostname === 'ventrexs.com' ||
        parsed.hostname.endsWith('.ventrexs.com') ||
        (isDev && parsed.hostname === 'localhost');

      if (!isAllowedHost) {
        // Open external links (docs, third-party support, external portals) in default OS browser
        shell.openExternal(targetUrl);
        return { action: 'deny' };
      }
      return { action: 'allow' };
    } catch {
      return { action: 'deny' };
    }
  });

  // Intercept will-navigate to prevent unexpected full-frame redirect hijacking
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsed = new URL(navigationUrl);
      const isAllowedHost =
        parsed.hostname === 'ventrexs.com' ||
        parsed.hostname.endsWith('.ventrexs.com') ||
        (isDev && parsed.hostname === 'localhost');

      if (!isAllowedHost) {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    } catch {
      event.preventDefault();
    }
  });

  // Handle window lifecycle
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for native window controls exposed via secure preload
ipcMain.handle('ventrexs:minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
});

ipcMain.handle('ventrexs:maximize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('ventrexs:close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

ipcMain.handle('ventrexs:get-app-metadata', () => {
  return {
    appName: 'Ventrexs AI',
    version: app.getVersion() || '1.0.0',
    platform: process.platform,
    isPackaged: app.isPackaged,
  };
});

// Application Lifecycle
app.whenReady().then(() => {
  createSplashWindow();
  setTimeout(() => {
    createMainWindow();
  }, 1200);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
