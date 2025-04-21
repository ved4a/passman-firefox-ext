"use strict";

// use cases:
// hashed master pw, salt, enc data, auto-lock timestamps
export async function saveToStorage(key, value){
    await browser.storage.local.set({[key]: value});
}

// use case:
// retrieve stored salt, check if master pw set, fetch enc vault
export async function getFromStorage(key){
    const result = await browser.storage.local.get(key);
    return result[key];
}