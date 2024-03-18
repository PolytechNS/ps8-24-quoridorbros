document.getElementById("join").addEventListener("click", function () {
    let connectedCookieValue = getCookie("connected");
    console.log("click on matchmaking");

    let connectedData = JSON.parse(connectedCookieValue);
    enterMatchMaking(connectedData);
  });

  function updateRoomInfo(roomName, opponentName) {
    document.getElementById("roomName").textContent = roomName;
    document.getElementById("opponentName").textContent = opponentName;
}

socket.on('RoomFull', (data) => {
    updateRoomInfo(data.roomName, data.opponentName);
    console.log(data);
});