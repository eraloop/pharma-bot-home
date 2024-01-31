function levenshteinDistance(s, t){
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const arr = [];
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
            );
    }
  }
  return arr[t.length][s.length];
};

function clearTextField(textField) {
  textField.value = "";
}

function updateChatText(chatbox, messages) {
  var html = "";
  messages
    .slice()
    .reverse()
    .forEach(function (item, index) {
      if (item.name === "SOS Pharma") {
        html +=
          '<div class="sos-pharma-message"> ' +
          '<div class="profile-icon">' +
          '<img src="/images/new_logo.jpg" alt="Profile Icon" height="25">' +
          "</div>" +
          '<div class="messages__item messages__item--visitor">' +
          '<div class="message-bubble">' +
            item.message +
          "</div>" +
          "</div>" +
          "</div>";
      } else {
        html +=
          '<div class="messages__item messages__item--operator">' +
          item.message +
          "</div>";
      }
    });

  const chatmessage = chatbox.querySelector(".chatbox__messages");
  chatmessage.innerHTML = html;
  
}

function validateCameroonianPhoneNumber(phoneNumber) {
  // Regular expressions for each network provider
  const mtnPattern = /^(67[1-9]|68[0-4]|65[5-9])\d{6}$/;
  const orangePattern = /^(69[1-4]|68[5-9]|65[1-4])\d{6}$/;
  const camtelPattern = /^62\d{6}$/;

  const isValid =
    mtnPattern.test(phoneNumber) ||
    orangePattern.test(phoneNumber) ||
    camtelPattern.test(phoneNumber);
  let network = "Unknown";

  if (isValid) {
    if (mtnPattern.test(phoneNumber)) {
      network = "MTN";
    } else if (orangePattern.test(phoneNumber)) {
      network = "Orange";
    } else if (camtelPattern.test(phoneNumber)) {
      network = "Camtel";
    }
  }

  return {
    isValid,
    network,
  };
}

function cleanMedicationName(medicationName) {
  const abbreviationsToFilter = [
    "cpr",
    "sol",
    "inj",
    "amp",
    "sp",
    "gel",
    "pdr",
    "susp",
    "supp",
    "pomm",
    "pommade",
    "pomma",
    "pdre",
    "pell",
    "EG",
    "FORT",
    "teva",
    "inf",
    "/",
    "BT",
    "FL",
    "MG",
    "IV",
    "UBI",
    "BUV",
    "COLL",
    "BU",
  ];
  const numberPattern = /\b\d+\b|\b\w*\d\w*\b/g;
  const abbreviationPattern = new RegExp(
    `\\b(${abbreviationsToFilter.join("|")})\\b`,
    "gi"
  );
  let cleanedMedicationName = medicationName.replace(numberPattern, "").trim();
  cleanedMedicationName = cleanedMedicationName
    .replace(abbreviationPattern, "")
    .trim();
  return cleanedMedicationName;
}

function matchUserDrugs(drugs, userPrompts, orderKeywords) {
  let userDrugs = [];
  let drugmatch = false;
  let drugSearchComplaint = false;
  let isDrugFound = false;

  if (
    userPrompts.length === 0 ||
    !userPrompts.some((prompt) => prompt.trim() !== "")
  ) {
    return userDrugs;
  }

  for (const prompt of userPrompts) {
    if (prompt.trim() === "" || orderKeywords.includes(prompt)) {
      continue;
    }

    for (const drug of drugs) {
      const medicationName = cleanMedicationName(
        drug.name.toLowerCase().trim()
      );
      const searchString = prompt.toLowerCase().trim();

      if (userDrugs.length == 10) {
        drugSearchComplaint = true;
        break;
      }

      if (medicationName.substring(0, 3) == searchString.substring(0, 3)) {
        drugmatch = stringSearch(medicationName, searchString);
        if (!drugmatch) {
          drugmatch = levenshteinSearch(medicationName, searchString);
        }

        if (drugmatch) {
          userDrugs.push(drug);
          isDrugFound = true;
        }
      }
    }
  }

  return {
    drugSearchComplaint,
    userDrugs,
    isDrugFound,
  };
}

// not in use - used for testing with json drugs 
async function onLoadDrugs() {
  try {
    let response = await fetch("../data/test.json");
    let drugs = await response.json();
    return drugs;
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function onLoadPaymentDetails() {
  try {
    let response = await fetch("../data/config.json");
    let payment = await response.json();
    return payment;
  } catch (e) {
    console.log(e);
    return {};
  }
}

function stringSearch(medicationName, searchString) {
  return medicationName.includes(searchString);
}

function levenshteinSearch(medicationName, searchString) {
  return levenshteinDistance(medicationName, searchString) <=
    searchString.length + 2
    ? true
    : false;
}

async function loadExcel() {
  let drugs = [];
  let drugsLoaded = false;

  const fetchExcelData = () => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const excelUrl = "../data/drugs.xlsx";
      xhr.open("GET", excelUrl, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = function () {
        if (xhr.status === 200) {
          const data = new Uint8Array(xhr.response);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          jsonData.forEach((row) => {
            const drugObject = {
              name: row["name"],
              price: row["price"],
            };
            drugs.push(drugObject);
          });
          resolve();
        } else {
          console.error("Failed to load the Excel file.");
          reject();
        }
      };
      xhr.send();
    });
  };

  try {
    await fetchExcelData();
    if (drugs.length > 0) {
      drugsLoaded = true;
    }
  } catch (error) {
    console.error("An error occurred while loading drugs:", error);
  }

  return {
    drugs: drugs,
    isLoaded: drugsLoaded,
  };
}

