const waitingText = document.getElementById("waiting-text");
const waitingIndicator = document.getElementById("waitingIndicator");
const waitingContainer = document.getElementById("waiting-container");

let nbDots = 1;
function updateWaitingTimer() {
  let dots = ".".repeat(nbDots);
  waitingText.textContent = "Waiting for a worthy opponent" + dots;
  nbDots = (nbDots % 3) + 1;
}
waitingTimerInterval = setInterval(updateWaitingTimer, 500);

async function enterMatchMaking() {
  if (localStorage.getItem("profileOpponentString")) {
    localStorage.removeItem("profileOpponentString");
  }

  const requestURL = `/api/matchmaking?userName=${encodeURIComponent(cookie.user)}`;

  const response = await fetch(requestURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const responseData = await response.text();

  if (response.status === 200) {
    //console.log("Matchmaking request sent successfully!");
  } else if (response.status === 400) {
    const errorResponse = JSON.parse(responseData);
    alert(`Bad request: ${errorResponse.error}`);
  } else if (response.status === 500) {
    alert("Internal Server Error. Please try again later.");
  } else {
    alert("Unexpected error. Please try again later.");
  }
}

function quitMatchMaking() {
  socket.emit("quitMatchMaking");
  window.location.href = "../../index.html";
}

function opponentFound(opponentProfile) {
  clearInterval(waitingTimerInterval); // Stop the waiting timer

  // Change waiting text to indicate opponent found
  waitingText.textContent = "Opponent Found !";
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

enterMatchMaking();
