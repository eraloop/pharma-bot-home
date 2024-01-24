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
let city = "", selectedPickupLocation = "";
let messages  = [], drugList = [], userPrompts = [], userDrugs  = [], userDrugPlusWeight = [], updatedDrugObjects = [], selectedSearchedDrugs = [], orderKeywords = [], locations = [], quarters = [], drugQuantity = [0,1,2,3,4,5,6,7,8,9];
let isDrugFound = false, isMessagesLoaded = false, isWaitingForOptions = false;
let paymentInfo = {}, userInfo = {}, user = {};
let message = "", currentDrug = 0, currentStep = 0, totalCost = 0;

// payment information
let token = "", transactionId = "";

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
  disableTextarea(inputBox);
  locale = getUserLocale()
  orderKeywords = getOrderKeywords(locale);
  locations = await onLoadCities();
  response = await loadExcel();
  user = getUserFromLocalStorage();
  user = JSON.parse(user);
  
  drugList = response["drugs"];
  let drugLoaded = response["isLoaded"];
  paymentInfo = await onLoadPaymentDetails();
  await pushThinkingMessage("loading-message");

  if (!drugLoaded) {
    pushPharmaMessage(getTranslation("network-error"));
    disableTextarea(inputBox);
    return;
  }

  if(messages.length === 0 ){
    pushPharmaMessage(getTranslation("greeting-text"));
  }else{
    updateChatText(chatBox, messages);
  }

  if(user !== null){
    userInfo = user;
    let address =
    locale === "en-US" || locale === "en"
      ? `
      <div>
        <p>Is your address information correct ? If yes , continue</p>
        <p> City : ${userInfo["city"]} </p>
        <p> Quarter : ${userInfo["quarter"]} </p>
        <div class="buttons"> 
          <button class="btn btn-warning " onclick="reselectAddress()">NO, RESELECT</button>
          <button class="btn btn-success " onclick="addressCorrect()">CORRECT</button>
        </div>
        
      </div>
    `
      : `
      <div>
        <p>Votre adresse est-elle correcte ? Si oui, continuer</p>
        <p> Ville : ${userInfo["city"]} </p>
        <p> Quartier : ${userInfo["quarter"]} </p>
        <div class="buttons"> 
          <button class="btn btn-warning " onclick="reselectAddress()">NO, RESELECT</button>
          <button class="btn btn-success " onclick="addressCorrect()">CORRECT</button>
        </div>
      </div>
    `;
    pushPharmaMessage(address);
  }else{
    pushPharmaFeedbackMessages("city");
    onDisplayCityDropDown();
    enableTextarea(inputBox);
  }

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

          const medicationTableHtml = prepareMedicationTable(userDrugs);
          pushPharmaMessage(medicationTableHtml);
          disableTextarea(inputBox);
          pushPharmaFeedbackMessages("choose-drug");
        
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

      disableTextarea(inputBox)
      const isValid = validateCameroonianPhoneNumber(userPrompt.trim());
      if (!isValid["isValid"]) {
        pushPharmaFeedbackMessages("phone");
        return;
      }

      userInfo['phone'] = userPrompt;
      pushPharmaMessage(getTranslation("billing"))
      messages.pop();

      console.log("this is the medication total cost",totalCost)
 
      let accesstoken = await getAccessToken(
        paymentInfo["username"],
        paymentInfo["password"]
      );

      if (accesstoken["success"] === false) {
        pushPharmaFeedbackMessages("network-error");
        return;
      }

      token = accesstoken["token"];
      
      let body = { 
        // amount: totalCost,
        amount: 5,
        phone: userInfo['phone'],
        description: `You have received a billing request of ${totalCost} for your order from SOS Pharma. `,
        reference: "Medication Order",
      }

      await makePayment(token, body);
      currentStep ++;
      break;

    case 3:

      console.log("current step 3")
      if (userPrompt == "confirmed") {
        confirmedPayment(token, transactionId);
        return;
      } else if (userPrompt == "resend") {
        resendPayment(token, body);
        return;
      }

      break;
    case 4:

      if (userPrompt == "resend") {
        pushPharmaFeedbackMessages("placing-order");
        await sendMail(selectedSearchedDrugs, userInfo);

        let orderId = "orderId" + new Date.now().toString(36) + Math.random().toString(16).slice(2)
        const waLink = generateWhatsAppLink(orderId, userInfo)
        pushPharmaMessage(waLink)
        pushPharmaMessage(getTranslation("waMessage"));
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
