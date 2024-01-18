// Description: This file contains the logic for the chatbox
const chatBox = document.querySelector(".chatbox__support");
const sendButton = document.querySelector(".chatbox__send__button");
const restartChatButton = document.querySelector(".chatbox__restart");
const doneButton = document.querySelector(".done-button");
const paymentConfirmButton = document.querySelector(".payment-confirm-button");
const resendButton = document.querySelector(".chatbox__restart");
const completeButton = document.querySelector(".chatbox__restart");
const clearButton = document.querySelector(".chatbox__restart");
const closeButton = document.querySelector(".chatbox__close");
const inputBox = chatBox.querySelector(".chatbox__message__input");
const messageContainer = document.getElementById("chatbox__messages");

// user variables
let locale = "en-US", city = "", selectedPickupLocation = "";
let messages  = [], drugList = [], userPrompts = [], userDrugs  = [], userDrugPlusWeight = [], updatedDrugObjects = [], selectedSearchedDrugs = [], orderKeywords = [], locations = [], quarters = [], drugQuantity = [1,2,3,4,5,6,7,8,9], prescriptionType = locale === 'en-US' ? ["Prescribed Drug", "Unprescribed Drug"] : ["Ordonnance", 'Auto Medication'];
let isDrugFound = false, isMessagesLoaded = false, isWaitingForOptions = false;
let paymentInfo = {}, userInfo = {};
let message = "", currentDrug = 0, currentStep = 0;

// get refrence to the html elements relevant to the js file
sendButton.addEventListener("click", () => onSendButton(chatBox));
restartChatButton.addEventListener("click", () => restartConversation());
inputBox.addEventListener("keyup", ({ key }) => {
  if (key === "Enter") {
    onSendButton(chatBox);
}});
closeButton.addEventListener('click', (e) => {
  goBack()
})


async function onStart() {
  locale = getUserLocale()
  orderKeywords = getOrderKeywords(locale);
  locations = await onLoadCities();
  response = await loadExcel();

  drugList = response["drugs"];
  let drugLoaded = response["isLoaded"];
  paymentInfo = await onLoadPaymentDetails();
  await pushThinkingMessage();

  if (!drugLoaded) {
    // message =  locale === 'en-US' ? `Network error <br> Failed to load required resources <br>Please check your internet connection and refresh the page` 
    //   : `Erreur réseau <br> Impossible de charger les ressources requises <br>Veuillez vérifier votre connexion Internet et actualiser la page`,
    pushPharmaMessage(getTranslation("network-error"));
    disableTextarea(inputBox);
    return;
  }

  // message = locale === 'en-US' ? `Hello <br> Welcome to SOS Pharma` 
  //           : `Bonjour <br> Bienvenue chez SOS Pharma`

  if(messages.length === 0 ){
    pushPharmaMessage(getTranslation("greeting-text"));
  }else{
    updateChatText(chatBox, messages);
  }

  pushPharmaFeedbackMessages("city");
  onDisplayCityDropDown();
  disableTextarea(inputBox);

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
          disableTextarea(inputBox);
          pushPharmaFeedbackMessages("choose-drug");
        
          // shows the user a complaint if during the search process, the amount of drugs matching his input pass a certain number
          // Hence the displayed drugs might contain the user desired drug.
          if (drugSearchComplaint) {
            pushPharmaFeedbackMessages("drug-search-complaint");
            return;
          }

      } else if (userPrompt == "done" && selectedSearchedDrugs.length === 0) {
        pushPharmaFeedbackMessages("meds-empty");
      } else if (userPrompt == "done" && selectedSearchedDrugs.length !== 0) {
        medicationDone();
      }

      break;

    case 1:

      userInfo['name'] = userPrompt;
      pushPharmaFeedbackMessages("phone-enter");
      currentStep ++;

      break;
    case 2:

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

    case 3:

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

    case 5:

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

onStart();
