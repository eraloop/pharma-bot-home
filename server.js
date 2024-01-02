// Description: This file contains the logic for the chatbox
let chatBox = document.querySelector(".chatbox__support");
let sendButton = document.querySelector(".chatbox__send__button");
let restartChatButton = document.querySelector(".chatbox__restart");

// this is the list of messages in the chatbox
let messages = [];
// this is the drug list loaded from the json file
// onload drugs method loads the drugs from the product.json file or the test.json file
let drugList =  [];
// this is the list of drugs the user has typed
let userPrompts = [];
// this is the list of drugs the user wants to order
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

// this fuction starts the conversation, 
async function onStart(chatbox) {
    drugList =  await onLoadDrugs()
    let greeting = { 
        name: "SOS Pharma", 
        message: `Hello <br> Welcome to SOS Pharma <br> Please which medications will you like to order today ?`
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
    let userPrompt = textField.value.trim();
    if (userPrompt === "") return;
  
    const userPromptLowerCase = userPrompt.toLowerCase().trim();
    const clearText = 'clear';
    const completeText = 'complete';
    const replyYes = 'yes';
    const replyNo = 'no';

    // prompt the user to enter done again to close the conversation
    // if(userPrompt != 'done' &&  userDrugs.length === 0){
    // }

  
    switch (currentStep) {

        case 0:

            pushUserMessage(userPrompt);
            clearTextField(textField)
            
            if(userPrompt != 'done'){

                isDrugFound = false;
                const userPrompts = userPrompt.split(/\s+|,/);
                userDrugs = matchUserDrugs(drugList, userPrompts, orderKeywords);
                console.log(userDrugs.length)
                console.log(userDrugs)
                console.log(isDrugFound)

                if(!isDrugFound){
                    pushPharmaFeedbackMessages("drug-found")
                    return;
                }

                const medicationTableHtml = prepareMedicationTable(userDrugs);
                pushPharmaMessage(medicationTableHtml);
                pushPharmaFeedbackMessages("choose-drug");
                clearTextField(textField);

            }else{
                currentStep++;
            }
           
            // pushPharmaFeedbackMessages("medications");
            break;

        case 1:

            


    

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
    onStart();
}


window.addEventListener('beforeunload', function(){
  localStorage.setItem('messages', JSON.stringify(messages));
});

window.addEventListener('load', function() {
  let messages = JSON.parse(localStorage.getItem('messages'));
  if (Array.isArray(messages)) {
      isMessagesLoaded = true;
      messages = messages
  } else {
      isMessagesLoaded = false;
  }
});


// helper function to push pharma message on the chatbox
function pushPharmaMessage(reply) {
  messages.push({ name: "SOS Pharma", message: reply });
  updateChatText(chatBox, messages);
}
  
// helper function to help display bot feedback messages, 
function pushPharmaFeedbackMessages(currentCase) {
    switch(currentCase){
        case "phone":
            pushPharmaMessage("Please enter a valid Cameroonian phone number, it must begin with the digits 6, 2, 3, etc");
            break;
        case "medications":
            pushPharmaMessage("Please retype your list of medications, write only the name as prescribed by your medical doctor");
            break;
        case "medications-complete":
            pushPharmaMessage("Are your medications correct and complete ??  if not, please type CLEAR, if yes, type COMPLETE");
            break;
        case "resend-billing-request":
            pushPharmaMessage("Billing request has been resend, please confirm");
            break;
        case "no-medication": 
            pushPharmaMessage("No Medication identified, please provide the list of medications you wish to order as specified by your medical personnel")
            break;
        case "keywords": 
            pushPharmaMessage("Please reply with the above specified keywords")
            break;
        case "input": 
            pushPharmaMessage("Please reply with the above specified keywords")
            break;
        case "more-meds": 
            pushPharmaMessage("Do you wish to order any other medication, if yes, please type the name of the medication, if no, please type DONE")
            break;
        case "drug-found": 
            pushPharmaMessage("The requested drug isnt available, Please make sure the spelling is correct and try again")
            break;
        case "choose-drug": 
            pushPharmaMessage("Please select your medication from the list above, reply with the index e.g 1, 2, 3, etc")
            break;
        default:
            pushPharmaMessage("Invalid input, please retype your request");
            break;
    }
  
}
  
onStart();