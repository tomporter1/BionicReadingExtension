console.log("Background service worker loaded.");

// chrome.runtime.onInstalled.addListener(() => {
//     const defaultWhitelist = [];
//     chrome.storage.sync.set({ whitelist: defaultWhitelist });
// });


// chrome.storage.sync.get("whitelist", (result) => {
//     const blockedDomains = result.whitelist;

//     chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//         const url = new URL(tabs[0].url);
//         const domain = url.hostname;


//         if (!isDomainInList(domain, blockedDomains)) {
//             // If the domain is not in the list, run the extension logic
//             boldTextInNode(document.body);
//         }
//     })
// });
