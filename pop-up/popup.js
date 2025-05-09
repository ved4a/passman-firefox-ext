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

  // check if salt is in storage -> means there exists a vault
  const salt = await getFromStorage("salt");

  if (!salt){
    setupDiv.classList.remove('hidden');
    document.getElementById("setPasswordBtn").addEventListener("click", () => setupMasterPassword());
  } else {
    loginDiv.classList.remove('hidden');
    document.getElementById("loginBtn").addEventListener("click", () => loginWithPassword(salt));
  }
};

function logout(){
  vaultDiv.classList.add("hidden");
  loginDiv.classList.remove("hidden");
  document.getElementById("loginPassword").value = "";
}

document.getElementById("logoutBtn").addEventListener("click", logout);

function renderPasswords(entries){
  const container = document.getElementById("passwordsList");
  container.innerHTML = "";

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

    container.appendChild(item);
  });

  container.querySelectorAll(".decryptBtn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      resetAutoLock(logout);

      const idx = e.target.dataset.index;
      const decrypted = await decryptData(allEntries[idx].password, derivedKey);
      document.getElementById(`decrypted-${idx}`).textContent = `Decrypted: ${decrypted}`;
    });
  });
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

document.addEventListener('DOMContentLoaded', init);