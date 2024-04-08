socket.on("RoomFull", (msg) => {
  console.log("RoomFull");
  let profileOpponentDataString = JSON.stringify(msg.data);
  localStorage.setItem("profileOpponentString", profileOpponentDataString);
  opponentFound(msg.data);
});

socket.on("friendConnected", (msg) => {
  let username = msg;
  console.log("friendConnected" + username);
  document.getElementById("friendID-"+username).classList.add("friendConnected");
});

socket.on("challengeAccepted", (msg) => {
  console.log("challengeAccepted");
  let profileOpponentDataString = JSON.stringify(msg.data);
  localStorage.setItem("profileOpponentString", profileOpponentDataString);
  opponentFound(msg.data);
});

