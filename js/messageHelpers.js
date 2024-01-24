
function pushPharmaMessage(reply) {
  messages.push({ name: "SOS Pharma", message: reply });
  updateChatText(chatBox, messages);
  inputBox.focus();
}
  
async function pushThinkingMessage(message) {
  if(messages.length !== 0) return;
  pushPharmaMessage(getTranslation(message))
  await new Promise((resolve) => setTimeout(resolve, 2000));
  messages.pop();
}

function pushUserMessage(message) {
    messages.push({ name: "User", message });
    updateChatText(chatBox, messages);
    inputBox.focus();
}

// helper function to help display bot feedback messages,
function pushPharmaFeedbackMessages(currentCase) {
    switch (currentCase) {
      case "phone":
        pushPharmaMessage(getTranslation("phone"));
        break;
  
      case "phone-enter":
        pushPharmaMessage(getTranslation("phone-enter"));
        break;
  
      case "drug-quantity":
        pushPharmaMessage(getTranslation("drug-quantity"));
        break;
      case "city":
        pushPharmaMessage(getTranslation("city"));
        break;
      case "quarter":
        pushPharmaMessage(getTranslation("quarter"));
        break;
      case "prescribtion-type":
        pushPharmaMessage(getTranslation("prescribtion-type"));
        break;
      case "medications":
        pushPharmaMessage(getTranslation("medications"));
        break;
      case "medications-complete":
        pushPharmaMessage(getTranslation("medications-complete"));
        break;
      case 'resend-billing-request':
        pushPharmaMessage(getTranslation("resend-billing-request"));
        break;
      case 'billing-request-followup':
        pushPharmaMessage(getTranslation("billing-request-followup"));
        break;
      case 'billing-failed':
          pushPharmaMessage(getTranslation("billing-failed"));
          break;
      case 'no-medication':
        pushPharmaMessage(getTranslation("no-medication"));
        break;
      case 'keywords':
        pushPharmaMessage(getTranslation("keywords"));
        break;
      case 'input':
        pushPharmaMessage(getTranslation("input"));
        break;
      case 'more-meds':
        pushPharmaMessage(getTranslation("more-meds"));
        break;
      case 'drug-found':
        pushPharmaMessage(getTranslation("drug-found"));
        break;
      case 'choose-drug':
        pushPharmaMessage(getTranslation("choose-drug"));
        break;
      case 'drug-search-complaint':
        pushPharmaMessage(getTranslation("drug-search-complaint"));
        break;
      case 'meds-empty':
        pushPharmaMessage(getTranslation("meds-empty"));
        break;
      case 'order-failed':
        pushPharmaMessage(getTranslation("order-failed"));
        break;
      case 'placing-order':
        pushPharmaMessage(getTranslation("placing-order"));
        break;
      case 'order-sent':
        pushPharmaMessage(getTranslation("order-sent"));
        break;
      case 'confirm-payment':
        pushPharmaMessage(getTranslation("confirm-payment"));
        break;
      case 'identity':
          pushPharmaMessage(getTranslation("identity"));
        break;
      case 'proccessing-payment':
          pushPharmaMessage(getTranslation("billing"));
        break;
      case 'drugs-cleared':
        pushPharmaMessage(getTranslation("drugs-cleared"));
        break;
      default:
        pushPharmaMessage(getTranslation("default"));
        break;
    }
}

