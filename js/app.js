var chatBox = document.querySelector(".chatbox__support");
var sendButton = document.querySelector(".chatbox__send__button");
var restartChatButton = document.querySelector(".chatbox__restart");
var messages = []; 

sendButton.addEventListener("click", () => onSendButton(chatBox));

restartChatButton.addEventListener("click", () => restartConversation());

const inputBox = chatBox.querySelector(".chatbox__message__input");

inputBox.addEventListener("keyup", ({ key }) => {
  if (key === "Enter") {
    onSendButton(chatBox);
  }
});


async function onStart(chatbox) {

  try {
    const response = await axios.get("http://127.0.0.1:5000/",{
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
        "Access-Control-Allow-Credentials": "true",
        "Accept": "application/json",
      },
    });

    const r = response.data;
    console.log(r);
    // let msg2 = { name: "Sam", message: r.answer };
    // messages.push(msg2);
    // updateChatText(chatbox, messages);
    textField.value = "";
  } catch (error) {
    console.error("Error:", error);
    // updateChatText(chatbox, messages);
    textField.value = "";
  }
}


async function onSendButton(chatbox) {
  var textField = chatbox.querySelector("textarea");
  let text1 = textField.value;
  if (text1 === "") {
    return;
  }

  let msg1 = { name: "User", message: text1 };
  messages.push(msg1); // Adding new messages to the existing array

  try {
    const response = await axios.post("http://127.0.0.1:5000/chat", { message: text1 }, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
        "Access-Control-Allow-Credentials": "true",
        "Accept": "application/json",
      },
    });
    const r = response.data;
    console.log(r);
    let msg2 = { name: "Sam", message: r.answer };
    messages.push(msg2); // Adding the response message to the existing array
    updateChatText(chatbox, messages);
    textField.value = "";
  } catch (error) {
    console.error("Error:", error);
    updateChatText(chatbox, messages);
    textField.value = "";
  }
}


function updateChatText(chatbox, messages) {
  var html = "";
  messages.slice().reverse().forEach(function (item, index) {
    if (item.name === "Sam") {
      html += '<div class="messages__item messages__item--visitor">' + item.message + "</div>";
    } else {
      html += '<div class="messages__item messages__item--operator">' + item.message + "</div>";
    }
  });

  const chatmessage = chatbox.querySelector(".chatbox__messages");
  chatmessage.innerHTML = html;
}


function restartConversation() {
  const chatmessage = chatBox.querySelector(".chatbox__messages");
  chatmessage.innerHTML = "";
  messages = [];
}
