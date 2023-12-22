// Description: This file contains the logic for the chatbox
let chatBox = document.querySelector(".chatbox__support");
let sendButton = document.querySelector(".chatbox__send__button");
let restartChatButton = document.querySelector(".chatbox__restart");

let messages = [];
let drugList = [];
let userPrompts = [];
let userDrugs = [];
let currentStep = 0;
let isMessagesLoaded = false;

let userInfo = {
  "phone" : "",
  "location": "",
  "medication": []
}

const orderKeywords = [
  "i",
  "want",
  "to",
  "order",
  "buy",
  "purchase",
  "get",
  "acquire",
  "please",
  "can",
  "may",
  "need",
  "would",
  "like",
  "add",
  "place",
  "an",
  "the",
  "some",
  "a",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "give me",
  "send me",
  "get me",
  "provide me",
  "deliver",
  "send",
  "supply",
  "fetch",
  "bring",
  "deliver",
  "send over",
  "ship",
  "forward",
  "transfer",
  "dispatch",
  "hand over",
  "serve",
  "procure",
  "obtain",
  "secure",
  "receive",
  "drop off",
  "place an order for",
  "request",
  "buy me",
  "purchase",
  "order",
  "buy",
  "some",
  "purchase",
  "get",
  "acquire",
  "up",
  "pick",
  "select",
  "choose",
  "reserve",
  "book",
  "for",
  "me",
  "order",
  "buy",
  "get",
  "purchase",
  "bring",
  "behalf",
  "my",
  "on",
  "order",
  "dosage",
  "pill",
  "tablet",
  "capsule",
  "syrup",
  "liquid",
  "injection",
  "ointment",
  "ointment",
  "supplement",
  "vitamin",
  "antibiotic",
  "painkiller",
  "antacid",
  "antihistamine",
  "antiviral",
  "insulin",
  "inhaler",
  "blood pressure",
  "antidepressant",
  "anxiety",
  "allergy",
  "cough",
  "cold",
  "flu",
  "fever",
  "headache",
  "pain",
  "relief",
  "health",
  "wellness",
  "prescribe",
  "treatment",
  "hello",
  "hi",
  "hey",
  "good",
  "morning",
  "afternoon",
  "evening",
  "night",
  "how",
  "are",
  "you",
  "doing",
  "fine",
  "well",
];

sendButton.addEventListener("click", () => onSendButton(chatBox));

restartChatButton.addEventListener("click", () => restartConversation());

const inputBox = chatBox.querySelector(".chatbox__message__input");

inputBox.addEventListener("keyup", ({ key }) => {
  if (key === "Enter") {
    onSendButton(chatBox);
  }
});

