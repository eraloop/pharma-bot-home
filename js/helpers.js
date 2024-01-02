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
            '<div class="messages__item messages__item--visitor">' +
            item.message +
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
  const mtnPattern = /^(67|[6][5][0-4])\d{6}$/;
  const orangePattern = /^(69|[6][5][5-9])\d{6}$/;
  const camtelPattern = /^62\d{6}$/;

  const isValid = mtnPattern.test(phoneNumber) || orangePattern.test(phoneNumber) || camtelPattern.test(phoneNumber);
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
  const abbreviationsToFilter = ['cpr', 'sol', 'inj', 'amp', 'sp', 'gel', 'pdr', 'susp', 'supp', 'pomm', 'pommade', 'pomma', 'pdre', 'pell', 'EG', 'FORT' ,  ];
  const numberPattern = /\b\d+\b|\b\w*\d\w*\b/g;
  const abbreviationPattern = new RegExp(`\\b(${abbreviationsToFilter.join('|')})\\b`, 'gi');
  let cleanedMedicationName = medicationName.replace(numberPattern, '').trim();
  cleanedMedicationName = cleanedMedicationName.replace(abbreviationPattern, '').trim();
  return cleanedMedicationName;
}


function matchUserDrugs(drugs, userPrompts, orderKeywords) {
  let userDrugs = [];

  if (userPrompts.length === 0 || !userPrompts.some(prompt => prompt.trim() !== "")) {
    return userDrugs; 
  }

  for (const prompt of userPrompts) {
    if (prompt.trim() === "" || orderKeywords.includes(prompt)) {
      continue;
    }

    for (const drug of drugs) {
      const medicationName = cleanMedicationName(drug.name.toLowerCase().trim());
      const searchString = prompt.toLowerCase().trim();

      if(levenshteinDistance(medicationName, searchString) <= 10 ){
        
      }

      if (medicationName.includes(searchString)) {
        const distance = levenshteinDistance(medicationName, searchString);
        console.log(medicationName, searchString, distance);
        // if (distance <= (searchString.length) ) {
        userDrugs.push(drug);
        // }
      }
    
    }
  }

  return userDrugs;
}


async function onLoadDrugs() {
  try{
    let response = await fetch('../data/test.json')
    let drugs = await response.json();
    console.log(drugs)
    return drugs;

  }catch(e) {
    console.log(e);
    return [];
  }

}