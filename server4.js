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
let messages  = [], drugList = [], userPrompts = [], userDrugs  = [], userDrugsList = [], updatedDrugObjects = [], selectedSearchedDrugs = [], orderKeywords = [], locations = [], quarters = [], drugQuantity = [0,1,2,3,4,5,6,7,8,9];
let isDrugFound = false, isMessagesLoaded = false, isWaitingForOptions = false;
let paymentInfo = {}, userInfo = {}, user = {};

let orderInfo = {
  "orderId": '',
  "paymentReference": "",
  "paymentPhone": "",
  "external_reference": ""
};

let searchFormat = {
  "username": "",
  "city": "",
  "quarter": "",
  "search": "",
  "date": ""
}

let userSearch = [];
let userOrders = [];
let body = { 
  // amount: totalCost,
  amount: '',
  phone: '',
  description: '',
  reference: '',
}

let message = "", currentDrug, currentStep = 0, totalCost = 0 , page = 1;
// payment information
let transactionId = "";

// get refrence to the html elements relevant to the js file
sendButton.addEventListener("click", () => onSendButton(chatBox));
restartChatButton.addEventListener("click", () => restartConversation());
inputBox.addEventListener("keyup", ({ key }) => {
  if (key === "Enter") {
    onSendButton(chatBox);
  }
});
closeButton.addEventListener('click', (e) => {goBack()})

async function onStart() {

  disableTextarea(inputBox);
  await pushSetupMessage();
  user = getUserFromLocalStorage();
  user = JSON.parse(user);

  if(messages.length <= 1 ){
    pushPharmaMessage(getTranslation("greeting-text"));
  }else{
    updateChatText(chatBox, messages);
  }

  orderKeywords = getOrderKeywords(locale);

  if (drugList.length == 0) {
    console.log("drug list is empty")
    // pushPharmaMessage(getTranslation("network-error"));
    // disableTextarea(inputBox);
    // return;
  }

  if(user != null){
    userInfo = user;
    let address = 
    locale === "en"
      ? `
      <div>
        <p>Is your address information correct ? If yes , continue</p>
        <p> <span> City :</span> <span class='bold-text'> ${userInfo["city"]}</span></p> 
        <p><span> Quarter :</pan> <span class='bold-text'>${userInfo["quarter"]} </span> </p>
        <div class="buttons"> 
          <button class="btn btn-danger " onclick="reselectAddress()">NO, RESELECT</button>
          <button class="btn btn-success " onclick="addressCorrect()">CORRECT</button>
        </div>
        
      </div>
    `
      : `
      <div>
        <p>Lieu de livraison OK ? Si Oui, saisissez le médicament recherché</p>
        <p><span> Ville :</span> <span class='bold-text'> ${userInfo["city"]}</span> </p>
        <p> <span> Quartier :</span> <span class='bold-text'>${userInfo["quarter"]} </span></p>
        <div class="buttons"> 
          <button class="btn btn-danger" onclick="reselectAddress()">CORRECTION</button>
          <button class="btn btn-success" onclick="addressCorrect()">CORRECTE</button>
        </div>
      </div>
    `;
    pushPharmaMessage(address);
  }else{
    pushPharmaMessage(getTranslation("city"));
    onDisplayCityDropDown();
    enableTextarea(inputBox);
    paymentInfo = await onLoadPaymentDetails();
  }

}

async function onSendButton(chatbox) {
  let textField = chatbox.querySelector("textarea");
  let userPrompt = textField.value.trim();
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
          searchResults = await matchUserDrugs(drugList, userPrompts, orderKeywords);
          userDrugsList = searchResults['userDrugs'];
          userDrugs = getItemsByPage(page, 10);
          isDrugFound = searchResults["isDrugFound"];
          drugSearchComplaint = searchResults["drugSearchComplaint"];
          // checks if any drug is found,
          if (!isDrugFound) {
            pushPharmaMessage(getTranslation("drug-found"));
            return;
          }

          const medicationTableHtml = prepareMedicationTable(userDrugs);
          pushPharmaMessage(medicationTableHtml);
          disableTextarea(inputBox);
        
          if (drugSearchComplaint) {
            pushPharmaMessage(getTranslation("drug-search-complaint"));
          }
          pushPharmaMessage(getTranslation("choose-drug"));

      } else if (userPrompt == "done" && selectedSearchedDrugs.length === 0) {
        pushPharmaMessage(getTranslation("meds-empty"));
      } else if (userPrompt == "done" && selectedSearchedDrugs.length !== 0) {
        medicationDone();
      }

      break;

    case 1:

      userInfo['name'] = userPrompt;
      pushPharmaMessage(getTranslation("phone-enter"));
      currentStep ++;
      break;

    case 2:

      userPrompt = userPrompt.replace(/^(\+|00)?237/, '').replace(/\s/g, '');
      const isValid = validateCameroonianPhoneNumber(userPrompt.trim());
      if (!isValid["isValid"]) {
        pushPharmaMessage(getTranslation("phone"));
        return;
      }

      userInfo['phone'] = userPrompt;
      
      orderInfo['orderId'] = stringToBase32("orderId-" + getCurrentFormatedDate() + "-" + Math.random().toString(16).slice(2))
      pushPharmaMessage(getTranslation("billing"))
      messages.pop();
      
      body = {
        amount: totalCost,
        phone: userInfo['phone'],
        description: `Order: ${orderInfo['orderId']} - Price: ${totalCost} - ${getCurrentFormatedDate()} `,
        reference: orderInfo['orderId'],
      }

      pushPharmaMessage(getTranslation("payment-button"));

      let res = await paymentWidget(body)

      if(res.status === "SUCCESSFUL" ){

        closePaymentWidget();
        transactionId = res.reference
        pushPharmaMessage(getTranslation("placing-order"));
        orderInfo['paymentReference'] = transactionId
        orderInfo['paymentPhone'] = userInfo['phone']
        orderInfo['external_reference'] = res['external_reference']
        orderInfo['orderId'] =  ` ${res['external_reference']} - ${getCurrentFormatedDate()}`
        await sendOrderMail()
        currentStep ++;

      }

      break;
    default:
  }
}

onStart()
