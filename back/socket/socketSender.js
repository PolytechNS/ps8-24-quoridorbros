const { SocketMapper } = require("./socketMapper.js");

class SocketSender {
  static pendingMessages = [];
  static messageIdCounter = [];

  static sendMessage(userId, message, data) {
    console.log("voici le user id", userId);
    console.log("voici le message envoyé", message);

    if (!this.messageIdCounter[userId]) {
      this.messageIdCounter[userId] = 1;
    }

    const messageId = this.messageIdCounter[userId]++;
    if (!this.pendingMessages[userId]) {
      this.pendingMessages[userId] = [];
    }

    const messageObject = {
      id: messageId,
      message,
      data,
    };

    const socket = SocketMapper.getSocketById(userId);
    if (socket) {
      //console.log("voici la socket id", socket.id);
      socket.emit(message, { id: messageId, data });
    } else {
      console.log("socket non trouvée");
      this.pendingMessages[userId].push(messageObject);
    }
  }

  static resendAllPending(userId) {
    if (this.pendingMessages[userId]) {
      const socket = SocketMapper.getSocketById(userId);
      this.pendingMessages[userId].forEach((message) => {
        socket.emit(message.message, { id: message.id, data: message.data });
      });
      this.pendingMessages[userId] = [];
    }
  }

  static pendingMessagesLogs(userId) {
    if (this.pendingMessages[userId]) {
      console.log("messages for", userId);

      this.pendingMessages[userId].forEach((message) => {
        console.log(message);
      });
    }
  }
}

exports.SocketSender = SocketSender;
