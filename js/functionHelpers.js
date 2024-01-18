
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

function completeMedList() {
  console.log("complete button");
  pushPharmaFeedbackMessages("identity");
  enableTextarea(inputBox);
  currentStep = 1;
}

async function confirmedPayment() {
  pushPharmaFeedbackMessages("placing-order");
  disableTextarea(inputBox);

  let response = await sendMail(selectedSearchedDrugs, userInfo);
  if (!response) {
    pushPharmaFeedbackMessages("order-failed");
    enableTextarea(inputBox);
    return;
  } else {
    pushPharmaFeedbackMessages("order-sent");
    pushPharmaMessage(
      locale === "en-US"
        ? "Your drugs will ne delivered to you in the next one hour."
        : "Vos médicaments vous seront livrés dans l'heure qui suit."
    );
    return;
  }
}

function continueSelecting() {
  pushPharmaFeedbackMessages("medications");
  enableTextarea(inputBox);
  currentStep = 0;
}

function resendPayment() {
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
      locale === "en-US" || locale === "en"
        ? `
        <div>
          <p>Address Information</p>
          <p> City : ${userInfo["city"]} </p>
          <button class="btn btn-warning " onclick="reselectAddress()">NO, RESELECT</button>
        </div>
      `
        : `
        <div>
          <p> Informations sur l'adresse </p>
          <p> Ville : ${userInfo["city"]} </p>
          <button class="btn btn-warning " onclick="reselectAddress()">NON, RESELECT</button>
        </div>
      `;

    pushPharmaMessage(address);
    pushPharmaMessage(getTranslation("drug"));
    enableTextarea(inputBox);
    return;
  } else {
    pushPharmaFeedbackMessages("quarter");
    onDisplayLocationDropDown();
  }
}

function onDisplayLocationDropDown() {
  let pickupLocationDropdown = document.querySelector(
    ".pickup-location-dropdown"
  );
  pickupLocationDropdown.innerHTML = "";

  quarters.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(optionText);
    option.text = optionText["name"];
    pickupLocationDropdown.appendChild(option);
  });

  pickupLocationDropdown.addEventListener("change", function () {
    onSelectQuarter(this.value);
  });
}

function onSelectQuarter(quarter) {
  quarter = JSON.parse(quarter);
  userInfo["quarter"] = quarter["name"];
  let address =
    locale === "en-US" || locale === "en"
      ? `
      <div>
        <p>Is your address information correct ? If yes , continue</p>
        <p> City : ${userInfo["city"]} </p>
        <p> Quarter : ${userInfo["quarter"]} </p>
        <button class="btn btn-warning " onclick="reselectAddress()">NO, RESELECT</button>
      </div>
    `
      : `
      <div>
        <p>Votre adresse est-elle correcte ? Si oui, continuer</p>
        <p> Ville : ${userInfo["city"]} </p>
        <p> Quartier : ${userInfo["quarter"]} </p>
        <button class="btn btn-warning " onclick="reselectAddress()">NON, RESELECT</button>
      </div>
    `;
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

