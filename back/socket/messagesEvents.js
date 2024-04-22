const { SocketMapper } = require("./socketMapper");
const {
  getMessagesBetweenUsers,
  getIdOfUser,
  getUnreadMessages,
  hasUnreadMessages,
  sendMessage,
} = require("../mongoDB/mongoManager");
const { SocketSender } = require("./socketSender");

function configureMessagesEvents(socket) {
  socket.on("getMessages", async (otherClientUsername) => {
    const userId = SocketMapper.getUserIdBySocketId(socket.id);
    const otherClientId = await getIdOfUser(otherClientUsername);
    const messages = await getMessagesBetweenUsers(userId, otherClientId);
    SocketSender.sendMessage(userId, "messages", messages);
  });

  socket.on("getUnreadMessages", async (otherClientUsername) => {
    const userId = SocketMapper.getUserIdBySocketId(socket.id);
    const otherClientId = await getIdOfUser(otherClientUsername);
    const unreadMessages = await getUnreadMessages(userId, otherClientId);
    SocketSender.sendMessage(userId, "unreadMessages", unreadMessages);
  });

  socket.on("hasUnreadMessages", async (otherClientUsername) => {
    const userId = SocketMapper.getUserIdBySocketId(socket.id);
    const otherClientId = await getIdOfUser(otherClientUsername);
    const rslt = await hasUnreadMessages(userId, otherClientId);
    SocketSender.sendMessage(userId, "hasUnreadMessages", {
      friend: otherClientUsername,
      rslt,
    });
  });

  socket.on("sendMessage", async (data) => {
    const userId = SocketMapper.getUserIdBySocketId(socket.id);
    console.log("sendMessage", data);
    const receiverId = await getIdOfUser(data.receiverUsername);
    console.log("receiverId", receiverId);
    await sendMessage(userId, receiverId, data.message);
  });
}

exports.configureMessagesEvents = configureMessagesEvents;
