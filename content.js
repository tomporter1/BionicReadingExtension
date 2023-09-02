const strength = 0.4;

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

//get list of blocked domains from included csv file
const blockedDomains = [];

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

fetch(chrome.runtime.getURL("blocklist.csv"))
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.text();
    })
    .then(data => {
        const lines = data.split(/\r\n|\n/);
        lines.forEach(line => {
            blockedDomains.push(line);
        });
        console.log(`Loaded ${blockedDomains.length} domains to block.`);

        // Call the function after blocklist is loaded
        checkDomainAndRunExtension();
    })
    .catch(error => {
        console.log("Fetch error: " + error);
    });

// MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            for (let addedNode of mutation.addedNodes) {
                boldTextInNode(addedNode);
            }
        }
    }
});

// Start observing the entire document with the configured parameters
observer.observe(document, { childList: true, subtree: true });
