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

  document.getElementById("results-container");
  const eloText = document.createElement("h2");
  eloText.id = "elo-text";
  eloText.textContent = profile.elo;
  let resultsContainer = document.getElementById("results-container");
  resultsContainer.appendChild(eloText);
  incNbrRec(profile.elo, gameResults.elo, eloText, 100);
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
  document.getElementById("results-container").style.justifyContent = "flex-start";
  switch (gameResults.type) {
    case "ai":
      background.style.backgroundImage = 'url("../../assets/images/win-ai.png")';
      break;
    case "online":
      background.style.backgroundImage = 'url("../../assets/images/win.png")';
      break;
    case "local":
      background.style.backgroundImage = 'url("../../assets/images/win.png")';
      const winnerName = document.createElement("h2");
        winnerName.textContent = gameResults.result+" won!";
      document.getElementById("results-container").appendChild(winnerName);
      break;
    default:
      background.style.backgroundImage = 'url("../../assets/images/win.png")';
      break;
  }
} else {
  background.style.backgroundImage = 'url("../../assets/images/game-over.png")';
}

function incNbrRec(currentNumber, endNumber, element, speed) {
  element.innerHTML = currentNumber
  if (currentNumber < endNumber) {
    element.style.color = "green"
    setTimeout(function() {
      incNbrRec(currentNumber + 1, endNumber, element, speed)
    }, speed)
  }
  if (currentNumber > endNumber) {
    element.style.color = "red"
    setTimeout(function() {
      incNbrRec(currentNumber - 1, endNumber, element, speed)
    }, speed)
  }
  if (currentNumber === endNumber) {
    element.style.color = "black"
    element.innerHTML = "New Elo : "+endNumber;
  }
}
