const waitingText = document.getElementById("waiting-text");
const waitingIndicator = document.getElementById("waitingIndicator");
const waitingContainer = document.getElementById("waiting-container");

let nbDots = 1;
function updateWaitingTimer() {
  let dots = ".".repeat(nbDots);
  waitingText.textContent = "Waiting for your friend" + dots;
  nbDots = (nbDots % 3) + 1;
}
waitingTimerInterval = setInterval(updateWaitingTimer, 500);

function challengeAccepted() {
  clearInterval(waitingTimerInterval); // Stop the waiting timer

  // Change waiting text to indicate opponent found
  waitingText.textContent = "Challenge Accepted !";
  waitingIndicator.innerHTML = "";

  setTimeout(() => {
    window.location.href = "../onlineGame/onlineGame.html";
  }, 2000);
}
