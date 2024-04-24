function enterMatchMaking() {
  if (localStorage.getItem("profileOpponentString")) {
    localStorage.removeItem("profileOpponentString");
  }
  getSocket()
    .then((socket) => {
      // Une fois que la promesse est résolue (c'est-à-dire que le cookie est reçu),
      // utilisez la socket ici
      socket.emit("startMatchMaking");
    })
    .catch((error) => {
      console.error("Impossible de récupérer la socket : ", error);
    });
}

function quitMatchMaking() {
  socket.emit("quitMatchMaking");
  window.location.href = "../../index.html";
}
function quitChallenging() {
  socket.emit("cancelChallenge");
  window.location.href = "../../index.html";
}

socket.on("RoomFull", (msg) => {
  let profileOpponentDataString = JSON.stringify(msg.data);
  localStorage.setItem("profileOpponentString", profileOpponentDataString);
  opponentFound(msg.data);
});

socket.on("friendConnected", (msg) => {
  let username = msg;
  console.log("friendConnected" + username);
  document
    .getElementById("friendID-" + username)
    .classList.add("friendConnected");
});

socket.on("challengeAccepted", (msg) => {
  let profileOpponentDataString = JSON.stringify(msg.data);
  localStorage.setItem("profileOpponentString", profileOpponentDataString);
  opponentFound(msg.data);
});

socket.on("challengeDeclined", (msg) => {
  quitChallenging();
});
