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

// Start the processing with the body of the document
boldTextInNode(document.body);