function disableTextarea(textarea) {
  clearTextField(textarea);
  textarea.disabled = true;
  textarea.classList.add("disabled");
  textarea.nextElementSibling.children[0].style.filter = 'grayscale(100%)'
  textarea.nextElementSibling.children[0].style.pointerEvents = 'none'
  textarea.parentNode.classList.add("disabled-parent");
  
}

function enableTextarea(textarea) {
  textarea.disabled = false;
  textarea.classList.remove("disabled");
  textarea.nextElementSibling.children[0].style.filter = ''
  textarea.nextElementSibling.children[0].style.pointerEvents = 'cursor'
  textarea.parentNode.classList.remove("disabled-parent");
  textarea.focus();
}

function disableButton(button) {
  button.classList.remove("btn-success", "btn-sm");
  button.classList.add("disabled-button");
  button.innerHTML = "Selected";
  button.disabled = true;
  console.log(button)
}


function generateWhatsAppLink(orderId, userInfo) {
  const baseUrl = 'https://wa.me/';
  const fullPhoneNumber = '+237673572533'.replace(/\D/g, '');
  const message = `Hello, I want an invoice for my order id: ${orderId['orderId']}. \nOrder Detail: \nOrder Id: ${orderInfo['orderId']} \nPayment Reference No: ${orderInfo['paymentReference']} \nPayment Phone: ${orderInfo['paymentPhone']}. \nMy information is as follows: \nName: ${userInfo['name']} \nPhone Number: ${userInfo['phone']} \nCity: ${userInfo['city']} \nQuarter: ${userInfo['quarter']} \n\nThank you`;
  const whatsappLink = `
    <a class='btn btn-success' href="${baseUrl}${fullPhoneNumber}?text=${encodeURIComponent(message)}" target="_blank"> Get Your Order Invoice</a>
  `;
  console.log(whatsappLink);
  return whatsappLink;
}


async function onLoadCities() {
  try {
    let response = await fetch("../data/geolocation.json");
    let locations = await response.json();
    return locations['cities'];
  } catch (e) {
    console.log(e);
    return [];
  }
}

function getOrderKeywords(locale){

  return locale === 'en-US' ?  [
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
  ] : [
  "je",
  "veux",
  "commander",
  "acheter",
  "obtenir",
  "acquérir",
  "avoir",
  "recevoir",
  "s'il vous plaît",
  "pouvez",
  "pourriez",
  "j'ai besoin",
  "j'aimerais",
  "ajouter",
  "passer",
  "un",
  "le",
  "quelques",
  "une",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "donne-moi",
  "envoie-moi",
  "fais-moi",
  "fournis-moi",
  "livre",
  "envoie",
  "approvisionne",
  "va chercher",
  "apporte",
  "livre",
  "fais parvenir",
  "expédie",
  "transfère",
  "expédie",
  "remets",
  "sert",
  "se procure",
  "obtient",
  "sécurise",
  "reçoit",
  "dépose",
  "passe une commande pour",
  "demande",
  "achète-moi",
  "achète",
  "commande",
  "achète",
  "quelques",
  "achète",
  "obtiens",
  "acquiers",
  "monte",
  "choisis",
  "sélectionne",
  "réserve",
  "réserve",
  "pour",
  "moi",
  "commande",
  "achète",
  "obtiens",
  "achète",
  "apporte",
  "compte",
  "mon",
  "sur",
  "commande",
  "dosage",
  "pilule",
  "comprimé",
  "capsule",
  "sirop",
  "liquide",
  "injection",
  "pommade",
  "pommade",
  "supplément",
  "vitamine",
  "antibiotique",
  "antidouleur",
  "antiacide",
  "antihistaminique",
  "antiviral",
  "inhalateur",
  "tension artérielle",
  "antidépresseur",
  "anxiété",
  "allergie",
  "toux",
  "rhume",
  "grippe",
  "fièvre",
  "mal de tête",
  "douleur",
  "soulagement",
  "santé",
  "bien-être",
  "prescrire",
  "traitement",
  "bonjour",
  "salut",
  "hé",
  "bien",
  "matin",
  "après-midi",
  "soir",
  "nuit",
  "comment",
  "allez",
  "vous",
  "ça va",
  "bien",
  ];
  
}

function closePaymentWidget() {
  var widget = document.getElementById('myCamPayModal');
  widget.style.display = 'none';
}

