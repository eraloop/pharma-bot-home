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

let orderInfo = {
  "orderId": '',
  "paymentReference": "",
  "paymentPhone": "",
};

let message = "", currentDrug = 0, currentStep = 0, totalCost = 0;

// payment information
let token = "290ed6ac188a2f1d30baf8533fcaa09e2c77591d", transactionId = "";

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
    locale === "fr-FR" || locale === "fr"
      ? `
      <div>
        <p>Is your address information correct ? If yes , continue</p>
        <p> City : ${userInfo["city"]} </p>
        <p> Quarter : ${userInfo["quarter"]} </p>
        <div class="buttons"> 
          <button class="btn btn-danger " onclick="reselectAddress()">NO, RESELECT</button>
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
          <button class="btn btn-danger" onclick="reselectAddress()">NO, RESELECT</button>
          <button class="btn btn-success" onclick="addressCorrect()">CORRECT</button>
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

          pushPharmaFeedbackMessages("choose-drug");
          const medicationTableHtml = prepareMedicationTable(userDrugs);
          pushPharmaMessage(medicationTableHtml);
          disableTextarea(inputBox);
        
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
        enableTextarea(inputBox)
        return;
      }

      userInfo['phone'] = userPrompt;
      pushPharmaMessage(getTranslation("billing"))
      messages.pop();
      
      let body = { 
        // amount: totalCost,
        amount: 2,
        phone: userInfo['phone'],
        description: `You have received a billing request of ${totalCost} for your order from SOS Pharma. `,
        reference: "Medication Order",
      }

      pushPharmaMessage(getTranslation("payment-button"));
      let res = await paymentWidget(body)
      
      if(res.status === "SUCCESSFUL" ){
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const seconds = currentDate.getSeconds();
        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        closePaymentWidget();
        transactionId = res.reference
        pushPharmaMessage(getTranslation("placing-order"));
        orderInfo['paymentReference'] = transactionId,
        orderInfo['paymentPhone'] = userInfo['phone'],
        orderInfo['orderId'] = "orderId-" + formattedDateTime + "-" + Math.random().toString(16).slice(2)
        await sendOrderMail()
        currentStep ++;
      }

      break;
    default:
      console.log("hello");
  }
}

onStart();
