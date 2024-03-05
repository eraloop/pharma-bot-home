
function pushPharmaMessage(reply) {
  messages.push({ name: "SOS Pharma", message: reply });
  updateChatText(chatBox, messages);
  inputBox.focus();
}

async function pushSetupMessage() {
  pushPharmaMessage("Mise en place, veuillez patienter un instant..");
  locations = await onLoadCities();
  drugList = await onLoadDrugs();
  if (drugList.length == 0) {
    pushPharmaMessage(getTranslation("network-error"));
    disableTextarea(inputBox);
    return;
  }
  locale = await getUserLocale();
  await setLocale(locale);
  await Promise.all([locations, drugList, locale]);
  await new Promise(resolve => {setTimeout(() => {resolve();}, 1000);});
  messages.pop();
}


function pushUserMessage(message) {
  messages.push({ name: "User", message });
  updateChatText(chatBox, messages);
  inputBox.focus();
}


function clearTextField(textField) {
  textField.value = "";
}

function updateChatText(chatbox, messages) {
  var html = "";
  messages
    .slice()
    .reverse()
    .forEach(function (item, index) {
      if (item.name === "SOS Pharma") {
        html +=
          '<div class="sos-pharma-message"> ' +
          '<div class="profile-icon">' +
          '<img src="/images/new_logo.jpg" alt="Profile Icon" height="25">' +
          "</div>" +
          '<div class="messages__item messages__item--visitor">' +
          '<div class="message-bubble">' +
            item.message +
          "</div>" +
          "</div>" +
          "</div>";
      } else {
        html +=
          '<div class="messages__item messages__item--operator">' +
          item.message +
          "</div>";
      }
    });

  const chatmessage = chatbox.querySelector(".chatbox__messages");
  chatmessage.innerHTML = html;
  
}
