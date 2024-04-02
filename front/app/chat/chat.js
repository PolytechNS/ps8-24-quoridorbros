const chatContainer = document.getElementById('chat-container');


// Fonction pour ajouter un message dans la boîte de chat
function appendMessage(sender, message) {
    let chatBox = document.getElementById('chat-box');
    let messageElement = document.createElement('div');
    messageElement.innerHTML = '<strong>' + sender + ':</strong> ' + message;
    messageElement.classList.add('message');
    messageElement.id = "message-" + sender;
    chatBox.appendChild(messageElement);
    // Faites défiler la boîte de chat pour afficher le dernier message
    chatBox.scrollTop = chatBox.scrollHeight;
}

socket.on("newMessage", (msg) => {
    socket.emit("Acknowledgement", msg.id);
    const message = msg.data;
    appendMessage(message.sender, message.content);
});

function sendMessage() {
    var messageInput = document.getElementById('message-input');
    var message = messageInput.value;

    socket.emit("newMessage", message );
    appendMessage('Moi', message);
    // Effacer le champ de saisie après l'envoi
    messageInput.value = '';
}


async function loadChat() {
    const response = await fetch('../chat/chat.html');
    const html = await response.text();
    chatContainer.innerHTML = html;
}

loadChat();
