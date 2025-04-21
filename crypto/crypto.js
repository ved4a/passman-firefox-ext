"use strict";

// generate random salt, 16 bits
// THIS WILL BE SAVED PER USER!!
export async function genSalt(length = 16){
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
}

// turn master pw & salt into usable AES key
// everytime user logs in, same key generated w/o storing raw pw
export async function hashPW(password, salt){
    // create instance to encode/map pw to uint8array
    const enc = new TextEncoder();
    const keyMaterial = crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        {name: "PBKDF2"},
        false,
        [ "deriveKey" ]
    );

    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode(salt),
            iterations: 10000, // slow down brute force
            hash: "SHA-256" // base hash function
        },
        keyMaterial,
        { name: "AES-GCM", length: 256},
        false,
        ["encrypt", "decrypt"]
    )
    return derivedKey;
}

export async function encryptData(data, key){
    // gen random init vector: 12 bytes
    const init_v = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);

    // encrypt w/ AES-GCM
    const ciphertext = await crypto.subtle.encrypt(
        {name : "AES-GCM", init_v},
        key,
        encoded
    );

    // init vector and encrypted data encoded in base64 to store
    return {
        iv: btoa(String.fromCharCode(...iv)),
        data: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
    };
}

export async function decryptData(encrypted, key){
    // map each Base64 character in init_v, data back to elements of Uint8Arrays
    const init_v = new Uint8Array(atob(encrypted.init_v).split('').map(c => c.charCodeAt(0)));
    const data = new Uint8Array(atob(encrypted.data).split('').map(c => charCodeAt(0)));

    // decrypts using AES-GCM
    const decrypted = await crypto.subtle.decrypt(
        {name: "AES-GCM", init_v},
        key,
        data
    );

    return new TextDecoder().decode(decrypted);
}