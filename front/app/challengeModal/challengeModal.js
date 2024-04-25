const challengeModalContainer = document.getElementById(
  "challenge-modal-container",
);

let challengerName;

function setUpChallengeModalClosingListeners() {
  document
    .getElementsByClassName("close")[0]
    .addEventListener("click", function () {
      declineChallenge(challengerName);
    });

  window.addEventListener("click", function (event) {
    if (event.target == document.getElementById("challenge-modal")) {
      declineChallenge(challengerName);
    }
  });
}

function acceptChallenge(username) {
  socket.emit("acceptChallenge", username);
}

function declineChallenge(username) {
  challengeModalContainer.innerHTML = "";
  socket.emit("declineChallenge", username);
}

function displayChallenger(profileOpponent) {
  const challenger = profileOpponent;
  challengerName = challenger.username;

  const challengerElement = document.getElementById("challenger-container");

  const profilePic = document.createElement("img");
  profilePic.src = challenger.photo;
  profilePic.classList.add("profile-picture");
  challengerElement.appendChild(profilePic);

  const textElement = document.createElement("p");
  textElement.textContent = challenger.username + " challenges you !!";
  textElement.id = "text-challenge";
  challengerElement.appendChild(textElement);

  const divButtons = document.createElement("div");
  divButtons.classList.add("challenge-buttons");

  const acceptButton = document.createElement("button");
  acceptButton.classList.add("accept-button");
  acceptButton.addEventListener("click", () => {
    acceptChallenge(challenger.username);
  });

  const declineButton = document.createElement("button");
  declineButton.classList.add("decline-button");
  declineButton.addEventListener("click", () => {
    declineChallenge(challenger.username);
  });
  divButtons.appendChild(acceptButton);
  divButtons.appendChild(declineButton);

  challengerElement.appendChild(divButtons);
}

async function loadChallengeModal(profileOpponent) {
  const response = await fetch("../../app/challengeModal/challengeModal.html");
  const html = await response.text();
  challengeModalContainer.innerHTML = html;
  setUpChallengeModalClosingListeners();
  displayChallenger(profileOpponent);
  document.getElementById("challenge-modal").style.display = "block";
}
