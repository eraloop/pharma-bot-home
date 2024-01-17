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
let closeButton = document.querySelector(".chatbox__close");
let inputBox = chatBox.querySelector(".chatbox__message__input");
let messageContainer = document.getElementById("chatbox__messages");

let locale = "en-US", city = "", selectedPickupLocation = "";
let messages  = [], drugList = [], userPrompts = [], userDrugs  = [], userDrugPlusWeight = [], updatedDrugObjects = [], selectedSearchedDrugs = [], orderKeywords = [], locations = [], quarters = [], drugQuantity = [1,2,3,4,5,6,7,8,9], prescriptionType = locale === 'en-US' ? ["Prescribed Drug", "Unprescribed Drug"] : ["Ordonnance", 'Auto Medication'];
let isDrugFound = false, isMessagesLoaded = false, isWaitingForOptions = false;
let paymentInfo = {}, userInfo = {};
let message = "", currentDrug = 0;

// get refrence to the html elements relevant to the js file
sendButton.addEventListener("click", () => onSendButton(chatBox));
restartChatButton.addEventListener("click", () => restartConversation());

function addMedicationToCart(index) {
  currentDrug = userDrugs[index];  
  pushPharmaFeedbackMessages("drug-quantity");
  selectDrugQuantity()
}


function selectDrugQuantity() {

  let locationDropdown = document.querySelector(".drug-quantity-dropdown");
  locationDropdown.innerHTML = "";

  drugQuantity.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(optionText);
    option.text = optionText; 
    locationDropdown.appendChild(option); 
  });

  locationDropdown.addEventListener("change", function() {
    onSelectDrugQuantity(this.value);
  });

 
}

function onSelectDrugQuantity(quantity){

  currentDrug['quantity'] = quantity;
  selectedSearchedDrugs.push(currentDrug);
  pushPharmaMessage(JSON.stringify(currentDrug["name"]) + " added to your list");
  pushPharmaFeedbackMessages("more-meds");

  // const buttons = document.querySelectorAll(".select-medication-option");
  // buttons.forEach(function(button) {
  //   disableButton(button); 
  // });

}


function selectPrescriptionType() {

  let locationDropdown = document.querySelector(".prescription-type");
  locationDropdown.innerHTML = "";

  prescriptionType.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(optionText);
    option.text = optionText; 
    locationDropdown.appendChild(option); 
  });

  locationDropdown.addEventListener("change", function() {
    onSelectPrescriptionType(this.value);
  });

}

function onSelectPrescriptionType(response){
  userInfo['prescriptionType'] = response

  let totalCost = 0;
  let deliveryCost = 500, sosPharmaCost = 1000;
  selectedSearchedDrugs.forEach((currentDrug) => {
    totalCost += currentDrug.price * currentDrug.quantity;
  });
  totalCost += deliveryCost + sosPharmaCost;
  const medicationTableHtml = prepareMedicationDataTable(
    selectedSearchedDrugs,
    totalCost,
    deliveryCost,
    sosPharmaCost
  );
  pushPharmaMessage(medicationTableHtml);
  pushPharmaFeedbackMessages("medications-complete");
  currentStep++;
}

function reselectAddress(){
  messages.pop();messages.pop(); messages.pop()
  if(userInfo['quarter'] !== undefined){
    messages.pop();
  }
  updateChatText(chatBox, messages)
  pushPharmaFeedbackMessages("city");
  onDisplayCityDropDown();
  disableTextarea(inputBox);
}

// tracks the enter key on the input box so as to submit the text inside
inputBox.addEventListener("keyup", ({ key }) => {
  if (key === "Enter") {
    onSendButton(chatBox);
  }
});
// loads messages from local storage when  the user returns to the page
// window.addEventListener("load", async function() {
//   try {
//     messages = await getConversationData();
//     console.log("messages" + JSON.stringify(messages))
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//   }
// });
// saves messages to local storage when the user leaves the page
window.addEventListener("beforeunload", function() {
  saveConversationData(messages)
});

closeButton.addEventListener('click', (e) => {
  saveConversationData(messages)
})

// interactives chat buttons
function medicationDone(){

  pushPharmaFeedbackMessages("prescribtion-type");
  selectPrescriptionType()
  disableTextarea(inputBox);
}

function clearMedicationList(){
  selectedSearchedDrugs = [];
  pushPharmaFeedbackMessages("medications");
  currentStep = 0;
  enableTextarea(inputBox);
}

function completeMedList(){
  console.log("complete button")
  pushPharmaFeedbackMessages("identity");
  enableTextarea(inputBox);
  currentStep  = 1;
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
    pushPharmaMessage(
      locale === 'en-US' ? "Your drugs will ne delivered to you in the next one hour."
       : "Vos médicaments vous seront livrés dans l'heure qui suit."  
      )
    return;
  }

}

