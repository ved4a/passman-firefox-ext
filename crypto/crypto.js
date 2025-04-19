"use strict";

// generate random salt, 16 bits
// THIS WILL BE SAVED PER USER!!
export async function genSalt(length = 16){
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
}

export async function hashPW(password, salt){
    // create instance to encode/map pw to uint8array
    const enc = new TextEncoder();
    const keyMaterial = crypto.subtle.importKey(
        "raw",
        enc(password),
        {name: "PBKDF2"},
        false,
        [ deriveKey ]
    )
}