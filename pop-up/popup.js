"use strict";

import { genSalt, hashPW, encryptData, decryptData } from '../crypto/crypto.js';
import { saveToStorage, getFromStorage } from '../storage/store.js';
import { startAutoLock, resetAutoLock } from '../utils/timer.js';

const setupDiv = document.getElementById('setup');
const loginDiv = document.getElementById('login');

const setupError = document.getElementById("setupErrorContainer");
const loginError = document.getElementById("loginErrorContainer");

const vaultDiv = document.getElementById('vault');
const passwordsListDiv = document.getElementById('passwordsList');
const searchInput = document.getElementById('searchInput');

let derivedKey;
let allEntries = [];

const init = async () => {
  console.log('Init function started!');
  const salt = await getFromStorage("salt");

  if (!salt){
    setupDiv.classList.remove('hidden');
  } else {
    loginDiv.classList.remove('hidden');
  }
};

// Logout button
function logout(){
  vaultDiv.classList.add("hidden");
  loginDiv.classList.remove("hidden");
  document.getElementById("loginPassword").value = "";
}

// Master password creation
async function setupMasterPassword() {
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (newPassword.length < 6) {
    setupError.textContent = "Password must be at least 6 characters.";
    return;
  }

  if (newPassword !== confirmPassword) {
    setupError.textContent = "Error: Passwords don't match!";
    return;
  }

  const salt = await genSalt();
  derivedKey = await hashPW(confirmPassword, salt);
  const rawKey = await crypto.subtle.exportKey("raw", derivedKey);
  const encodedKey = btoa(String.fromCharCode(...new Uint8Array(rawKey)));

  await saveToStorage("salt", salt);
  await saveToStorage("masterPassword", encodedKey);

  setupError.textContent = "";
  setupDiv.classList.add("hidden");

  await initializeVault();
}

// Login functionality
async function loginWithPassword(salt) {
  const enteredPW = document.getElementById("loginPassword").value;
  const storedHash = await getFromStorage("masterPassword");

  derivedKey = await hashPW(enteredPW, salt);
  const rawKey = await crypto.subtle.exportKey("raw", derivedKey);
  const encodedKey = btoa(String.fromCharCode(...new Uint8Array(rawKey)));

  if (encodedKey === storedHash) {
    loginError.textContent = "";
    loginDiv.classList.add("hidden");
    await initializeVault();
  } else {
    loginError.textContent = "Incorrect password.";
  }
}

// Vault initialization: UI Rendering, password lists, etc
async function initializeVault() {
  vaultDiv.classList.remove("hidden");
  startAutoLock(logout);

  allEntries = await getFromStorage("vaultEntries") || [];
  renderPasswords(allEntries);

  document.getElementById("addPwd").addEventListener("click", async () => {
    resetAutoLock(logout);

    const website = document.getElementById("websiteInput").value.trim();
    const username = document.getElementById("usernameInput").value.trim();
    const password = document.getElementById("passwordInput").value;

    if (!website || !username || !password) return;

    const encrypted = await encryptData(password, derivedKey);
    const newEntry = { website, username, password: encrypted };

    allEntries.push(newEntry);
    await saveToStorage("vaultEntries", allEntries);
    renderPasswords(allEntries);

    document.getElementById("websiteInput").value = "";
    document.getElementById("usernameInput").value = "";
    document.getElementById("passwordInput").value = "";

    const msg = document.createElement("div");
    msg.textContent = "Password added!";
    msg.classList.add("add-confirmation");
    vaultDiv.insertBefore(msg, passwordsListDiv);
    setTimeout(() => msg.remove(), 1500);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const term = searchInput.value.toLowerCase();
      const filtered = allEntries.filter(entry =>
        entry.website.toLowerCase().includes(term)
      );
      renderPasswords(filtered);
    }
  });
}

// Render password list
function renderPasswords(entries) {
  passwordsListDiv.innerHTML = "";

  entries.forEach((entry, index) => {
    const item = document.createElement("div");
    item.classList.add("vault-item");

    item.innerHTML = `
      <strong>${entry.website}</strong><br/>
      User: ${entry.username}<br/>
      Encrypted PW: <code>${entry.password.data}</code><br/>
      <button data-index="${index}" class="decryptBtn">Decrypt</button>
      <span class="decrypted-pw" id="decrypted-${index}"></span>
    `;

    passwordsListDiv.appendChild(item);
  });

  passwordsListDiv.querySelectorAll(".decryptBtn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      resetAutoLock(logout);
      const idx = e.target.dataset.index;
      const decrypted = await decryptData(allEntries[idx].password, derivedKey);
      document.getElementById(`decrypted-${idx}`).textContent = `Decrypted: ${decrypted}`;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  init();

  // Set Master Pw
  const setPasswordBtn = document.getElementById("setPasswordBtn");
  if (setPasswordBtn) {
    setPasswordBtn.addEventListener("click", setupMasterPassword);
  }

  // Login handler
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const salt = await getFromStorage("salt");
      if (salt) await loginWithPassword(salt);
    });
  }

  // Logout handler
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
});