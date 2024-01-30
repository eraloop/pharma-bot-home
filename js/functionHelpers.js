
function medicationDone() {
  pushPharmaFeedbackMessages("prescribtion-type");
  selectPrescriptionType();
  disableTextarea(inputBox);
}

function clearMedicationList() {
  selectedSearchedDrugs = [];
  pushPharmaFeedbackMessages("medications");
  currentStep = 0;
  enableTextarea(inputBox);
}

function clearDrugList() {
  userDrugs = [];
  messages.pop(); messages.pop();
  pushPharmaFeedbackMessages("drugs-cleared");
  currentStep = 0;
  enableTextarea(inputBox);
}

async function makePayment(token, body) {
  try {

    let payment = await mobilePayment(token, body);
    if (payment["success"] === true) {
      transactionId = payment["reference"];
      pushPharmaFeedbackMessages("confirm-payment");
      pushPharmaFeedbackMessages("billing-request-followup");
      return true;
    } else {
      return false
    }
  } catch (error) {
    console.error("Error in makePayment:", error);
  }
}


function completeMedList() {
  console.log("complete button");
  pushPharmaFeedbackMessages("identity");
  enableTextarea(inputBox);
  currentStep = 1;
}

async function checkTransactionStatus(token , transactionId) {
  
  let paymentStatus = await requestPaymentStatus(token , transactionId)
  console.log("result from chek transaction status" ,paymentStatus)
  if (!paymentStatus) {
    pushPharmaFeedbackMessages("order-failed");
    enableTextarea(inputBox);
    return;
  } else {
    pushPharmaFeedbackMessages("order-placed");
    pushPharmaFeedbackMessages("order-followup");
    currentStep++;
  }

}

async function sendOrderMail(){

  try{

    let response = await sendMail(selectedSearchedDrugs, userInfo);
    if (!response) {
      pushPharmaFeedbackMessages("order-failed");
      enableTextarea(inputBox);
      return;
    } else {
      
      pushPharmaFeedbackMessages("order-sent");
      pushPharmaMessage(getTranslation("order-delivery"));

      let waLink = generateWhatsAppLink(orderInfo, userInfo)
      pushPharmaMessage(waLink)
      pushPharmaMessage(getTranslation("waMessage"));

      return;
    }

  }catch(e){
    console.log("order mail failed to send")
  }
}

async function confirmedPayment() {

  await checkTransactionStatus(token , transactionId)
  pushPharmaFeedbackMessages("placing-order");
  disableTextarea(inputBox);

  orderInfo['paymentReference'] = transactionId,
  orderInfo['paymentPhone'] = userInfo['phone'],
  orderInfo['orderId'] = "orderId" + Date.now().toString(36) + Math.random().toString(16).slice(2)
        
  await sendOrderMail()

}

function continueSelecting() {
  pushPharmaFeedbackMessages("medications");
  enableTextarea(inputBox);
  currentStep = 0;
}

async function resendPayment(token, body) {
  await makePayment(token, body);
  pushPharmaFeedbackMessages("resend-billing-request");
  pushPharmaFeedbackMessages("billing-request-followup");
}

function onDisplayCityDropDown() {
  let locationDropdown = document.querySelector(".location-dropdown");
  locationDropdown.innerHTML = "";

  locations.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(optionText);
    option.text = optionText["name"];
    locationDropdown.appendChild(option);
  });

  locationDropdown.addEventListener("change", function () {
    onSelectCity(this.value);
  });
}

function onSelectCity(city) {
  city = JSON.parse(city);
  userInfo["city"] = city["name"];
  quarters = city["quarters"];
  if (quarters.length == 0) {
    let address = 
      locale !== "fr-FR" || locale !== "fr"
        ? `
        <div>
          <p>Address Information</p>
          <p> City : ${userInfo["city"]} </p>
          <button class="btn btn-danger " onclick="reselectAddress()">NO, RESELECT</button>
        </div>
      `
        : `
        <div>
          <p> Informations sur l'adresse </p>
          <p> Ville : ${userInfo["city"]} </p>
          <button class="btn btn-danger " onclick="reselectAddress()">NON, RESELECT</button>
        </div>
      `;

    messages.pop();
    pushPharmaMessage(address);
    pushPharmaMessage(getTranslation("drug"));
    enableTextarea(inputBox);
    return;
  } else {
    messages.pop();
    pushPharmaFeedbackMessages("quarter");
    onDisplayLocationDropDown();
  }
}


function onDisplayLocationDropDown() {
  let pickupLocationDropdown = document.querySelector(".pickup-location-dropdown");
  pickupLocationDropdown.innerHTML = "";

  quarters.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(optionText);
    option.text = optionText["name"];
    pickupLocationDropdown.appendChild(option);
  });

  pickupLocationDropdown.addEventListener("change", function () {
    onSelectQuarter(this.value);
    this.value = this.value;
  });
}


function onSelectQuarter(quarter) {
  quarter = JSON.parse(quarter);
  userInfo["quarter"] = quarter["name"];
  let address =  
    locale !== "fr-FR" || locale !== "fr"
      ? `
      <div>
        <p>Is your address information correct ? If yes , continue</p>
        <p> City : ${userInfo["city"]} </p>
        <p> Quarter : ${userInfo["quarter"]} </p>
        <button class="btn btn-danger" onclick="reselectAddress()">NO, RESELECT</button>
      </div>
    `
      : `
      <div>
        <p>Votre adresse est-elle correcte ? Si oui, continuer</p>
        <p> Ville : ${userInfo["city"]} </p>
        <p> Quartier : ${userInfo["quarter"]} </p>
        <button class="btn btn-danger" onclick="reselectAddress()">NON, RESELECT</button>
      </div>
    `;
    removeDataFromLocalStorage()
    saveUserToLocalStorage(userInfo)
    messages.pop();
    pushPharmaMessage(address);
    pushPharmaMessage(getTranslation("drug"));
    enableTextarea(inputBox);
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
      this.value = this.value
    });
  
   
}
  
function onSelectDrugQuantity(quantity){

currentDrug['quantity'] = quantity;
selectedSearchedDrugs.push(currentDrug);
pushPharmaMessage(`<p class='bold-text'> ${JSON.stringify(currentDrug["name"])}  added to your list</p>`);
pushPharmaFeedbackMessages("more-meds");

// const buttons = document.querySelectorAll(".select-medication-option");
// buttons.forEach(function(button) {
//   disableButton(button); 
// });

}

function selectPrescriptionType() {

let locationDropdown = document.querySelector(".prescription-type");
locationDropdown.innerHTML = "";

let prescriptionType = (locale === 'en-US' || locale === 'en') ? ["Select Below", "Prescribed Drug", "Unprescribed Drug"] : ["Sélectionnez ci-dessous", "Ordonnance", 'Auto Medication']

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

totalCost = 0;
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
  removeDataFromLocalStorage()
  updateChatText(chatBox, messages)
  pushPharmaFeedbackMessages("city");
  onDisplayCityDropDown();
  disableTextarea(inputBox);
}

function addMedicationToCart(index) {
    currentDrug = userDrugs[index];  
    pushPharmaFeedbackMessages("drug-quantity");
    selectDrugQuantity()
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

function saveUserToLocalStorage(userInfo){
  localStorage.setItem("user", JSON.stringify(userInfo));
}

function getUserFromLocalStorage(){
  return localStorage.getItem("user");
}

function addressCorrect(){
  pushPharmaMessage(getTranslation("drug"));
  enableTextarea(inputBox);
}

function removeDataFromLocalStorage(){
  localStorage.removeItem("user");
}
