var strength = 0.4;
var blockedDomains = [];

/**
 * Bold the text in a given node.
 * @param {Node} node - The node to process.
 */
function boldTextInNode(node) {
  //null check on node
  if (!node) {
    return;
  }
  if (
    node.nodeType === Node.TEXT_NODE &&
    node.parentNode &&
    node.parentNode.classList &&
    !node.parentNode.classList.contains("bionic-processed")
  ) {
    // Check if the node has actual visible text
    if (/\S/.test(node.nodeValue)) {
      const wrapper = document.createElement("span");
      wrapper.className = "bionic-processed";
      wrapper.innerHTML = node.nodeValue.replace(
        /\b(\w+)\b/g,
        function (match, word) {
          const boldLength = Math.ceil(word.length * strength);
          return `<strong class="bionic-bold">${word.substring(
            0,
            boldLength
          )}</strong>${word.substring(boldLength)}`;
        }
      );
      node.replaceWith(wrapper);
    }
  } else if (
    node.nodeType === Node.ELEMENT_NODE &&
    node.parentNode &&
    node.parentNode.classList &&
    !node.classList.contains("bionic-processed")
  ) {
    // If it's an element node, iterate over its children
    for (let child of node.childNodes) {
      boldTextInNode(child);
    }
  }
}

/**
 * Checks if a given domain is present in a list of domains.
 * @param {string} domain - The domain to check.
 * @param {string[]} list - The list of domains to check against.
 * @returns {boolean} - True if the domain is present in the list, false otherwise.
 */
function isDomainInList(domain, list) {
  return list.includes(domain);
}

function checkDomainAndRunExtension() {
  var domain = window.location.hostname.replace("www.", "");

  if (!isDomainInList(domain, blockedDomains)) {
    console.log(
      `BionicReading: ${domain} not in list.. running bionic reading`
    );
    // If the domain is not in the list, run the extension logic
    boldTextInNode(document.body);

    // Start observing the entire document with the configured parameters
    observer.observe(document, { childList: true, subtree: true });
  } else {
    console.log(
      `BionicReading: ${domain} in list.. not running bionic reading`
    );
  }
}

// MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutationsList, observer) => {
  var addedNodes = [];
  for (let mutation of mutationsList) {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      for (let addedNode of mutation.addedNodes) {
        addedNodes.push(addedNode);
      }
    }
  }

  if (addedNodes.length > 0) {
    //console.log(`BionicReading: Mutation detected, bolding text in ${addedNodes.length} added nodes.`);
    for (let node of addedNodes) {
      boldTextInNode(node);
    }
  }
});

chrome.storage.local.get(["strength", "blocklist"], function (result) {
  strength = result.strength || 0.4; // Default to 0.4
  blockedDomains = result.blocklist || [];

  // console.log(
  //   `BionicReading: Loaded ${blockedDomains.length} domains to block.`
  // );
  // console.log(`BionicReading: Strength: ${strength}`);
  // console.log(
  //   `BionicReading: result.strength: ${result.strength}, result.blocklist: ${result.blocklist}`
  // );

  if (!result.strength || !result.blocklist) {
    // console.log("No settings found in storage, saving defaults.");
    chrome.storage.local.set({
      strength: strengthValue,
      blocklist: blocklistValue,
    });
  }

  checkDomainAndRunExtension();
});

// Function to check whether the current website is disabled or the extension is paused
function checkWebsiteStatus(callback) {
  chrome.runtime.sendMessage(
    { action: "check_website_status" },
    function (response) {
      callback(response);
    }
  );
}

// Modified function to apply the bold effect only if the website is not disabled and the extension is not paused
function applyBoldEffect() {
  checkWebsiteStatus(function (status) {
    if (!status.isDisabled && !status.isPaused) {
      // Original bold effect code (integrated)
      var domain = window.location.hostname.replace("www.", "");

      if (!isDomainInList(domain, blockedDomains)) {
        console.log(
          `BionicReading: ${domain} not in list.. running bionic reading`
        );
        // If the domain is not in the list, run the extension logic
        boldTextInNode(document.body);

        // Start observing the entire document with the configured parameters
        observer.observe(document, { childList: true, subtree: true });
      } else {
        console.log(
          `BionicReading: ${domain} in list.. not running bionic reading`
        );
      }
    }
  });
}

// Call the modified function to apply the bold effect
applyBoldEffect();
