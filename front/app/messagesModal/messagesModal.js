const messagesModalContainer = document.getElementById(
  "messages-modal-container",
);
let messagesContainer;
let intervalBeetweenFetch;
let friendUsername;

function setUpMessagesModalListeners() {
  document
    .getElementsByClassName("close")[0]
    .addEventListener("click", function () {
      clearInterval(intervalBeetweenFetch);
      messagesModalContainer.innerHTML = "";
    });

  window.addEventListener("click", function (event) {
    if (event.target == document.getElementById("myModal")) {
      clearInterval(intervalBeetweenFetch);
      messagesModalContainer.innerHTML = "";
    }
  });

  document
    .getElementById("send-message-button")
    .addEventListener("click", () => {
      let messageInput = document.getElementById("message-input");
      const message = messageInput.value;
      const receiverUsername = friendUsername;
      messageInput.value = "";
      sendMessage(receiverUsername, message);

      const messageElement = { content: message, sender: getUsername() };
      createMessageElement(messageElement);
    });
}

async function startFetchMessagesLoop() {
  getMessages(friendUsername);
  intervalBeetweenFetch = setInterval(
    () => getUnreadMessages(friendUsername),
    5000,
  );
}

function updateMessages(messages) {
  for (const message of messages) {
    createMessageElement(message);
  }
}

function createMessageElement(message) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  if (message.sender == getUsername()) {
    messageElement.classList.add("our-message");
  } else {
    messageElement.classList.add("other-player-message");
  }
  const messageContent = document.createElement("p");
  messageContent.textContent = message.content;
  messageElement.appendChild(messageContent);
  messagesContainer.appendChild(messageElement);
}

async function loadMessagesModal(username) {
  friendUsername = username;
  const response = await fetch("../../app/messagesModal/messagesModal.html");
  const html = await response.text();
  messagesModalContainer.innerHTML = html;
  messagesContainer = document.getElementById("messages-container");
  const messageWithText = document.getElementById("message-with-text");
  messageWithText.textContent = "Messages with " + username;
  document.getElementById("messsages-modal").style.display = "block";
  setUpMessagesModalListeners();
  startFetchMessagesLoop();
}