function continueSelecting(){
  pushPharmaFeedbackMessages("medications");
  enableTextarea(inputBox)
  currentStep = 0;
}

function resendPayment(){
  pushPharmaFeedbackMessages("resend-billing-request");
  pushPharmaFeedbackMessages("billing-request-followup");
}

function onDisplayCityDropDown(){
  let locationDropdown = document.querySelector(".location-dropdown");
  locationDropdown.innerHTML = "";

  locations.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(optionText);
    option.text = optionText["name"]; 
    locationDropdown.appendChild(option); 
  });

  locationDropdown.addEventListener("change", function() {
    onSelectCity(this.value);
  });

}

function onSelectCity(city){
  city = JSON.parse(city);
  userInfo['city'] = city['name'];
  quarters = city['quarters'];
  if(quarters.length == 0 ){
      let address =  locale === 'en-US' ? `
      <div>
        <p>Address Information</p>
        <p> City : ${userInfo['city']} </p>
        <button class="btn btn-warning " onclick="reselectAddress()">NO, RESELECT</button>
      </div>
    ` : 
    `
      <div>
        <p> Informations sur l'adresse </p>
        <p> Ville : ${userInfo['city']} </p>
        <button class="btn btn-warning " onclick="reselectAddress()">NON, RESELECT</button>
      </div>
    `;
    message =  locale === 'en-US' ? `Which medication do you wish to order ?` 
    : `Quel médicament souhaitez-vous commander ?`,

    pushPharmaMessage(address)
    pushPharmaMessage(message)
    enableTextarea(inputBox);
    return;
  }else{
    pushPharmaFeedbackMessages("quarter");
    onDisplayLocationDropDown()
  }
 
}

function onDisplayLocationDropDown(){

  let pickupLocationDropdown = document.querySelector(".pickup-location-dropdown");
  pickupLocationDropdown.innerHTML = "";

  quarters.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(optionText);
    option.text = optionText["name"]; 
    pickupLocationDropdown.appendChild(option); 
  });

  pickupLocationDropdown.addEventListener("change", function() {
    onSelectQuarter(this.value)
  });

}

function onSelectQuarter(quarter){
  quarter = JSON.parse(quarter);
  userInfo['quarter'] = quarter['name'];
  let address =  locale === 'en-US' ? `
    <div>
      <p>Is your address information correct ? If yes , continue</p>
      <p> City : ${userInfo['city']} </p>
      <p> Quarter : ${userInfo['quarter']} </p>
      <button class="btn btn-warning " onclick="reselectAddress()">NO, RESELECT</button>
    </div>
  ` : 
  `
    <div>
      <p>Votre adresse est-elle correcte ? Si oui, continuer</p>
      <p> Ville : ${userInfo['city']} </p>
      <p> Quartier : ${userInfo['quarter']} </p>
      <button class="btn btn-warning " onclick="reselectAddress()">NON, RESELECT</button>
    </div>
  `;
  message =  locale === 'en-US' ? `Which medication do you wish to order ?` 
  : `Quel médicament souhaitez-vous commander ?`,

  pushPharmaMessage(address)
  pushPharmaMessage(message)
  enableTextarea(inputBox);
}


async function onStart() {
  locale = navigator.language
  orderKeywords = getOrderKeywords(locale);
  locations = await onLoadCities();
  response = await loadExcel();

  drugList = response["drugs"];
  let drugLoaded = response["isLoaded"];
  paymentInfo = await onLoadPaymentDetails();
  await pushThinkingMessage();

  if (!drugLoaded) {
    message =  locale === 'en-US' ? `Network error <br> Failed to load required resources <br>Please check your internet connection and refresh the page` 
      : `Erreur réseau <br> Impossible de charger les ressources requises <br>Veuillez vérifier votre connexion Internet et actualiser la page`,
    pushPharmaMessage(message)
    disableTextarea(inputBox);
    return;
  }

  message = locale === 'en-US' ? `Hello <br> Welcome to SOS Pharma` 
            : `Bonjour <br> Bienvenue chez SOS Pharma`

  if(messages.length === 0 ){
    pushPharmaMessage(message)
  }else{
    updateChatText(chatBox, messages);
  }

  pushPharmaFeedbackMessages("city");
  onDisplayCityDropDown();
  disableTextarea(inputBox);

}


// helper function to push user message on the chatbox
function pushUserMessage(message) {
  messages.push({ name: "User", message });
  updateChatText(chatBox, messages);
  inputBox.focus();
}

let currentStep = 0;
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
  isWaitingForOptions = false;
  isDrugFound = false;
  enableTextarea(inputBox);
  onStart();

}

// helper function to push pharma message on the chatbox
function pushPharmaMessage(reply) {
  messages.push({ name: "SOS Pharma", message: reply });
  updateChatText(chatBox, messages);
  inputBox.focus();
}

