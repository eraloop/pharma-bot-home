// Description: This file contains the logic for the chatbox
let chatBox = document.querySelector(".chatbox__support");
let sendButton = document.querySelector(".chatbox__send__button");
let restartChatButton = document.querySelector(".chatbox__restart");
// butttons for chat interaction.
let doneButton = document.querySelector(".done-button");
let paymentConfirmButton = document.querySelector(".payment-confirm-button");
let resendButton = document.querySelector(".chatbox__restart");
let completeButton = document.querySelector(".chatbox__restart");
let clearButton = document.querySelector(".chatbox__restart");

let messages  = [], drugList = [], userPrompts = [], userDrugs  = [], userDrugPlusWeight = [], updatedDrugObjects = [], selectedSearchedDrugs = [];
// this is the step of the conversation
let currentStep = 0;
let isMessagesLoaded = false;
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
// tracks if a user drug is found
let isDrugFound = false;
// payment info data
let paymentInfo = {}, userInfo = {};
// this variable tracks if the user is supposed ti select a drug from a suggested list
let isWaitingForOptions = false;
// get refrence to the html elements relevant to the js file
sendButton.addEventListener("click", () => onSendButton(chatBox));
restartChatButton.addEventListener("click", () => restartConversation());
const inputBox = chatBox.querySelector(".chatbox__message__input");
const messageContainer = document.getElementById("chatbox__messages");

messageContainer.addEventListener('click', function(event) {

  const target = event.target;
  if (target.classList.contains('med-complete-button')) {
    completeMedList()
  }else if(target.classList.contains('med-clear-button')){
    clearMedicationList()
  }else if(target.classList.contains('list-clear-button')){
    restartConversation();
  }else if(target.classList.contains('payment-confirmed-button')){
    confirmedPayment();
  }else if(target.classList.contains('payment-resend-button')){
    resendPayment();
  }else if(target.classList.contains('med-done-button')){
    medicationDone();
  }

});

// tracks the enter key on the input box so as to submit the text inside
inputBox.addEventListener("keyup", ({ key }) => {
  if (key === "Enter") {
    onSendButton(chatBox);
  }
});

function medicationDone(){
  let totalCost = 0;
  selectedSearchedDrugs.forEach((currentDrug) => {
    totalCost += currentDrug.price;
  });
  const medicationTableHtml = prepareMedicationDataTable(
    selectedSearchedDrugs,
    totalCost
  );
  pushPharmaMessage(medicationTableHtml);
  pushPharmaFeedbackMessages("medications-complete");
  currentStep++;
}

function clearMedicationList(){
  selectedSearchedDrugs = [];
  pushPharmaFeedbackMessages("medications");
  currentStep = 0;
}

function completeMedList(){
  pushPharmaFeedbackMessages("identity");
  currentStep++;
}

async function confirmedPayment(){
  pushPharmaFeedbackMessages("placing-order");
  disableTextarea(inputBox);

  let response = await sendMail(selectedSearchedDrugs, userInfo);
  if (!response) {
    pushPharmaFeedbackMessages("order-failed");
    enableTextarea(inputBox);
    return;
  }else{
    pushPharmaFeedbackMessages("order-sent");
    pushPharmaMessage("Your drugs will ne delivered to you in the next one hour.")
    return;
  }

}

function resendPayment(){
  pushPharmaFeedbackMessages("resend-billing-request");
  pushPharmaFeedbackMessages("billing-request-followup");
}

async function onStart(chatbox) {
  response = await loadExcel();
  drugList = response["drugs"];
  let drugLoaded = response["isLoaded"];
  console.log(drugList);
  console.log(drugLoaded);
  paymentInfo = await onLoadPaymentDetails();
  await pushThinkingMessage();

  if (!drugLoaded) {
    let greeting = {
      name: "SOS Pharma",
      message: `Network error <br> Failed to load required resources <br>Please check your internet connection and refresh the page`,
    };
    messages.push(greeting);
    updateChatText(chatBox, messages);
    disableTextarea(inputBox);
    return;
  }
  let greeting = {
    name: "SOS Pharma",
    message: `Hello <br> Welcome to SOS Pharma <br> Please which medications would you like to order today?`,
  };
  messages.push(greeting);
  updateChatText(chatBox, messages);
}

// helper function to push user message on the chatbox
function pushUserMessage(message) {
  messages.push({ name: "User", message });
  updateChatText(chatBox, messages);
  inputBox.focus();
}

