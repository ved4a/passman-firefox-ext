"use strict";

let lockTimeout;

export function startAutoLock(callback, minutes = 10){
    clearTimeout(lockTimeout);
    lockTimeout = setTimeout(() => {
        callback();
    }, minutes * 60 * 1000);
}

export function resetAutoLock(callback, minutes = 10){
    startAutoLock(callback, minutes);
}