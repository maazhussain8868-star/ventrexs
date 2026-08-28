/**
 * ==============================================================================
 * VENTREXS AI — SECURE PRELOAD CONTEXT BRIDGE
 * ==============================================================================
 * Exposes strictly safe, non-privileged desktop APIs to the renderer window.
 *
 * Security Invariants:
 * - Direct Node.js APIs (`fs`, `child_process`, `net`, etc.) are NEVER exposed.
 * - Server credentials and secrets are NEVER accessed from preload.
 * - Context bridge prevents renderer prototype tampering.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ventrexsDesktop', {
  isDesktopApp: true,
  platform: process.platform,
  minimize: () => ipcRenderer.invoke('ventrexs:minimize'),
  maximize: () => ipcRenderer.invoke('ventrexs:maximize'),
  close: () => ipcRenderer.invoke('ventrexs:close'),
  getAppMetadata: () => ipcRenderer.invoke('ventrexs:get-app-metadata'),
});
