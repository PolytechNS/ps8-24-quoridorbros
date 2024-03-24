const chatContainer = document.getElementById('chat-container');


// Fonction pour ajouter un message dans la boîte de chat
function appendMessage(sender, message) {
    let chatBox = document.getElementById('chat-box');
    let messageElement = document.createElement('div');
    messageElement.innerHTML = '<strong>' + sender + ':</strong> ' + message;
    chatBox.appendChild(messageElement);
    // Faites défiler la boîte de chat pour afficher le dernier message
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Fonction pour envoyer un message
function sendMessage() {
    var messageInput = document.getElementById('message-input');
    var message = messageInput.value;
    // Ajoutez ici votre code pour envoyer le message au serveur
    // Par exemple, vous pouvez utiliser une requête AJAX pour l'envoyer à une API
    // et gérer la réponse de l'API en affichant le message dans la boîte de chat
    // Remplacez ce commentaire par votre propre logique de communication avec le serveur
    // En attendant, affichons simplement le message localement
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
