"use strict";

export async function saveToStorage(key, value){
    await browser.storage.local.set({[key]: value});
}