const challengeModalContainer = document.getElementById(
  "challenge-modal-container",
);


function setUpChallengeModalClosingListeners() {
  document
    .getElementsByClassName("close")[0]
    .addEventListener("click", function () {
      challengeModalContainer.innerHTML = "";
    });

  window.addEventListener("click", function (event) {
    if (event.target == document.getElementById("challengeModal")) {
      challengeModalContainer.innerHTML = "";
    }
  });
}


function acceptChallenge(username) {
  console.log('accepting challenge from', username);
}

function declineChallenge(username) {
    console.log('declining challenge from', username);
}

function displayChallenger(profileOpponent) {
    const challenger = profileOpponent;

    const challengerElement = document.createElement("div");
    challengerElement.classList.add("challenger");

    const profilePic = document.createElement("img");
    profilePic.src = challenger.photo;
    profilePic.classList.add("profile-picture");
    challengerElement.appendChild(profilePic);

    const usernameElement = document.createElement("div");
    usernameElement.textContent = challenger.username;
    usernameElement.classList.add("username");
    challengerElement.appendChild(usernameElement);

    const acceptButton = document.createElement("button");
    acceptButton.textContent = "Accept";
    acceptButton.classList.add("mainButtonClass");
    acceptButton.addEventListener("click", () => {
        acceptChallenge(challenger.username);
    });
    challengerElement.appendChild(acceptButton);

    const declineButton = document.createElement("button");
    declineButton.textContent = "Decline";
    declineButton.classList.add("mainButtonClass");
    declineButton.addEventListener("click", () => {
        declineChallenge(challenger.username);
    });
    challengerElement.appendChild(declineButton);

    document.getElementById("challenger-container").appendChild(challengerElement);
    }

async function loadChallengeModal(profileOpponent) {
  const response = await fetch("../../app/challengeModal/challengeModal.html");
  const html = await response.text();
  leaderboardModalContainer.innerHTML = html;
  setUpChallengeModalClosingListeners();
  displayChallenger(profileOpponent);
  document.getElementById("challengeModal").style.display = "block";
}



