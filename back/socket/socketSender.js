const { SocketMapper } = require("./socketMapper.js");

class SocketSender {
  static pendingMessages = [];
  static messageIdCounter = [];
  static resetTimeOut = [];

  static sendMessage(userId, message, data) {
    console.log("voici le message envoyé", message);
    const socket = SocketMapper.getSocketById(userId);

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
      data,
      timestamp: Date.now(),
    };

    this.pendingMessages[userId].push(messageObject);

    socket.emit(message, { id: messageId, data });

    this.scheduleResendIfNoAcknowledgement(userId, messageId, message, data);
  }

  static scheduleResendIfNoAcknowledgement(userId, messageId, message, data) {
    setTimeout(() => {
      if (this.resetTimeOut[userId] === true) {
        this.resetTimeOut[userId].push(false);
        this.scheduleResendIfNoAcknowledgement(
          userId,
          messageId,
          message,
          data
        );
      } else if (this.pendingMessages[userId]) {
        const index = this.pendingMessages[userId].findIndex(
          (msg) => msg.id === messageId
        );
        if (index !== -1) {
          // Si pas d'acknowledgement reçu, renvoyer le message
          const socket = SocketMapper.getSocketById(userId);
          socket.emit(message, { id: messageId, data });
        }
      }
    }, 5000);
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
