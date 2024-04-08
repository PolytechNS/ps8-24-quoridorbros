socket.on("RoomFull", (msg) => {
  socket.emit("Acknowledgement", msg.id);
  console.log("RoomFull");
  let profileOpponentDataString = JSON.stringify(msg.data);
  localStorage.setItem("profileOpponentString", profileOpponentDataString);
  opponentFound(msg.data);
});

socket.on("friendConnected", (msg) => {
  console.log("friendConnected" + msg);
  document.getElementById("friendID"+msg).classList.add("friendConnected");
});

socket.on("challengeAccepted", (msg) => {
  console.log("challengeAccepted");
  let profileOpponentDataString = JSON.stringify(msg.data);
  localStorage.setItem("profileOpponentString", profileOpponentDataString);
  opponentFound(msg.data);
}