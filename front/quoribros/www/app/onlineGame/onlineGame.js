document
  .getElementById("opponent-profile-container")
  .addEventListener("click", function () {
    const opponentProfile = JSON.parse(
      localStorage.getItem("profileOpponentString"),
    );
    loadProfileModal(opponentProfile.username);
  });
