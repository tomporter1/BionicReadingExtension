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
					//if work is not any punctuation
					if (word.match(/^\w+$/)) {
						const boldLength = Math.ceil(word.length * strength);
						return `<strong class="bold">${word.substring(
							0,
							boldLength
						)}</strong>${word.substring(boldLength)}`;
					}
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

// Function to check whether the current website is disabled or the extension is paused
function checkPauseStatus(callback) {
	chrome.runtime.sendMessage(
		{ action: "check_paused_status" },
		function (response) {
			callback(response);
		}
	);
}

function checkDomainStatus(callback) {
	chrome.runtime.sendMessage(
		{ action: "get_domain_status" },
		function (response) {
			callback(response);
		}
	);
}

// Modified function to apply the bold effect only if the website is not disabled and the extension is not paused
function applyBoldEffect() {
	checkPauseStatus(function (status) {
		if (!status.isPaused) {
			checkDomainStatus(function (blockedStatus) {
				if (!blockedStatus.isBlocked) {
					console.log(
						`BionicReading: ${blockedStatus.domain} not in list.. running bionic reading`
					);
					// If the domain is not in the list, run the extension logic
					boldTextInNode(document.body);

					// Start observing the entire document with the configured parameters
					observer.observe(document, {
						childList: true,
						subtree: true,
					});
				} else {
					console.log(
						`BionicReading: ${blockedStatus.domain} in list.. not running bionic reading`
					);
				}
			});
		} else {
			console.log(
				"BionicReading: Extension paused, not running bionic reading"
			);
		}
	});
}

// Call the modified function to apply the bold effect
applyBoldEffect();
