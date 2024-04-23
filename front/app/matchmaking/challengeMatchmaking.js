const waitingText = document.getElementById("waiting-text");
const waitingIndicator = document.getElementById("waitingIndicator");
const waitingContainer = document.getElementById("waiting-container");

let nbDots = 1;
function updateWaitingTimer(username) {
    let dots = ".".repeat(nbDots);
    waitingText.textContent = `Waiting for ${username}'s response` + dots;
    nbDots = (nbDots % 3) + 1;
}
waitingTimerInterval = setInterval(updateWaitingTimer, 500);

function challengeAccepted(opponentProfile) {
    clearInterval(waitingTimerInterval);
    waitingText.textContent = "Opponent Accepted !";
    waitingIndicator.innerHTML = "";

    const opponentImage = document.createElement("img");
    opponentImage.id = "image-opponent";
    opponentImage.src = "../../" + opponentProfile.photo;

    const opponentPseudo = document.createElement("p");
    opponentPseudo.textContent = "username: " + opponentProfile.username;

    const opponentElo = document.createElement("p");
    opponentElo.textContent = "Elo: " + opponentProfile.elo;

    waitingContainer.appendChild(opponentImage);
    waitingContainer.appendChild(opponentPseudo);
    waitingContainer.appendChild(opponentElo);

    setTimeout(() => {
        window.location.href = "../onlineGame/onlineGame.html";
    }, 2000);
}
