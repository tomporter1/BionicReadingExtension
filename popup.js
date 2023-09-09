document.getElementById("saveSettings").addEventListener("click", function () {
  const strengthValue = document.getElementById("strength").value;
  const blocklistValue = document.getElementById("blocklist").value.split(",");

  console.log(`Setting strength to : ${strengthValue}`);

  // Save to Chrome storage
  chrome.storage.local.set(
    {
      strength: strengthValue,
      blocklist: blocklistValue,
    },
    function () {
      alert("Settings saved.");
    }
  );
});

// Load saved settings when the popup opens or set default values if they don't exist
chrome.storage.local.get(["strength", "blocklist"], function (result) {
  // If values are found in storage, use them, otherwise use defaults
  const strengthValue = result.strength || 0.4;
  const blocklistValue = result.blocklist || [];

  document.getElementById("strength").value = strengthValue;
  //document.getElementById("blocklist").value = blocklistValue.join(",");

  // If the values were not found in storage (i.e., defaults were used), save the defaults
  if (!result.strength || !result.blocklist) {
    chrome.storage.local.set({
      strength: strengthValue,
      blocklist: blocklistValue,
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Get the button element
  let toggleButton = document.getElementById("disable-for-website");

  // Get the status of the current domain and set the button label accordingly
  chrome.runtime.sendMessage(
    { action: "get_domain_status" },
    function (response) {
      if (response.isBlocked) {
        toggleButton.textContent = "Enable for This Website";
      } else {
        toggleButton.textContent = "Disable for This Website";
      }
    }
  );

  document
    .getElementById("disable-for-website")
    .addEventListener("click", function () {
      chrome.runtime.sendMessage(
        { action: "disable_for_website" },
        function (response) {
          console.log(response.message);
        }
      );
    });

  document
    .getElementById("pause-for-session")
    .addEventListener("click", function () {
      chrome.runtime.sendMessage(
        { action: "pause_for_session" },
        function (response) {
          console.log(response.message);
        }
      );
    });
});
