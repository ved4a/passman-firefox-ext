"use strict";

import { genSalt, hashPW } from '../crypto/crypto.js';
import { saveToStorage, getFromStorage } from '../storage/store.js';
import { startAutoLock } from '../utils/timer.js';

const setupDiv = document.getElementById('setup');
const loginDiv = document.getElementById('login');
const errorContainer = document.getElementById("errorContainer");
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
    let salt = genSalt();

    document.getElementById("setPasswordBtn").addEventListener("click", function() {
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (newPassword == confirmPassword){
        // clear the error container (if error exists)
        errorContainer.textContent = "";

        // do NOT store actual pw! only store hashed pw
        let hashedMasterPassword = hashPW(confirmPassword, salt);
        saveToStorage(salt, hashedMasterPassword);

        // now can show the vault!
        setupDiv.classList.add("hidden");
        vaultDiv.classList.remove("hidden");

      } else {
        // show an error message
        errorContainer.textContent = "Error: Passwords don't match!";

      }
    } )


  } else {
    loginDiv.classList.remove('hidden');
  }

  // if NO salt:
  // let user create master pw, hash, and store
  // generate salt for hashing


  // if yes salt:
  // let user log in with master pw
  // compute the hashed pw with the one in storage
  // yes? go to vault. no? 3 tries

};

document.addEventListener('DOMContentLoaded', init);