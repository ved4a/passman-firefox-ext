# 🔐 Crypt Keeper – Secure Firefox Password Manager

Crypt Keeper is a lightweight and secure password manager built as a **Firefox browser extension**. It allows users to store and manage their website credentials entirely on the client side, with encryption handled in-browser using the Web Crypto API.

---

## 🚀 Features

- Master password protected vault
- Secure local storage (no data ever leaves your browser)
- AES-GCM encryption with PBKDF2-based key derivation
- Auto-lock timer for added security
- Search and filter saved credentials
- Click-to-decrypt password visibility

---

## 🤔 How to Run

1. Clone or download this repository to your local machine.
2. Open Firefox and navigate to `about:debugging`.
3. Click **“This Firefox”**, then **“Load Temporary Add-on…”**.
4. Select the `manifest.json` file in your extension folder.
5. Open the extension popup from the toolbar.
6. Set your master password and begin using your vault!

_Note: To persist the extension, you'll need to re-load it each time you restart Firefox unless you package and publish it._

---

## 🔐 Security Model

- **AES-GCM 256-bit encryption**: All passwords are encrypted using AES-GCM in the browser.
- **PBKDF2 key derivation**: The master password is never stored or transmitted. A derived key is created using PBKDF2 + a random per-user salt (also stored locally).
- **Encrypted data only** is saved in local browser storage.
- **Auto-lock timer** clears access after inactivity.
- **No external API calls** – everything runs locally.

---

## 🚫 No Tracking / No Cloud

This extension stores *everything* locally. Your passwords, master password, and encryption key never leave your browser.

---