async function onSendButton(chatbox) {

  let textField = chatbox.querySelector("textarea");
  let userPrompt = textField.value.toLowerCase().trim();
  if (userPrompt === "") return;

  let drugSearchComplaint = false;
  let searchResults = {};

  pushUserMessage(userPrompt);
  clearTextField(textField);

  switch (currentStep) {
    case 0:
      if (userPrompt !== "done") {
        if (!isWaitingForOptions) {
          // splits user input and searches for user drug in the drugs array.
          isDrugFound = false;
          const userPrompts = userPrompt.split(/\s+|,/);
          searchResults = matchUserDrugs(drugList, userPrompts, orderKeywords);
          userDrugs = searchResults["userDrugs"];
          isDrugFound = searchResults["isDrugFound"];
          drugSearchComplaint = searchResults["drugSearchComplaint"];
          // checks if any drug is found,
          if (!isDrugFound) {
            pushPharmaFeedbackMessages("drug-found");
            return;
          }

          // displays the drug options found on a table for the user to select the right one.
          const medicationTableHtml = prepareMedicationTable(userDrugs);
          pushPharmaMessage(medicationTableHtml);
          pushPharmaFeedbackMessages("choose-drug");
          clearTextField(textField);
          isWaitingForOptions = true;
          // shows the user a complaint if during the search process, the amount of drugs matching his input pass a certain number
          // Hence the displayed drugs might contain the user desired drug.
          if (drugSearchComplaint) {
            pushPharmaFeedbackMessages("drug-search-complaint");
            return;
          }
        } else {

          const number = parseInt(userPrompt, 10);
          if (!isNaN(number) && number >= 0 && number <= userDrugs.length - 1) {
            selectedSearchedDrugs.push(userDrugs[userPrompt]);
            isWaitingForOptions = false;

            pushPharmaMessage(
              JSON.stringify(userDrugs[userPrompt]["name"]) +
                " added to your list"
            );
            pushPharmaFeedbackMessages("more-meds");
            currentStep = 0;
          } else {
            pushPharmaFeedbackMessages("keywords");
            isWaitingForOptions = false;
            currentStep = 0;
          }
        }
      } else if (userPrompt == "done" && selectedSearchedDrugs.length === 0) {
        pushPharmaFeedbackMessages("meds-empty");
      } else if (userPrompt == "done" && selectedSearchedDrugs.length !== 0) {
        medicationDone();
      }

      break;

    case 1:

      console.log("case one")
      if (userPrompt == "clear") {
        clearMedicationList()
        return;
      } else if (userPrompt == "complete") {
        completeMedList()
      } else {
        pushPharmaFeedbackMessages("keywords");
        return;
      }

      break;
    case 2: 

      console.log("case two")
      userInfo['name'] = userPrompt; 
      pushPharmaFeedbackMessages("address");
      currentStep ++;
      break;

    case 3:

      userInfo['address'] = userPrompt; 
      pushPharmaFeedbackMessages("phone-enter");
      currentStep++;
      break;

    case 4:

      const isValid = validateCameroonianPhoneNumber(userPrompt.trim());
      if (!isValid["isValid"]) {
        pushPharmaFeedbackMessages("phone");
        return;
      }

      userInfo['phone'] = userPrompt; 
      pushPharmaFeedbackMessages("confirm-payment");
      pushPharmaFeedbackMessages("billing-request-followup");

      currentStep ++;
      break;

    case 5:

      //   let body = {
      //     amount: 1,
      //     phone_number: "237673572533",
      //     description: "testing the api service",
      //   };

      //   let accesstoken = getAccessToken(
      //     paymentInfo["AppUserName"],
      //     paymentInfo["AppPassword"]
      //   );
      //   if (accesstoken["success"]) {
      //     let payment = mobilePayment(response["token"], body);
      //     if (payment["success"]) {
      //       console.log(response["data"]);
      //     } else {
      //       console.log("failed to make payment");
      //       pushPharmaFeedbackMessages("resend-billing-request");
      //     }
      //   } else {
      //     console.log("failed to get access token.");
      //   }
      // order is supposed to be placed here 
      // then user input waiting for the user confirmation

      if (userPrompt == "confirmed") {
        confirmedPayment();
        return;
      } else if (userPrompt == "resend") {
        resendPayment();
        return;
      } else {
        pushPharmaFeedbackMessages("keywords");
        
      }

      break;
    // case 4:

    case 6:

      console.log("placing order case");
      if (userPrompt == "resend") {
        pushPharmaFeedbackMessages("placing-order");
        await sendMail(selectedSearchedDrugs, userInfo);
      }
      let response = await sendMail(selectedSearchedDrugs, userInfo);
      if (!response) {
        pushPharmaFeedbackMessages("order-failed");
        return;
      }

      break;
    default:
      console.log("hello");
  }
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
  selectedSearchedDrugs = [];
  onStart();
}

