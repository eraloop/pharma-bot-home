// Description: This file contains the logic for the chatbox
let chatBox = document.querySelector(".chatbox__support");
let sendButton = document.querySelector(".chatbox__send__button");
let restartChatButton = document.querySelector(".chatbox__restart");

// this is the list of messages in the chatbox
let messages = [];
// this is the drug list loaded from the json file
// onload drugs method loads the drugs from the product.json file or the test.json file
let drugList = [];
// this is the list of drugs the user has typed
let userPrompts = [];
// this is the list of drugs the user search result returned
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
// tracks if a user drug is found
let isDrugFound = false;
// this is a list of drugs the user have selected from the search
let selectedSearchedDrugs = [];
// payment info data
let paymentInfo = {};
// this variable tracks if the user is supposed ti select a drug from a suggested list
let isWaitingForOptions = false;

let steps = 1;

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
            console.log("adding selected drug");
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
        console.log("changed case");

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

      break;

    case 1:

      if (userPrompt == "clear") {
        selectedSearchedDrugs = [];
        pushPharmaFeedbackMessages("medications");
        currentStep = 0;
        return;
      } else if (userPrompt == "complete") {
        pushPharmaFeedbackMessages("address");
        currentStep++;
      } else {
        pushPharmaFeedbackMessages("keywords");
        return;
      }

      break;

    case 2:
      pushPharmaFeedbackMessages("phone-enter");
      currentStep++;
      break;
    case 3:
      const isValid = validateCameroonianPhoneNumber(userPrompt.trim());
      if (!isValid["isValid"]) {
        pushPharmaFeedbackMessages("phone");
        return;
      }
      pushPharmaFeedbackMessages("confirm-payment");
      pushPharmaFeedbackMessages("billing-request-followup");

      currentStep++;
      break;

    case 4:

      if (userPrompt == "confirmed") {
        pushPharmaFeedbackMessages("placing-order");
        disableTextarea(inputBox);

        let response = await sendOrderEmail(selectedSearchedDrugs);
        if (!response) {
          pushPharmaFeedbackMessages("order-failed");
          enableTextarea(inputBox);
          return;
        }else{
          pushPharmaFeedbackMessages("order-sent");
          pushPharmaMessage("Your drugs will ne delivered to you in the next one hour.")
          return;
        }
        

      } else if (userPrompt == "resend") {
        pushPharmaFeedbackMessages("resend-billing-request");
        pushPharmaFeedbackMessages("billing-request-followup");
        return;
        
      } else {
        pushPharmaFeedbackMessages("keywords");
        return;
      }

      break;
    // case 4:

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
    //   break;

    case 5:

      console.log("placing order case");
      if (userPrompt == "resend") {
        pushPharmaFeedbackMessages("placing-order");
        await sendOrderEmail(selectedSearchedDrugs);
      }
      let response = await sendOrderEmail(selectedSearchedDrugs);
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

window.addEventListener("beforeunload", function () {
  localStorage.setItem("messages", JSON.stringify(messages));
});

window.addEventListener("load", function () {
  let messages = JSON.parse(localStorage.getItem("messages"));
  if (Array.isArray(messages)) {
    isMessagesLoaded = true;
    messages = messages;
  } else {
    isMessagesLoaded = false;
  }
});

// helper function to push pharma message on the chatbox
function pushPharmaMessage(reply) {
  messages.push({ name: "SOS Pharma", message: reply });
  updateChatText(chatBox, messages);
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
        "Are your medications correct and complete ??  if not, please type CLEAR, if yes, type COMPLETE"
      );
      break;
    case "resend-billing-request":
      pushPharmaMessage("Billing request has been resend, please confirm");
      break;

    case "billing-request-followup":
      pushPharmaMessage(
        "if comfirmed, type CONFIRMED, if you ddnt receive the billing request, type RESEND"
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
        "Do you wish to order any other medication, if yes, please type the name of the medication, if no, please type DONE"
      );
      break;
    case "drug-found":
      pushPharmaMessage(
        "The requested drug isnt available, Please make sure the spelling is correct and try again"
      );
      break;
    case "choose-drug":
      pushPharmaMessage(
        "Please select your medication from the list above, reply with the index e.g 1, 2, 3, etc or type CLEAR if you wish to clear your list and start over"
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
        "Failed to place your order, please type RESEND to resend your order"
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
    default:
      pushPharmaMessage("Invalid input, please retype your request");
      break;
  }
}

onStart();
