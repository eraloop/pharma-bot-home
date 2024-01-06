const levenshteinDistance = (s, t) => {
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
        // console.log(medicationName, searchString);
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

          console.log("Drugs loaded successfully.");
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
  textarea.disabled = true;
}

function enableTextarea(textarea) {
  textarea.disabled = false;
}