socket.on("RoomFull", (msg) => {
  console.log("RoomFull");
  let profileOpponentDataString = JSON.stringify(msg.data);
  localStorage.setItem("profileOpponentString", profileOpponentDataString);
  opponentFound(msg.data);
});

