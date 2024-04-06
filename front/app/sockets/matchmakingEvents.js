socket.on("RoomFull", (msg) => {
  socket.emit("Acknowledgement", msg.id);
  console.log("RoomFull");
  let profileOpponentDataString = JSON.stringify(msg.data);
  localStorage.setItem("profileOpponentString", profileOpponentDataString);
  opponentFound(msg.data);
});