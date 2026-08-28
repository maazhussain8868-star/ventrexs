# Ventrexs AI — Desktop Application Architecture & Packaging Guide

## 1. Overview & Architecture

The Ventrexs AI Desktop Application provides an official, native desktop client for Windows and macOS. It wraps the unified Next.js 16 production web application inside a hardened, enterprise-grade Electron shell.

```
┌─────────────────────────────────────────────────────────────┐
│                 Ventrexs AI Desktop Shell                   │
│                                                             │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │   Electron Main       │       │    Secure Preload     │  │
│  │  (desktop/main.js)    │◄─────►│  (desktop/preload.js) │  │
│  └──────────┬────────────┘       └──────────┬────────────┘  │
│             │                               │               │
│             ▼                               ▼               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Chromium Renderer Sandbox               │  │
│  │        (Next.js SaaS: https://ventrexs.com)           │  │
│  └──────────────────────────┬────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Ventrexs Production SaaS                    │
│   (Supabase Auth & RLS • Stripe/Razorpay • Voice Engine)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Desktop Security Specifications

| Security Directive | Configuration | Purpose |
| :--- | :--- | :--- |
| **Context Isolation** | `contextIsolation: true` | Prevents renderer scripts from accessing or prototype-polluting electron internals. |
| **Node Integration** | `nodeIntegration: false` | Disables Node.js filesystem, network, and child_process modules in web context. |
| **Chromium Sandbox** | `sandbox: true` | Enforces standard Chromium security sandbox on the webview. |
| **Web Security** | `webSecurity: true` | Enforces Content Security Policy and prevents cross-origin file read bypasses. |
| **Navigation Guard** | `setWindowOpenHandler` | External links (Stripe docs, legal pages, third-party sites) open in user's default browser. |
| **Zero Embedded Secrets**| Excluded in `.electron-builder` | Server keys (`STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are NEVER packaged. |

---

## 3. Windows Desktop Packaging (Primary Target)

### Target Artifacts
- **NSIS Installer**: `dist/desktop/Ventrexs AI Setup 1.0.0.exe`
- **Portable Executable**: `dist/desktop/Ventrexs AI 1.0.0.exe`

### Features & Capabilities
- **Desktop & Start Menu Shortcuts**: Automatic creation of shortcuts with high-resolution Ventrexs AI icon.
- **Per-User / Machine Install**: User-configurable install directory (`%LOCALAPPDATA%\Programs\Ventrexs AI` or `Program Files`).
- **Clean AppData Handling**: Isolated configuration and session storage in `%APPDATA%\Ventrexs AI`.
- **Integrated Uninstaller**: Standard Windows Control Panel uninstaller.

### Build Commands
```bash
# Test local desktop shell
npm run electron:dev

# Generate production Windows installer & portable .exe
npm run electron:build:win
```

---

## 4. macOS Packaging Preparation (Secondary Target)

### Target Artifacts
- **Apple Disk Image**: `dist/desktop/Ventrexs AI-1.0.0.dmg`
- **Application Bundle**: `dist/desktop/Ventrexs AI-1.0.0-mac.zip`

### Architecture & Capabilities
- **Dual Architecture**: Universal support for `x64` (Intel) and `arm64` (Apple Silicon M-Series).
- **Hardened Runtime**: Enabled with `desktop/entitlements.mac.plist` allowing network client, JIT, and dynamic loading.
- **Drag-to-Applications**: Standard macOS DMG installer layout.

### macOS Signing & Notarization Workflow
When building on a macOS runner (e.g. GitHub Actions `macos-latest` or macOS workstation):
```bash
# Set Apple Developer signing credentials
export CSC_LINK="path/to/developer_certificate.p12"
export CSC_KEY_PASSWORD="certificate_password"
export APPLE_ID="developer@ventrexs.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="TEAMID1234"

# Generate signed and notarized DMG
npm run electron:build:mac
```

---

## 5. Automatic Update Strategy

The desktop application is configured for seamless zero-downtime updates:
- **Cloud Update Feed**: Configured via `electron-builder.json` (`https://updates.ventrexs.com/desktop`).
- **Differential Updates**: `electron-updater` downloads only delta blocks between releases.
- **Web App Independence**: Because the desktop client renders the hosted production SaaS frontend, UI enhancements, server action fixes, and receptionist updates take effect immediately without requiring a full desktop binary reinstall.

---

## 6. Zero Regression & Isolation Invariants

1. **Authentication**: Users sign in using existing Ventrexs credentials. No desktop-specific user accounts or local databases.
2. **Tenant Isolation**: `business_id` and `agency_id` RLS filters are strictly applied on Supabase servers.
3. **Agency Isolation**: Agency users accessing the desktop client remain strictly within `/agency` routes. Access to customer dashboards is blocked by middleware and server actions.
4. **Demo Mode**: Demo users explore realistic fictional data with read-only safety, zero live card charges, and no database mutations.
