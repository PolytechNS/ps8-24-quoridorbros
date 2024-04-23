function getMessages(otherClientUsername) {
  socket.emit("getMessages", otherClientUsername);
}

function getUnreadMessages(otherClientUsername) {
  socket.emit("getUnreadMessages", otherClientUsername);
}

getSocket()
  .then((socket) => {
    // Une fois que la promesse est résolue (c'est-à-dire que le cookie est reçu),
    // utilisez la socket ici
    socket.on("messages", (message) => {
      updateMessages(message.data);
    });

    socket.on("unreadMessages", (message) => {
      updateMessages(message.data);
    });
  })
  .catch((error) => {
    console.error("Impossible de récupérer la socket : ", error);
  });

function sendMessage(receiverUsername, message) {
  const data = { receiverUsername: receiverUsername, message: message };
  socket.emit("sendMessage", data);
}
