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

// console.log("Sending message to background script");
// chrome.runtime.sendMessage({ action: "isDomainBlocked", domain: window.location.hostname }, (response) => {
//     console.log("Received response:", response);
//     if (!response.isBlocked) {
//         boldTextInNode(document.body);
//     }
// });

// Function to check if the domain is in the CSV list
function isDomainInList(domain, list) {
    return list.includes(domain);
}

//get list of blocked domains from included csv file
const blockedDomains = [];
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
    })
    .catch(error => {
        console.log("Fetch error: " + error);
    });

var domain = window.location.hostname;

if (!isDomainInList(domain, blockedDomains)) {
    console.log(`${domain} not in list.. running extension`);
    // If the domain is not in the list, run the extension logic
    boldTextInNode(document.body);
}