console.log("Background service worker loaded.");

// Variables to store the disabled websites list and the pause state
let blocklist = [];
let isPausedForSession = false;

// Message listener for popup actions
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "disable_for_website") {
    // Get the current tab's URL
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      let url = new URL(tabs[0].url);
      let domain = url.hostname;

      // Get the current list of disabled websites from the storage
      chrome.storage.local.get(["blocklist"], function (result) {
        blocklist = result.blocklist || [];

        // Check if the domain is already in the list
        let domainIndex = blocklist.indexOf(domain);
        if (domainIndex !== -1) {
          console.log("Website already blocked... unblocking");
          // If the domain is in the list, remove it to unblock
          blocklist.splice(domainIndex, 1);
          sendResponse({ message: "Website unblocked successfully" });
        } else {
          console.log("Website not blocked... blocking");
          // If the domain is not in the list, add it to block
          blocklist.push(domain);
          sendResponse({ message: "Website blocked successfully" });
        }

        // Save the updated list back to the storage
        chrome.storage.local.set({ blocklist: blocklist }, function () {
          // Reload the current tab
          chrome.tabs.reload(tabs[0].id);
        });
      });
    });
    return true;
  } else if (request.action === "pause_for_session") {
    // Toggle the pause state
    isPausedForSession = !isPausedForSession;
    console.log("Updated pause state to: " + isPausedForSession);
    // Get the current tab and reload it
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.reload(tabs[0].id);
      sendResponse({ message: "Extension paused for this session" });
    });
    return true;
  } else if (request.action === "get_domain_status") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      let url = new URL(tabs[0].url);
      let domain = url.hostname;

      chrome.storage.local.get(["blocklist"], function (result) {
        let disabledWebsites = result.blocklist || [];
        sendResponse({ isBlocked: disabledWebsites.includes(domain) });
      });
    });
    return true;
  } else if (request.action === "check_paused_status") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      sendResponse({
        isPaused: isPausedForSession,
      });
    });
    return true;
  }
});
