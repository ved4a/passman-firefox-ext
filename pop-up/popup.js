"use strict";

import { genSalt, hashPW } from '../crypto/crypto.js';
import { saveToStorage, getFromStorage } from '../storage/store.js';
import { startAutoLock } from '../utils/timer.js';

const setupDiv = document.getElementById('setup');
const loginDiv = document.getElementById('login');

const setupError = document.getElementById("setupErrorContainer");
const loginError = document.getElementById("loginErrorContainer");

const vaultDiv = document.getElementById('vault');
const passwordsListDiv = document.getElementById('passwordsList');
const searchInput = document.getElementById('searchInput');

const init = async () => {
  console.log('Init function started!');

  // check if salt is in storage -> means there exists a vault
  // ...associated with the user
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

      if (newPassword == confirmPassword){
        // clear the error container (if error exists)
        setupError.textContent = "";

        // do NOT store actual pw! only store hashed pw
        const hashedMasterPassword = await hashPW(confirmPassword, newSalt);
        await saveToStorage("salt", newSalt);
        await saveToStorage("masterPassword", hashedMasterPassword);

        // now can show the vault!
        setupDiv.classList.add("hidden");
        vaultDiv.classList.remove("hidden");
      } else {
        // show an error message
        setupError.textContent = "Error: Passwords don't match!";
      }
    } )


  } else {
    loginDiv.classList.remove('hidden');

    document.getElementById("loginBtn").addEventListener("click", async function () {
      const enteredPW = document.getElementById("loginPassword").value;
      const storedHashPassword = await getFromStorage("masterPassword");

      const hashedEnteredPW = await hashPW(enteredPW, salt);

      if (hashedEnteredPW == storedHashPassword){
        loginDiv.classList.add("hidden");
        vaultDiv.classList.remove("hidden");
      } else {
        loginError.textContent = "Incorrect password.";
      }
    })
  }
};

document.addEventListener('DOMContentLoaded', init);