// window.addEventListener("beforeunload", function () {
//   localStorage.setItem("messages", JSON.stringify(messages));
// });

// window.addEventListener("load", function () {
//   let messages = JSON.parse(localStorage.getItem("messages"));
//   if (Array.isArray(messages)) {
//     isMessagesLoaded = true;
//     messages = messages;
//   } else {
//     isMessagesLoaded = false;
//   }
// });

// helper function to push pharma message on the chatbox
function pushPharmaMessage(reply) {
  messages.push({ name: "SOS Pharma", message: reply });
  updateChatText(chatBox, messages);
  inputBox.focus();
}

async function pushThinkingMessage() {
  messages.push({
    name: "SOS Pharma",
    message: "<p class='loading-dots'> Processing </p>",
  });
  updateChatText(chatBox, messages);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  messages.pop();
}

// helper function to help display bot feedback messages,
function pushPharmaFeedbackMessages(currentCase) {
  switch (currentCase) {
    case "phone":
      pushPharmaMessage(
        "Please enter a valid Cameroonian phone number, it must begin with the digits 6, 2, 3, etc"
      );
      break;

    case "phone-enter":
      pushPharmaMessage("Please your number you wish to pay with.");
      break;
    case "address":
      pushPharmaMessage(
        "Please where do you live, Town and location e.g (Buea, Malingo)"
      );
      break;
    case "medications":
      pushPharmaMessage(
        "Please retype the name of your medication as prescribed by your medical doctor"
      );
      break;
    case "medications-complete":
      pushPharmaMessage(
        ` <p> Are your medications correct and complete ??</p><br>
          <div class="buttons"> 
            <button class="btn btn-warning med-clear-button">CLEAR SELECTED LIST</button>
            <button class="btn btn-success med-complete-button">COMPLETE</button>
          </div>
        `
          
      );
      break;
    case "resend-billing-request":
      pushPharmaMessage("Billing request has been resend, please confirm");
      break;

    case "billing-request-followup":
      pushPharmaMessage(
        ` <p> Have you confirmed the payment ?? or you didnt receive the billing request ?</p> <br>
          <div class="buttons"> 
            <button class="btn btn-info payment-resend-button">RESEND BILLING</button>
            <button class="btn btn-success payment-confirmed-button">CONFIRMED BILLING</button>
          </div>
        `
      );
      break;
    case "no-medication":
      pushPharmaMessage(
        "No Medication identified, please provide the list of medications you wish to order as specified by your medical personnel"
      );
      break;
    case "keywords":
      pushPharmaMessage("Please reply with the above specified keywords");
      break;
    case "input":
      pushPharmaMessage("Please reply with the above specified keywords");
      break;
    case "more-meds":
      pushPharmaMessage(
        ` <p> Do you wish to order any other medication, if yes, please type the name of the medication, if no, please click on the done button</p>
          <br> <button class="btn btn-success med-done-button"> DONE SELECTING </button>
        `
      );
      break;
    case "drug-found":
      pushPharmaMessage(
        "The requested drug isnt available, Please make sure the spelling is correct and try again"
      );
      break;
    case "choose-drug":
      pushPharmaMessage(
        `
        <p>Please select your medication from the list above, reply with the index e.g 1, 2, 3,  if you wish to clear your list and start over</p> 
        <br><button class="btn btn-warning list-clear-button"> CLEAR LIST </button>`
      );
      break;
    case "drug-search-complaint":
      pushPharmaMessage(
        "The amount of drugs matching this name is alot, please if your required drug isnt found on this list, check the spelling and search again."
      );
      break;
    case "meds-empty":
      pushPharmaMessage(
        "Please choose a medication before proceeding to the next stage of your purchase."
      );
      break;
    case "order-failed":
      pushPharmaMessage(
        `
          <p> Failed to place your order </p> 
          <br> <button class="btn btn-info order-resend-button"> RESEND ORDER </button>
         `
      );
      break;
    case "placing-order":
      pushPharmaMessage("Your order is being placed, please wait a moment");
      break;
    case "order-sent":
      pushPharmaMessage(
        "Your order has been placed, Thanks for using and trusting SOS Pharma"
      );
      break;
    case "confirm-payment":
      pushPharmaMessage(
        "A payment request has been send to this device, please confirm the payment for your order tobe placed."
      );
      break;
    case "identity":
        pushPharmaMessage(
          "Please whats your name ?"
        );
        break;
    default:
      pushPharmaMessage("Invalid input, please retype your request");
      break;
  }
}



onStart();
