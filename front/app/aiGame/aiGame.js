let saveButton = document.getElementById("saveButton");

saveButton.addEventListener("click", function () {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue !== undefined) {
    let connected = JSON.parse(connectedCookieValue);
    saveGame(connected.token);
    window.location.href = "../../index.html";
  }
});