function onLoadDrugs(){

  fetch('../data/test.json')
  .then(response => response.json())
  .then(data => {
    drugList = data;
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
}

async function processGreetingMessage(msgs, chatBox) {
  for (const msg of msgs) {
    messages.push(msg);
    updateChatText(chatBox, messages);
    await delay(500);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function onStart(chatbox) {
  onLoadDrugs()
  let msgs = [ 

    { 
      name: "SOS Pharma", 
      message: `Hello !!`
    },

    { name: "SOS Pharma", 
      message: `
        Welcome to SOS Pharma,
        We deliver your drugs to your door step.\n
      `
    },
    { 
      name: "SOS Pharma", 
      message: `
        Which medications do you want to order, \n 
        Please enter the name of the drug you want to order as it was prescribed without the grams.
      `
    },
    { 
      name: "SOS Pharma", 
      message: `
        Please list the medications you want to order, \n
      `
    },
  ]

  if(!isMessagesLoaded){
    processGreetingMessage(msgs, chatBox)
  }

}

async function onSendButton(chatbox) {

  let textField = chatbox.querySelector("textarea");
  let userPrompt = textField.value.trim();
  if (userPrompt === "") return;

  const userPromptLowerCase = userPrompt.toLowerCase().trim();
  const clearText = 'clear';
  const completeText = 'complete';

  switch (currentStep) {
    case 0:
      const userPrompts = userPrompt.split(/\s+|,/);
      console.log(userPrompts)
      matchUserDrugs(drugList, userPrompts);
      const medicationTableHtml = prepareMedicationTable(userDrugs);

      pushUserMessage(userPrompt);
      clearTextField(textField);

      if (userDrugs.length === 0) {
        const msg = { name: "SOS Pharma", message: " No Medication identified, please provide the list of medications you wish to order as specified by your medical personnel" };
        messages.push(msg);
        updateChatText(chatbox, messages);
        clearTextField(textField);
        return;
      }

      if (medicationTableHtml !== '') {
        pushPharmaMessage(medicationTableHtml);
      }

      pushPharmaMessage("Are your medications correct and complete ??  if not, please type CLEAR, if yes, type COMPLETE");
      await delay(500);
      currentStep++;
      break;

    case 1:
      pushUserMessage(userPrompt);

      if (userPromptLowerCase === clearText) {
        currentStep--;
        pushClearMedicationsMessage();
        userDrugs = [];
      } else if (userPromptLowerCase === completeText) {
        currentStep++;
        pushPharmaMessage("Where do you live ? (Town, Address) ");
      } else {
        pushPharmaMessage("Please reply with the above specified keywords");
        clearTextField(textField);
      }

      break;

    case 2:
      userInfo['location'] = userPrompt;
      pushUserMessage(userPrompt);
      await delay(500);
      clearTextField(textField);
      pushPharmaMessage("What is your phone number");
      currentStep++;
      break;

    case 3:
      pushUserMessage(userPrompt);
      await delay(500);

      if (!validateCameroonianPhoneNumber(userPrompt.trim())) {
        pushPhoneNumberValidationMessage();
        return;
      }

      userInfo['phone'] = userPrompt;
      const replyMessages = [
        { name: "SOS Pharma", message: "Please confirm your payment on your phone via mobile money, when you do, write CONFIRMED" },
        { name: "SOS Pharma", message: "Please note that this payment will be verified and your order will only be made if you confirm," },
        { name: "SOS Pharma", message: "Didn't receive the billing request on your phone? , type RESEND" }
      ];
      processGreetingMessage(replyMessages, chatBox);

      currentStep++;
      clearTextField(textField);
      break;

    case 4:
      pushUserMessage(userPrompt);
      await delay(500);

      if (userPromptLowerCase === 'resend') {
        pushResendBillingRequestMessage();
        clearTextField(textField);
        return;
      } else if (userPromptLowerCase === 'confirmed') {
        const replyMessages = [
          { name: "SOS Pharma", message: "Order has been placed, a call will be placed on delivery." },
          { name: "SOS Pharma", message: "Thank you so much for using and trusting SOS Pharma with your health." },
        ];
        processGreetingMessage(replyMessages, chatBox);
        clearTextField(textField);
        currentStep++;
        sendEmail();
        
      } else {
        pushPharmaMessage("Please reply with the above specified keywords");
        clearTextField(textField);
      }

      break;
    case 5:
      restartConversation();
      break;
  }

  clearTextField(textField);
}


function pushUserMessage(message) {
  messages.push({ name: "User", message });
  updateChatText(chatBox, messages);
}

function pushPharmaMessage(reply) {
  messages.push({ name: "SOS Pharma", message: reply });
  updateChatText(chatBox, messages);
}

function pushClearMedicationsMessage() {
  pushPharmaMessage("Please retype your list of medications, write only the name as prescribed by your medical doctor");
  userDrugs = [];
}

function pushPhoneNumberValidationMessage() {
  pushPharmaMessage("Please enter a valid Cameroonian phone number, it must begin with the digits 6, 2, 3, etc");
}

function pushResendBillingRequestMessage() {
  pushPharmaMessage("Billing request has been resent, please confirm");
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
          '<div class="messages__item messages__item--visitor">' +
          item.message +
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

function restartConversation() {
  const chatmessage = chatBox.querySelector(".chatbox__messages");
  chatmessage.innerHTML = "";
  messages = [];
  currentStep = 0;
  onStart();
}

function matchUserDrugs(drugs, userPrompts) {
  console.log(userPrompts)
  if (userPrompts.length === 0 || !userPrompts.some(prompt => prompt.trim() !== "")) {
    return;
  }

  for (const prompt of userPrompts) {
    if (prompt.trim() === "" || orderKeywords.includes(prompt)) {
      continue;
    }

    for (const drug of drugs) {
      const medicationName = drug.name.toLowerCase().trim();
      const searchString = prompt.toLowerCase().trim();

      if (medicationName.includes(searchString)) {
        userDrugs.push(drug);
        break;
      }
    }
  }
}

function validateCameroonianPhoneNumber(phoneNumber) {
  const cameroonianPhoneNumberPattern = /^(6|2|3)\d{8}$/;
  return cameroonianPhoneNumberPattern.test(phoneNumber);
}

onStart();

window.addEventListener('beforeunload', function(){
  localStorage.setItem('messages', JSON.stringify(messages));
});

window.addEventListener('load', function() {
  let messages = JSON.parse(localStorage.getItem('messages'));
  if (Array.isArray(messages)) {
    isMessagesLoaded = true;
    messages = messages
  } else {
    isMessagesLoaded = false;
  }
});

function prepareMedicationTable(medications) {

  let totalPrice = 0;
  let tableHtml = `
    <table id="medication-table">
      <thead>
        <tr>
          <th>Medication Name</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
  `;

  medications.forEach((medication) => {
    const medicationName = medication.name;
    const medicationPrice = medication.cm_price;
    totalPrice += medicationPrice;

    tableHtml += `
      <tr>
        <td>${medicationName}</td>
        <td>XAF${medicationPrice}</td>
      </tr>
    `;
  });

  tableHtml += `
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" id="total-price">Total Price: ${totalPrice}</td>
        </tr>
      </tfoot>
    </table>
  `;

  return tableHtml;
}
