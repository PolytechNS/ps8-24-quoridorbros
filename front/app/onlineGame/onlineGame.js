document
  .getElementById("opponent-profile-container")
  .addEventListener("click", function () {
    const opponentProfile = JSON.parse(
      localStorage.getItem("profileOpponentString"),
    );
    loadProfileModal(opponentProfile.username);
  });

document
  .getElementById("chat-notifications-button")
  .addEventListener("click", function () {
    const opponentProfile = JSON.parse(
      localStorage.getItem("profileOpponentString"),
    );
    loadMessagesModal(opponentProfile.username);
  });
