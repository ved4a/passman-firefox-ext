"use strict";

import { genSalt, hashPW } from '../crypto/crypto.js';
import { saveToStorage, getFromStorage } from '../storage/store.js';
import { startAutoLock } from '../utils/timer.js';

// const setupDiv = document.getElementById('setup');
// const loginDiv = document.getElementById('login');
const vaultDiv = document.getElementById('vault');
const passwordsListDiv = document.getElementById('passwordsList');
const searchInput = document.getElementById('searchInput');

const init = async () => {
  console.log('Init function started!');

  const setupDiv = document.getElementById('setup');
  const loginDiv = document.getElementById('login');

  // check if salt is in storage -> means there exists a vault
  // ...associated with the user
  const salt = await getFromStorage("salt");
  if (!salt){
    setupDiv.classList.remove('hidden');
  } else {
    loginDiv.classList.remove('hidden');
  }
};

document.addEventListener('DOMContentLoaded', init);