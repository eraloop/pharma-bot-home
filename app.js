// Description: This file contains the logic for the chatbox
let chatBox = document.querySelector(".chatbox__support");
let sendButton = document.querySelector(".chatbox__send__button");
let restartChatButton = document.querySelector(".chatbox__restart");

// this is the list of messages in the chatbox
let messages = [];
// this is the drug list loaded from the json file
let drugList = [];
// this is the list of drugs the user has typed
let userPrompts = [];
// this is the list of drugs the user wants to order
let userDrugs = [];
// this is the step of the conversation
let currentStep = 0;
let isMessagesLoaded = false;
// this is the list of drugs and their weights
let userDrugPlusWeight = [];
// this is the total cost of the order
let updatedDrugObjects = [];
// some standard order keywords to filter out when the user places their order request.
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

// get refrence to the html elements relevant to the js file
sendButton.addEventListener("click", () => onSendButton(chatBox));
restartChatButton.addEventListener("click", () => restartConversation());
const inputBox = chatBox.querySelector(".chatbox__message__input");

// tracks the enter key on the input box so as to submit the text inside
inputBox.addEventListener("keyup", ({ key }) => {
  if (key === "Enter") {
    onSendButton(chatBox);
  }
});

// onload drugs method loads the drugs from the product.json file or the test.json file
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

