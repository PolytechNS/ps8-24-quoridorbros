let loadGameButton = document.getElementById("loadGame");
let newGameButton = document.getElementById("newGame");

function storeAiProfile() {
  const profileOpponent = {
    elo: 1000,
    photo: "./assets/images/profile/img1.webp",
    username: "ai",
  };
  const profileOpponentString = JSON.stringify(profileOpponent);
  localStorage.setItem("profileOpponentString", profileOpponentString);
}
loadGameButton.addEventListener("click", function () {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue !== undefined) {
    let connected = JSON.parse(connectedCookieValue);
    loadGame(connected.token);
    storeAiProfile();
    window.location.href = "../aiGame/aiGame.html";
  }
});

newGameButton.addEventListener("click", function () {
  createGame();
  storeAiProfile();
  window.location.href = "../aiGame/aiGame.html";
});
