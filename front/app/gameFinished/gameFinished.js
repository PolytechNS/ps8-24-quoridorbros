let profileString =  localStorage.getItem("profileString");
let profile =  JSON.parse(profileString);

let gameResultsString =  localStorage.getItem("gameResultsString");
let gameResults =  JSON.parse(gameResultsString);

const eloText = document.createElement("p");
eloText.textContent = "Elo: " + profile.elo + "(" + gameResults.deltaElo + ") => " + gameResults.newElo;

profile.elo = newElo;
profileString = JSON.stringify(profile);
localStorage.setItem("profileString", profileString);

let profilePhoto = document.getElementById("profilePhoto");
profilePhoto.src = profile.photo;


let background = document.getElementById("background");

if(gameResults.result === 1) {
    background.style.backgroundImage = "url('../../assets/images/win.png')";
} else {
    background.style.backgroundImage = "url('../../assets/images/game-over.png')";
}