async function pushThinkingMessage() {

  if(messages.length !== 0){
    return;
  }

  message =  locale === 'en-US' ? "<p class='loading-dots'> Setting up, Please wait  </p>" 
      : "<p class='loading-dots'> Configuration, veuillez patienter </p>" ,

  pushPharmaMessage(message)
  await new Promise((resolve) => setTimeout(resolve, 2000));
  messages.pop();
}

// helper function to help display bot feedback messages,
function pushPharmaFeedbackMessages(currentCase) {
  switch (currentCase) {
    case "phone":
      pushPharmaMessage(
        locale === 'en-US' ? "Please enter a valid Cameroonian phone number, it must begin with the digits 6, 2, 3, etc" 
        : "Veuillez saisir un numéro de téléphone camerounais valide, il doit commencer par les chiffres 6, 2, 3, etc"
      );
      break;

    case "phone-enter":
      pushPharmaMessage(
        locale === 'en-US' ? "Please your number you wish to pay with." : "Veuillez saisir votre numéro de téléphone que vous souhaitez payer avec."
        );
      break;

    case "drug-quantity":
        pushPharmaMessage(
          locale === 'en-US' ? `
            <p> What quantity of this drug you wish to order </p>
            <select class="drug-quantity-dropdown" aria-label="Default select example">
            </select>
          `
          : `
            <p>Quantité de ce médicament que vous souhaitez commander</p>
            <select class="drug-quantity-dropdown" aria-label="Default select example">
            </select>
          `
        );
        break;
      case "city":
        pushPharmaMessage(
          locale === 'en-US' ? `
            <p> Which city do you live in ? </p><b>
            <select class="location-dropdown" aria-label="Default select example">
            </select>
          `
          : `
            Dans quelle ville habitez-vous ?
            <select class="location-dropdown" aria-label="Default select example">
            </select>
          `
        );
  
        break;
    case "quarter":
      pushPharmaMessage(
        locale === 'en-US' ? `
          <p> Where do you live in this city ? </p>
          <select class="pickup-location-dropdown" aria-label="Default select example">
          </select>
        `
        : `
          <p>Où habitez-vous dans cette ville ?</p>
          <select class="pickup-location-dropdown" aria-label="Default select example">
          </select>
        `
      );
      break;
    case "prescribtion-type":
        pushPharmaMessage(
          locale === 'en-US' ? `
            <p> Are this medications Prescribed or Unprescribed </p>
            <select class="prescription-type" aria-label="Default select example">
            </select>
          `
          : `
            <p>Ces médicaments sont-ils prescrits ou non prescrits ?</p>
            <select class="prescription-type" aria-label="Default select example">
            </select>
          `
        );
        break;
    case "medications":
      pushPharmaMessage(
        locale === 'en-US' ? "Which other medication do you wish to order" 
        : "Quel autre médicament souhaitez-vous commander"
      );
      break;
    case "medications-complete":
      pushPharmaMessage(
        locale === 'en-US' ? 
        ` <p> Are your medications correct and complete ??</p>
          <div class="buttons"> 
            <button class="btn btn-warning med-clear-button" onclick="clearMedicationList()">CLEAR SELECTED LIST</button>
            <button class="btn btn-success med-complete-button" onclick="completeMedList()">COMPLETE</button>
          </div>
        `
        : 
        ` <p> Vos médicaments sont-ils corrects et complets ??</p>
          <div class="buttons"> 
            <button class="btn btn-warning med-clear-button" onclick="clearMedicationList()">EFFACER LA LISTE SÉLECTIONNÉE</button>
            <button class="btn btn-success med-complete-button" onclick="completeMedList()">COMPLET</button>
          </div>
        `
          
      );
      break;
    case "resend-billing-request":
      pushPharmaMessage(
        locale === 'en-US' ? "Billing request has been resend, please confirm" 
        : "La demande de facturation a été renvoyée, veuillez confirmer"
        );
      break;

    case "billing-request-followup":
      pushPharmaMessage(
        locale === 'en-US' ? 
        ` <p> Have you confirmed the payment ?? or you didnt receive the billing request ?</p> 
          <div class="buttons"> 
            <button class="btn btn-info payment-resend-button" onclick="resendPayment()">RESEND BILLING</button>
            <button class="btn btn-success payment-confirmed-button" onclick="confirmedPayment()">CONFIRMED BILLING</button>
          </div>
        `
        : 
        ` <p> Avez-vous confirmé le paiement ?? ou vous n'avez pas reçu la demande de facturation ?</p> 
          <div class="buttons"> 
            <button class="btn btn-info payment-resend-button" onclick="resendPayment()">RENVOYER LA FACTURATION</button>
            <button class="btn btn-success payment-confirmed-button" onclick="confirmedPayment()">FACTURATION CONFIRMÉE</button>
          </div>
        `
      );
      break;
    case "no-medication":
      pushPharmaMessage(
        locale === 'en-US' ? "No Medication identified, please provide the list of medications you wish to order as specified by your medical personnel" 
        : "Aucun médicament identifié, veuillez fournir la liste des médicaments que vous souhaitez commander comme indiqué par votre personnel médical"
      );
      break;
    case "keywords":
      pushPharmaMessage(
        locale === 'en-US' ? "Please reply with the above specified keywords" : "Veuillez répondre avec les mots clés spécifiés ci-dessus"
        );
      break;
    case "input":
      pushPharmaMessage(
        locale === 'en-US' ? "Please reply with the above specified keywords" : "Veuillez répondre avec les mots clés spécifiés ci-dessus"
        );
      break;
    case "more-meds":
      pushPharmaMessage(
        locale === 'en-US' ?
        ` <p> Do you wish to order any other medication ?</p>
            <div class="buttons">
              <button class="btn btn-info" onclick="continueSelecting()"> CONTINUE </button>
              <button class="btn btn-success med-done-button" onclick="medicationDone()"> DONE SELECTING </button>
            </div>
        `
        : 
        ` <p> Souhaitez-vous commander d'autres médicaments ? </p>
          <div class="buttons">
            <button class="btn btn-info med-done-button" onclick="continueSelecting()"> CONTINUER </button>
            <button class="btn btn-success med-done-button" onclick="medicationDone()"> SÉLECTION TERMINÉE </button>
          </div>
        `
      );
      break;
    case "drug-found":
      pushPharmaMessage(
        locale === 'en-US' ? "The requested drug isnt available, Please make sure the spelling is correct and try again" : "Le médicament demandé n'est pas disponible, veuillez vous assurer que l'orthographe est correcte et réessayez"
      );
      break;
    case "choose-drug":
      pushPharmaMessage(
        locale === 'en-US' ?
        `
          <p>Please select your desired medication from the list above, if your intended medication is not included, click the button below</p> 
          <button class="btn btn-warning list-clear-button" onclick="restartConversation()"> CLEAR LIST </button>
        `
        :
        `
          <p>Veuillez sélectionner le médicament souhaité dans la liste ci-dessus. Si le médicament souhaité n'est pas inclus, cliquez sur le bouton ci-dessous.</p> 
          <button class="btn btn-warning list-clear-button" onclick="restartConversation()"> EFFACER LA LISTE </button>
        `
      );
      break;
    case "drug-search-complaint":
      pushPharmaMessage(
        locale === 'en-US' ? "The amount of drugs matching this name is alot, please if your required drug isnt found on this list, check the spelling and search again." 
        : "Le nombre de médicaments correspondant à ce nom est important, veuillez vérifier l'orthographe et rechercher à nouveau."
      );
      break;
    case "meds-empty":
      pushPharmaMessage(
        locale === 'en-US' ? "Please choose a medication before proceeding to the next stage of your purchase." 
        : "Veuillez choisir un médicament avant de passer à l'étape suivante de votre achat."
      );
      break;
    case "order-failed":
      pushPharmaMessage(
        locale === 'en-US' ?
        `
          <p> Failed to place your order </p> 
          <button class="btn btn-info order-resend-button" onclick="confirmedPayment()"> RESEND ORDER </button>
         `
         :
          `
            <p> Impossible de passer votre commande </p> 
             <button class="btn btn-info order-resend-button" onclick="confirmedPayment()"> REENVOYER LA COMMANDE </button>
          `
      );
      break;
    case "placing-order":
      pushPharmaMessage(
        locale === 'en-US' ? "Your order is being placed, please wait a moment" : "Votre commande est en cours de traitement, veuillez patienter un instant"
        );
      break;
    case "order-sent":
      pushPharmaMessage(
        locale === 'en-US' ? "Your order has been placed, Thanks for using and trusting SOS Pharma" 
        : "Votre commande a été passée, merci d'utiliser et de faire confiance à SOS Pharma"
      );
      break;
    case "confirm-payment":
      pushPharmaMessage(
        locale === 'en-US' ? "A payment request has been send to this device, please confirm the payment for your order tobe placed." 
        : "Une demande de paiement a été envoyée à cet appareil, veuillez confirmer le paiement pour que votre commande soit passée."
      );
      break;

    case "identity":
        pushPharmaMessage(
          locale === 'en-US' ? "Please whats your name ?" : "Quel est votre nom ?"
        );
      break;

    default:
      pushPharmaMessage(
        locale === 'en-US' ? "Invalid input, please retype your request" 
        : "Entrée invalide, veuillez retaper votre demande"
        );
      break;
  }
}

onStart();
