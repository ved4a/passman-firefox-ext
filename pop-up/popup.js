"use strict";

import { genSalt, hashPW, encryptData, decryptData } from '../crypto/crypto.js';
import { saveToStorage, getFromStorage } from '../storage/store.js';
import { startAutoLock } from '../utils/timer.js';

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
    // show initial set-up
    setupDiv.classList.remove('hidden');

    // create salt
    let newSalt = await genSalt();

    // async function to:
    // create salt, store salt
    // create hashedPW, store hashedPW
    document.getElementById("setPasswordBtn").addEventListener("click", async function() {
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (newPassword.length < 6){
        setupError.textContent = "Password must be at least 6 characters.";
        return;
      }

      if (newPassword == confirmPassword){
        // clear the error container (if error exists)
        setupError.textContent = "";

        // do NOT store actual pw! only store hashed pw
        const derivedKey = await hashPW(confirmPassword, newSalt);
        const rawKey = await crypto.subtle.exportKey("raw", derivedKey);
        const encodedKey = btoa(String.fromCharCode(...new Uint8Array(rawKey)));

        await saveToStorage("salt", newSalt);
        await saveToStorage("masterPassword", encodedKey);

        // now can show the vault!
        setupDiv.classList.add("hidden");
        vaultDiv.classList.remove("hidden");
      } else {
        // show an error message
        setupError.textContent = "Error: Passwords don't match!";
        return;
      }
    } )

  } else {
    loginDiv.classList.remove('hidden');

    document.getElementById("loginBtn").addEventListener("click", async function () {
      const enteredPW = document.getElementById("loginPassword").value;
      const storedHashPassword = await getFromStorage("masterPassword");

      const derivedKey = await hashPW(enteredPW, salt);
      const rawKey = await crypto.subtle.exportKey("raw", derivedKey);
      const encodedKey = btoa(String.fromCharCode(...new Uint8Array(rawKey)));

      if (encodedKey == storedHashPassword){
        loginDiv.classList.add("hidden");
        vaultDiv.classList.remove("hidden");

        // begin 10-min auto-lock timer
        startAutoLock(logout);

        // render all passwords
        allEntries = await getFromStorage("vaultEntries") || [];
        renderPasswords(allEntries);

        // add password functionality
        document.getElementById("addPasswordBtn").addEventListener("click", async () => {
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
        });

      } else {
        loginError.textContent = "Incorrect password.";
      }
    })
  }
};

function logout(){
  vaultDiv.classList.add("hidden");
  loginDiv.classList.remove("hidden");
  document.getElementById("loginPassword").value = "";
}

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

document.addEventListener('DOMContentLoaded', init);