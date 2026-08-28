# Ventrexs AI — Desktop Release & Verification Checklist

This checklist must be executed before shipping any official desktop binary release (`.exe` or `.dmg`) to customers.

---

## 1. Pre-Build Code & Secret Hygiene
- [x] **No Secrets in Filesystem Exclusions**: Confirm `electron-builder.json` excludes `.env*`, `scripts/`, and test artifacts.
- [x] **No Hardcoded API Keys**: Confirm `desktop/main.js` and `desktop/preload.js` contain zero Stripe/Razorpay keys or service roles.
- [x] **Security Headers**: Confirm `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, and `webSecurity: true` are enabled in `main.js`.
- [x] **External Link Redirection**: Confirm external URLs open in default OS browser via `shell.openExternal`.

---

## 2. Automated Test Suite Verification
- [x] **TypeScript Type Check**:
  ```bash
  npx tsc --noEmit
  ```
- [x] **Next.js Production Build**:
  ```bash
  npm run build
  ```
- [x] **Phase 3 Desktop Test Suite**:
  ```bash
  npx tsx scripts/test-phase3-desktop.ts
  ```
- [x] **Master Test Suite (All 39 Test Suites)**:
  ```bash
  npx tsx scripts/run-all-tests.ts
  ```

---

## 3. Windows Release Build Steps (Primary)
1. **Prepare Build Environment**:
   ```bash
   npm install --include=dev
   ```
2. **Build Windows Installer & Portable Executable**:
   ```bash
   npm run electron:build:win
   ```
3. **Verify Generated Artifacts**:
   - Location: `dist/desktop/`
   - Setup Installer: `Ventrexs AI Setup 1.0.0.exe`
   - Portable Executable: `Ventrexs AI 1.0.0.exe`
4. **Manual Windows Installation QA**:
   - Run installer on clean Windows 10/11 machine.
   - Verify Start Menu shortcut "Ventrexs AI" created.
   - Verify Desktop shortcut created.
   - Verify Splash screen displays smoothly during startup.
   - Verify AppData storage located at `%APPDATA%\Ventrexs AI`.
   - Verify clean uninstallation via Windows Control Panel.

---

## 4. macOS Release Build Steps (Secondary)
1. **Runner Environment**: macOS workstation or GitHub Actions `macos-latest` runner.
2. **Configure Code Signing**:
   - Set `CSC_LINK` and `CSC_KEY_PASSWORD` with Developer ID Application certificate.
   - Set `APPLE_ID` and `APPLE_APP_SPECIFIC_PASSWORD` for notary service.
3. **Build macOS Disk Image**:
   ```bash
   npm run electron:build:mac
   ```
4. **Verify Generated Artifacts**:
   - DMG Installer: `dist/desktop/Ventrexs AI-1.0.0.dmg`
   - Application Zip: `dist/desktop/Ventrexs AI-1.0.0-mac.zip`
5. **Manual macOS QA**:
   - Open DMG and drag Ventrexs AI to `/Applications`.
   - Verify Gatekeeper verification passes without notarization warnings.
   - Verify app launches and displays menu bar.

---

## 5. Post-Release Telemetry & Distribution
- [ ] Upload `.exe` installers to official release distribution bucket / CDN.
- [ ] Update desktop download links on `https://ventrexs.com/download` (or marketing page).
- [ ] Verify production error boundaries log telemetry via Supabase audit events.
