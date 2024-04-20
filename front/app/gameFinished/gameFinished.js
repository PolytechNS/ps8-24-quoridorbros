let gameResultsString = localStorage.getItem("gameResultsString");
let gameResults = JSON.parse(gameResultsString);
let background = document.getElementById("background");
let newGameButton = document.getElementById("new-game");

if (gameResults.type === "ai") {
  loadAiFinishedPage();
} else if (gameResults.type === "online") {
  loadOnlineFinishedPage();
} else {
  loadLocalFinishedPage();
}

function loadOnlineFinishedPage() {
  newGameButton.addEventListener("click", function () {
    window.location.href = "../matchmaking/matchmaking.html";
  });

  let profileString = localStorage.getItem("profileString");
  let profile = JSON.parse(profileString);

  const eloText = document.createElement("p");
  eloText.textContent =
    "Elo: " +
    profile.elo +
    " + (" +
    gameResults.deltaElo +
    ") -> " +
    gameResults.elo;
  eloText.id = "elo-text";
  let resultsContainer = document.getElementById("results-container");
  resultsContainer.appendChild(eloText);

  //update the elo of the profile in the local Storage
  profile.elo = gameResults.elo;
  profileString = JSON.stringify(profile);
  localStorage.setItem("profileString", profileString);
}

function loadAiFinishedPage() {
  newGameButton.addEventListener("click", function () {
    window.location.href = "../aiGameSettings/aiGameSettings.html";
  });
}

function loadLocalFinishedPage() {
  newGameButton.addEventListener("click", function () {
    window.location.href = "../localGame/localGame.html";
  });
}

if (gameResults.result) {
  background.style.backgroundImage = 'url("../../assets/images/win.png")';
} else {
  background.style.backgroundImage = 'url("../../assets/images/game-over.png")';
}
