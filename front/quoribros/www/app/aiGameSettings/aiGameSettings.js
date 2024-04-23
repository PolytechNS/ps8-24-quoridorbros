let loadGameButton = document.getElementById("loadGame");

function storeEasyAiProfile() {
  const profileOpponent = {
    elo: 120,
    photo: "./assets/images/ai/mushroom.png",
    username: "Easy Ai",
  };
  const profileOpponentString = JSON.stringify(profileOpponent);
  localStorage.setItem("profileOpponentString", profileOpponentString);
}

function storeMediumAiProfile() {
  const profileOpponent = {
    elo: 600,
    photo: "./assets/images/ai/leaf.png",
    username: "Medium Ai",
  };
  const profileOpponentString = JSON.stringify(profileOpponent);
  localStorage.setItem("profileOpponentString", profileOpponentString);
}

function storeHardAiProfile() {
  const profileOpponent = {
    elo: 1000,
    photo: "./assets/images/ai/star.png",
    username: "Strong Ai",
  };
  const profileOpponentString = JSON.stringify(profileOpponent);
  localStorage.setItem("profileOpponentString", profileOpponentString);
}

function storeSavedAiProfile() {
  const profileOpponent = {
    elo: 0,
    photo: "./assets/images/ai/mario-revenant.png",
    username: "A revenant",
  };
  const profileOpponentString = JSON.stringify(profileOpponent);
  localStorage.setItem("profileOpponentString", profileOpponentString);
}

loadGameButton.addEventListener("click", function () {
  loadGame();
  storeSavedAiProfile();
  window.location.href = "../aiGame/aiGame.html";
});

document
  .getElementById("easy-ai-button")
  .addEventListener("click", function () {
    createGame(0);
    storeEasyAiProfile();
    window.location.href = "../aiGame/aiGame.html";
  });

document
  .getElementById("medium-ai-button")
  .addEventListener("click", function () {
    createGame(1);
    storeMediumAiProfile();
    window.location.href = "../aiGame/aiGame.html";
  });

document
  .getElementById("hard-ai-button")
  .addEventListener("click", function () {
    createGame(2);
    storeHardAiProfile();
    window.location.href = "../aiGame/aiGame.html";
  });
