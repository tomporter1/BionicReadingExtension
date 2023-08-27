function boldTextInNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        // Check if the node has actual visible text
        if (/\S/.test(node.nodeValue)) {
            const wrapper = document.createElement('span');
            wrapper.innerHTML = node.nodeValue.replace(/\b(\w{1,2})/g, '<strong>$1</strong>');
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
