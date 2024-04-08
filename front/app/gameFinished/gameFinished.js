let profileString =  localStorage.getItem("profileString");
let profile =  JSON.parse(profileString);

let gameResultsString =  localStorage.getItem("gameResultsString");
let gameResults =  JSON.parse(gameResultsString);

const eloText = document.createElement("p");
eloText.textContent = "Elo: " + profile.elo + " + (" + gameResults.deltaElo + ") -> " + gameResults.elo;
eloText.id = "elo-text"
let resultsContainer = document.getElementById("results-container");
resultsContainer.appendChild(eloText);




//update the elo of the profile in the local Storage
profile.elo = gameResults.elo;
profileString = JSON.stringify(profile);
localStorage.setItem("profileString", profileString);

let background = document.getElementById("background");

if(gameResults.result) {
    background.style.backgroundImage = 'url("../../assets/images/win.png")';
} else {
    background.style.backgroundImage = 'url("../../assets/images/game-over.png")';
}




