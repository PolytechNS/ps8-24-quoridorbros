const { SocketMapper } = require("./socketMapper.js");

class SocketSender {
  static pendingMessages = [];
  static messageIdCounter = [];
  static resetTimeOut = [];

  static sendMessage(userId, message, data) {
    //console.log("voici le user id", userId);
    //console.log("voici le message envoyé", message);

    if (!this.messageIdCounter[userId]) {
      this.messageIdCounter[userId] = 1;
    }

    const messageId = this.messageIdCounter[userId]++;
    if (!this.pendingMessages[userId]) {
      this.pendingMessages[userId] = [];
    }

    if (!this.resetTimeOut[userId]) {
      this.resetTimeOut[userId] = [];
    }

    const messageObject = {
      id: messageId,
      message,
      data
    };

    this.pendingMessages[userId].push(messageObject);

    const socket = SocketMapper.getSocketById(userId);
    if (socket) {
      //console.log("voici la socket id", socket.id);
      socket.emit(message, { id: messageId, data });
    }
  }

  static handleAcknowledgement(userId, messageId) {
    if (this.pendingMessages[userId]) {
      const index = this.pendingMessages[userId].findIndex(
        (msg) => msg.id === messageId
      );
      if (index !== -1) {
        this.pendingMessages[userId].splice(index, 1);
      }
    }
  }

  static resendAllPending(userId) {
    if (this.pendingMessages[userId]) {
      const socket = SocketMapper.getSocketById(userId);
      this.resetTimeOut[userId].push(true);
      this.pendingMessages[userId].forEach((message) => {
        socket.emit(message.message, { id: message.id, data: message.data });
      });
    }
  }
}

exports.SocketSender = SocketSender;
