
function medicationDone() {

    // userInfo['prescriptionType'] = response
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
    pushPharmaMessage(getTranslation("medications-complete"));

}

function clearMedicationList() {
  selectedSearchedDrugs = [];
  pushPharmaMessage(getTranslation("medications"));
  currentStep = 0;
  enableTextarea(inputBox);
}

function clearDrugList() {
  userDrugs = [];
  messages.pop(); messages.pop();messages.pop();
  pushPharmaMessage(getTranslation("drugs-cleared"));
  currentStep = 0;
  enableTextarea(inputBox);
}

async function makePayment(token, body) {
  try {

    let payment = await mobilePayment(token, body);
    if (payment["success"] === true) {
      transactionId = payment["reference"];
      pushPharmaMessage(getTranslation("confirm-payment"));
      pushPharmaMessage(getTranslation("billing-request-followup"));
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
  pushPharmaMessage(getTranslation("identity"));
  enableTextarea(inputBox);
  currentStep = 1;
}

async function checkTransactionStatus(token , transactionId) {
  
  let paymentStatus = await requestPaymentStatus(token , transactionId)
  console.log("result from chek transaction status" ,paymentStatus)
  if (!paymentStatus) {
    pushPharmaMessage(getTranslation("order-failed"));
    enableTextarea(inputBox);
    return;
  } else {
    pushPharmaMessage(getTranslation("order-placed"));
    pushPharmaMessage(getTranslation("order-followup"));
    currentStep++;
  }

}

async function sendOrderMail(){

  try{

    let response = await sendMail(selectedSearchedDrugs, userInfo, orderInfo);
    if (!response) {
      pushPharmaMessage(getTranslation("order-failed"));
      enableTextarea(inputBox);
      return;
    } else {
      messages.pop();
      pushPharmaMessage(getTranslation("order-sent"));
      let waLink = generateWhatsAppLink(orderInfo, userInfo)
      pushPharmaMessage(waLink)
      pushPharmaMessage(getTranslation("waMessage"));
      pushPharmaMessage(getTranslation("order-again"));

      return;
    }

  }catch(e){
    console.log("order mail failed to send")
  }
}

async function confirmedPayment() {

  await checkTransactionStatus(token , transactionId)
  pushPharmaMessage(getTranslation("placing-order"));
  disableTextarea(inputBox);

  orderInfo['paymentReference'] = transactionId,
  orderInfo['paymentPhone'] = userInfo['phone'],
  // orderInfo['orderId'] = "orderId" + Date.now().toString(36) + Math.random().toString(16).slice(2)
        
  await sendOrderMail()

}

function continueSelecting() {
  currentDrug = {};
  pushPharmaMessage(getTranslation("medications"));
  enableTextarea(inputBox);
  currentStep = 0;
}

async function resendPayment(token, body) {
  await makePayment(token, body);
  pushPharmaMessage(getTranslation("resend-billing-request"));
  pushPharmaMessage(getTranslation("billing-request-followup"));
}

function onDisplayCityDropDown() {
  let locationDropdown = document.querySelector(".location-dropdown");
  locationDropdown.innerHTML = "";

  locations.reverse().forEach((optionText) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(optionText);
    option.text = optionText["name"];
    locationDropdown.appendChild(option);
  });

  locationDropdown.selectedIndex = locationDropdown.options.length - 1;
  locationDropdown.focus();

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
      locale == 'en'
        ? `
        <div>
          <p>Address Information</p>
          <p> City : ${userInfo["city"]} </p>
          <div class='buttons'>
            <button class="btn btn-danger " onclick="reselectAddress()">NO, RESELECT</button>
            <button class="btn btn-success " onclick="addressCorrect()">CORRECT</button>
          </div>
        </div>
      `
        : `
        <div>
          <p> Informations sur l'adresse </p>
          <p> Ville : ${userInfo["city"]} </p>
          <div class='buttons'>
            <button class="btn btn-danger " onclick="reselectAddress()">CORRECTION</button>
            <button class="btn btn-success " onclick="addressCorrect()">CORRECTE</button>
          </div>
        </div>
      `;

    messages.pop();
    pushPharmaMessage(address);
    pushPharmaMessage(getTranslation("drug"));
    enableTextarea(inputBox);
    return;
  } else {
    messages.pop();
    pushPharmaMessage(getTranslation("quarter"));
    onDisplayLocationDropDown();
  }
}

