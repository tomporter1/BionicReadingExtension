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
    if (node.nodeType === Node.TEXT_NODE && node.parentNode && node.parentNode.classList && !node.parentNode.classList.contains('bionic-processed')) {
        // Check if the node has actual visible text
        if (/\S/.test(node.nodeValue)) {
            const wrapper = document.createElement('span');
            wrapper.className = 'bionic-processed';
            wrapper.innerHTML = node.nodeValue.replace(/\b(\w+)\b/g, function (match, word) {
                const boldLength = Math.ceil(word.length * strength);
                return `<strong class="bionic-bold">${word.substring(0, boldLength)}</strong>${word.substring(boldLength)}`;
            });
            node.replaceWith(wrapper);
        }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.parentNode && node.parentNode.classList && !node.classList.contains('bionic-processed')) {
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
        console.log(`${domain} not in list.. running bionic reading`);
        // If the domain is not in the list, run the extension logic
        boldTextInNode(document.body);
    }
    else {
        console.log(`${domain} in list.. not running bionic reading`);
    }
}

// MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutationsList, observer) => {
    var addedNodes = []
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            for (let addedNode of mutation.addedNodes) {
                addedNodes.push(addedNode);
            }
        }
    }

    if (addedNodes.length > 0) {
        //console.log(`Mutation detected, bolding text in ${addedNodes.length} added nodes.`);
        for (let node of addedNodes) {
            boldTextInNode(node);
        }
    }
});

chrome.storage.local.get(['strength', 'blocklist'], function (result) {
    strength = result.strength || 0.4;  // Default to 0.4    
    blockedDomains = result.blocklist || [];

    console.log(`Loaded ${blockedDomains.length} domains to block.`);
    console.log(`Strength: ${strength}`);
    console.log(`result.strength: ${result.strength}, result.blocklist: ${result.blocklist}`);

    if (!result.strength || !result.blocklist) {
        console.log('No settings found in storage, saving defaults.');
        chrome.storage.local.set({
            'strength': strengthValue,
            'blocklist': blocklistValue
        });
    }

    // Start observing the entire document with the configured parameters
    observer.observe(document, { childList: true, subtree: true });

    checkDomainAndRunExtension();
});
