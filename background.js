console.log("Background service worker loaded.");

// let blockedDomains = [];

// fetch(chrome.runtime.getURL('blocklist.csv'))
//     .then(response => response.text())
//     .then(data => {
//         blockedDomains = data.split(/\r\n|\n/).map(domain => domain.trim()).filter(domain => domain.length > 0);
//         console.log(`Loaded ${blockedDomains.length} domains to block.`);
//     });

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     console.log(`Received message: ${message.action}`)
//     if (message.action === "isDomainBlocked") {
//         console.log(`Checking if ${message.domain} is blocked.`);
//         sendResponse({ isBlocked: blockedDomains.includes(message.domain) });
//     }
// });
