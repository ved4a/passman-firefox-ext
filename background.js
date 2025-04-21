"use strict";

browser.runtime.onStartup.addListener(() => {
    console.log("Extension started");
  });
  
  browser.runtime.onInstalled.addListener(() => {
    console.log("Installed extension");
  });
  