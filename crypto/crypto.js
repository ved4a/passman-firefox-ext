"use strict";

// generate random salt, 16 bits
// THIS WILL BE SAVED PER USER!!
export async function genSalt(length = 16){
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
}

console.log(genSalt(16))