function onDisplayLocationDropDown() {
  let pickupLocationDropdown = document.querySelector(".pickup-location-dropdown");
  pickupLocationDropdown.innerHTML = "";

  quarters.reverse().forEach((optionText) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(optionText);
    option.text = optionText["name"];
    pickupLocationDropdown.appendChild(option);
  });

  pickupLocationDropdown.selectedIndex = pickupLocationDropdown.options.length - 1;
  pickupLocationDropdown.focus();

  pickupLocationDropdown.addEventListener("change", function () {
    onSelectQuarter(this.value);
    this.value = this.value;
  });
}

function onSelectQuarter(quarter) {
  quarter = JSON.parse(quarter);
  userInfo["quarter"] = quarter["name"];
  let address =  
    locale == 'en'
      ? `
      <div>
        <p>Is your address information correct ? If yes , continue</p>
        <p> <span> City :</span> <span class='bold-text'> ${userInfo["city"]}</pan> </p> 
        <p> <span> Quarter :</pan> <pan class='bold-text'>${userInfo["quarter"]} </pan> </p>
        
        <div class='buttons'>
          <button class="btn btn-danger" onclick="reselectAddress()">NO, RESELECT</button>
          <button class="btn btn-success " onclick="addressCorrect()">CORRECT</button>
        </div>
       
      </div>
    `
      : `
      <div>
        <p>Votre adresse est-elle correcte ? Si oui, continuer</p>
        <p> <span> Ville :</span> <span class='bold-text'> ${userInfo["city"]}</pan> </p> 
        <p> <span> Quartier :</span> <span class='bold-text'>${userInfo["quarter"]} </pan> </p>

        <div class='buttons'>
          <button class="btn btn-danger" onclick="reselectAddress()">CORRECTION</button>
          <button class="btn btn-success " onclick="addressCorrect()">CORRECTE</button>
        </div>
        
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
  
    drugQuantity.reverse().forEach((optionText) => {
      const option = document.createElement("option");
      option.value = JSON.stringify(optionText);
      option.text = optionText; 
      locationDropdown.appendChild(option); 
    });
  
    locationDropdown.selectedIndex = locationDropdown.options.length - 1;
    locationDropdown.focus();

    locationDropdown.addEventListener("change", function() {
      onSelectDrugQuantity(this.value);
      this.value = this.value
    });
  
   
}
  
function onSelectDrugQuantity(quantity){

  currentDrug['quantity'] = quantity;
  selectedSearchedDrugs.push(currentDrug);
  messages.pop();
  pushPharmaMessage( locale == 'en' ?`<p> Selected Drug Quantity : <span class='bold-text'> ${quantity} </span>  </p>` : `<p> Quantité médicament sélectionnée : <span class='bold-text'> ${quantity} </span> </p>`);
  pushPharmaMessage(getTranslation("prescribtion-type"));
  selectPrescriptionType();
  disableTextarea(inputBox);

}

function selectPrescriptionType() {

  let locationDropdown = document.querySelector(".prescription-type");
  locationDropdown.innerHTML = "";

  let prescriptionType = (locale === 'en-US' || locale === 'en') ? ["Select Below", "Prescribed Drug", "Unprescribed Drug"] : ["Sélectionnez ci-dessous", "Ordonnance", 'Auto Medication']

  prescriptionType.reverse().forEach((optionText) => {
      const option = document.createElement("option");
      option.value = JSON.stringify(optionText);
      option.text = optionText; 
      locationDropdown.appendChild(option); 
  });

  locationDropdown.selectedIndex = locationDropdown.options.length - 1;
  locationDropdown.focus();

  locationDropdown.addEventListener("change", function() {
      onSelectPrescriptionType(this.value);
  });

}

function onSelectPrescriptionType(prescriptionType){
    messages.pop();
    console.log(currentDrug)

    let checker = locale == 'en' ? `"Unprescribed Drug"` : `"Auto Medication"`;
    if(currentDrug['onPrescription'] == true && prescriptionType == checker){
  
      messages.pop();
      console.log(prescriptionType)
      pushPharmaMessage( locale == 'en' ?
      `<p class='text-danger'>This drug is only available with a prescription. SOS Pharma does not sell it at the moment. Please go to a pharmacy to buy it 
      <div class='buttons'><button class='btn btn-info' onclick='continueSelecting()'> ORDER ANOTHER MEDICATION </button><button class='btn btn-success med-done-button' onclick='medicationDone()'> DONE SELECTING DRUGS </button></div>
      </p>` : 
     `<p class='text-danger'> Ce médicament n’est accessible que sous ordonnance. SOS Pharma ne le commercialise pas pour le moment. Merci de vous rendre auprès d’une pharmacie pour l’acheter 
     <div class='buttons'><button class='btn btn-info' onclick='continueSelecting()'> COMMANDE D'UN AUTRE MÉDICAMENT </button><button class='btn btn-success med-done-button' onclick='medicationDone()'> SELECTION TERMINEE </button></div>
     
     </p>`);
      return;
    }

    pushPharmaMessage( locale == 'en' ?
     `<p> Presciption Type : <span class='bold-text'> ${prescriptionType} </span> </p>` : 
    `<p> Type de prescription : <span class='bold-text'> ${prescriptionType} </span> </p>`);
    pushPharmaMessage(`<p class='bold-text'> ${JSON.stringify(currentDrug["name"])}  ${locale == 'en' ? 'added to your list' :  'ajouté à votre liste'} </p>`);
    pushPharmaMessage(getTranslation("more-meds"));
    currentStep++;
    
}


function reselectAddress(){
  messages.pop();messages.pop(); messages.pop()
  if(userInfo['quarter'] !== undefined){
      messages.pop();
  }
  removeDataFromLocalStorage()
  updateChatText(chatBox, messages)
  pushPharmaMessage(getTranslation("city"));
  onDisplayCityDropDown();
  disableTextarea(inputBox);
}

function addMedicationToCart(index) {
    messages.pop();
    currentDrug = userDrugs[index];  
    pushPharmaMessage(getTranslation("drug-quantity"));
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

function orderAgain(){
  userDrugs = [];
  selectedSearchedDrugs = [];

  pushPharmaMessage(getTranslation("medications"));
  enableTextarea(inputBox);
  currentStep = 0;

}

function nextPage(){

  if( ((page - 1) * 10) > userDrugsList.length ) {
    return;
  }
  page ++;
  messages.pop()
  messages.pop()
  messages.pop()
  userDrugs = getItemsByPage(page, 10);
  const medicationTableHtml = prepareMedicationTable(userDrugs);
  pushPharmaMessage(medicationTableHtml);
  pushPharmaMessage(getTranslation("drug-search-complaint"));
  pushPharmaMessage(getTranslation("choose-drug"));
}

function previousPage(){
  if(page == 1){
    return;
  }
  page --;
  messages.pop()
  messages.pop()
  messages.pop()
  userDrugs = getItemsByPage(page, 10);
  const medicationTableHtml = prepareMedicationTable(userDrugs);
  pushPharmaMessage(medicationTableHtml);
  pushPharmaMessage(getTranslation("drug-search-complaint"));
  pushPharmaMessage(getTranslation("choose-drug"));

}