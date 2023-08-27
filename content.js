const strength = 0.4

function boldTextInNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        // Check if the node has actual visible text
        if (/\S/.test(node.nodeValue)) {
            const wrapper = document.createElement('span');
            wrapper.innerHTML = node.nodeValue.replace(/\b(\w+)\b/g, function (match, word) {
                const boldLength = Math.ceil(word.length * strength);
                return `<strong class="bionic-bold">${word.substring(0, boldLength)}</strong>${word.substring(boldLength)}`;
            });
            node.replaceWith(wrapper);
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        // If it's an element node, iterate over its children
        for (let child of node.childNodes) {
            boldTextInNode(child);
        }
    }
}

// Function to check if the domain is in the CSV list
function isDomainInList(domain, list) {
    return list.includes(domain);
}

// Fetch and parse the CSV list
fetch(chrome.runtime.getURL('whitelist.csv'))
    .then(response => response.text())
    .then(text => {
        const blockedDomains = text.split(',').map(domain => domain.trim());

        // Get the current tab's domain
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const url = new URL(tabs[0].url);
            const domain = url.hostname;

            if (!isDomainInList(domain, blockedDomains)) {
                // If the domain is not in the list, run the extension logic
                boldTextInNode(document.body);
            }
        });
    });