// this fuction starts the conversation, 
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
        Please list the medications you want to order as prescribed by your medical doctor.\n
      `
    },

  ]
  processGreetingMessage(msgs, chatBox)
}

// helper function to push user message on the chatbox
function pushUserMessage(message) {
  messages.push({ name: "User", message });
  updateChatText(chatBox, messages);
}

// proccesses the greeting message and other subsequent messages if its more than one
async function processGreetingMessage(msgs, chatBox) {
  for (const msg of msgs) {
    messages.push(msg);
    updateChatText(chatBox, messages);
  }
}

// this function handles all the user request like when ever the user submits a message
async function onSendButton(chatbox) {

  let textField = chatbox.querySelector("textarea");
  let userPrompt = textField.value.trim();
  if (userPrompt === "") return;

  const userPromptLowerCase = userPrompt.toLowerCase().trim();
  const clearText = 'clear';
  const completeText = 'complete';
  const replyYes = 'yes';
  const replyNo = 'no';

  switch (currentStep) {

    // this case handles the user medication input.
    case 0:

      pushUserMessage(userPrompt);
      clearTextField(textField)

      if(userPrompt == 'done' && userDrugs.length == 0){
        pushPharmaFeedbackMessages("medications")
        return;
      }

      const userPrompts = userPrompt.split(/\s+|,/);
      matchUserDrugs(drugList, userPrompts, orderKeywords);
      console.log(userDrugs)

      while (userPrompt !== 'done') {
        pushPharmaFeedbackMessages('medications')
        break;
        
        const medicationTableHtml = prepareMedicationTable(userDrugs);
        pushUserMessage(userPrompt);
        clearTextField(textField);

        if (userDrugs.length === 0) {
          pushPharmaFeedbackMessages('no-medication')
          return;
        }
  
        // if (medicationTableHtml !== '') {
        //   pushPharmaMessage(medicationTableHtml);
        // }

        // userDrugs.push(userPrompt);
        // console.log("user drugs",userDrugs);
        // console.log("inside while loop");
        
      }

      pushPharmaFeedbackMessages('medications-complete')      
      currentStep++;
      break;

    case 1:

      pushUserMessage(userPrompt);
      clearTextField(textField);

      if (userPromptLowerCase === clearText) {

        currentStep--;
        pushPharmaFeedbackMessages('medications')
        userDrugs = [];
        
      } else if (userPromptLowerCase === completeText) {
        currentStep++;
        pushPharmaMessage("Provide the grams or milligrams of each medication as it's found on the table above e.g 20g, 50mg, 100mg, etc");
      } else {
        pushPharmaFeedbackMessages('keywords')
      }

      break;

    case 2: 

      pushUserMessage(userPrompt);
      const drugWeights = userPrompt.split(/,/);

      for (let i = 0; i < userDrugs.length && i < drugWeights.length; i++) {
        const drugObject = {
          name: userDrugs[i]['name'],
          price: userDrugs[i]['cm_price'],
          weight: drugWeights[i],
        };
        userDrugPlusWeight.push(drugObject);
      }
      
      pushPharmaMessage("What is the quantity of each medication you want to order, enter in order of the table above e.g 2, 3, 4, etc ");
      currentStep++;
      clearTextField(textField);
      break;

    case 3:

      pushUserMessage(userPrompt);
      const drugQtn = userPrompt.split(/,/);
      let totalCost = 0;

      for (let i = 0; i < userDrugPlusWeight.length && i < drugQtn.length; i++) {

        const drugObject = userDrugPlusWeight[i];
        const quantity = drugQtn[i];
        const cost = quantity * drugObject['price'];
        totalCost += cost;

        // Create an updated object with quantity and cost
        const updatedObject = {
          name: drugObject.name,
          weight: drugObject.weight,
          price: drugObject.price,
          quantity: quantity,
        };

        updatedDrugObjects.push(updatedObject);
      }

      const statsHtml = prepareMedicationDataTable(updatedDrugObjects, totalCost)
      if (statsHtml !== '') {
        pushPharmaMessage(statsHtml);
      }

      pushPharmaMessage("Do you want to continue ? if yes, type YES, if no, type NO");
      currentStep ++ ;
      clearTextField(textField);
      break;

    case 4:
      pushUserMessage(userPrompt);
      clearTextField(textField);

      if (userPromptLowerCase === replyNo) {
        currentStep--;
        currentStep--;
      } else if (userPromptLowerCase === replyYes) {
        currentStep++;
        pushPharmaMessage("Where do you live ? (Town, Address) ");
      } else {
        pushPharmaFeedbackMessages('keywords')
      }

    case 4:

      pushUserMessage(userPrompt);
      clearTextField(textField);

      pushPharmaMessage("What is your phone number");
      currentStep++;
      break;

    case 5:
      pushUserMessage(userPrompt);
      
      const isValid = validateCameroonianPhoneNumber(userPrompt.trim())
      if (!isValid['isValid']) {
        pushPharmaFeedbackMessages('phone')
        return;
      }

      const replyMessages = [
        { name: "SOS Pharma", message: "Please confirm your payment on your phone via mobile money, when you do, write CONFIRMED" },
        { name: "SOS Pharma", message: "Please note that this payment will be verified and your order will only be made if you confirm," },
        { name: "SOS Pharma", message: "Didn't receive the billing request on your phone? , type RESEND" }
      ];
      processGreetingMessage(replyMessages, chatBox);

      currentStep++;
      clearTextField(textField);
      break;

    case 6:
      pushUserMessage(userPrompt);
      clearTextField(textField);

      if (userPromptLowerCase === 'resend') {
        pushPharmaFeedbackMessages('resend-billing-request')
        return;
      } else if (userPromptLowerCase === 'confirmed') {
        const replyMessages = [
          { name: "SOS Pharma", message: "Order has been placed, a call will be placed on delivery." },
          { name: "SOS Pharma", message: "Thank you so much for using and trusting SOS Pharma with your health." },
        ];
        processGreetingMessage(replyMessages, chatBox);
        // clearTextField(textField);
        currentStep++;
        // sendEmail();
        
      } else {
        pushPharmaFeedbackMessages('keywords')
        // pushPharmaMessage("Please reply with the above specified keywords");
        // clearTextField(textField);
      }

      break;
    case 7:
      restartConversation();
      break;
  }

  clearTextField(textField);
}

function restartConversation() {
  const chatmessage = chatBox.querySelector(".chatbox__messages");
  chatmessage.innerHTML = "";
  messages = [];
  currentStep = 0;
  userDrugs = [];
  userPrompts = [];
  userDrugPlusWeight = [];
  updatedDrugObjects = [];
  onStart();
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

// helper function to push pharma message on the chatbox
function pushPharmaMessage(reply) {
  messages.push({ name: "SOS Pharma", message: reply });
  updateChatText(chatBox, messages);
}

// helper function to help display bot feedback messages, 
function pushPharmaFeedbackMessages(currentCase) {
  switch(currentCase){
      case "phone":
          pushPharmaMessage("Please enter a valid Cameroonian phone number, it must begin with the digits 6, 2, 3, etc");
          break;
      case "medications":
          pushPharmaMessage("Please retype your list of medications, write only the name as prescribed by your medical doctor");
          break;
      case "medications-complete":
          pushPharmaMessage("Are your medications correct and complete ??  if not, please type CLEAR, if yes, type COMPLETE");
          break;
      case "resend-billing-request":
          pushPharmaMessage("Billing request has been resend, please confirm");
          break;
      case "no-medication": 
          pushPharmaMessage("No Medication identified, please provide the list of medications you wish to order as specified by your medical personnel")
          break;
      case "keywords": 
          pushPharmaMessage("Please reply with the above specified keywords")
          break;
      case "input": 
          pushPharmaMessage("Please reply with the above specified keywords")
          break;
      default:
          pushPharmaMessage("Invalid input, please retype your request");
          break;
  }

}

