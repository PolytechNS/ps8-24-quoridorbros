let playButton = document.getElementById("playButton");
let profileButton = document.getElementById("profile-button");

let playWithAIButton = document.getElementById("playAIButton");
let playLocalButton = document.getElementById("playLocalButton");
let playOnlineButton = document.getElementById("playOnlineButton");

let loginButton = document.getElementById("loginButton");
let signinButton = document.getElementById("signinButton");

let leaderBoardButton = document.getElementById("leaderboard-button");
let friendsButton = document.getElementById("friends-button");
let notifsButton = document.getElementById("notifs-button");

window.onload = function () {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue !== null) {
    document
        .getElementById("friendSocketInitAnchor")
        .appendChild(document.createElement("script")).src =
        "/app/sockets/matchmakingEvents.js";
/*
    document
      .getElementById("friendSocketInitAnchor")
      .appendChild(document.createElement("script")).src =
      "/app/sockets/ioManager.js";
    document
        .getElementById("friendSocketInitAnchor")
        .appendChild(document.createElement("script")).src =
        "/app/sockets/matchmakingEvents.js";
    document
      .getElementById("friendSocketInitAnchor")
      .appendChild(document.createElement("script")).src =
      "/app/friendlist/friendlist.js";

      */

    leaderBoardButton.style.display = "block";
    friendsButton.style.display = "block";
    profileButton.style.display = "inline-block";
    notifsButton.style.display = "block";

    loginButton.style.display = "none";
    signinButton.style.display = "none";
    playWithAIButton.style.display = "none";
    playLocalButton.style.display = "none";
    playOnlineButton.style.display = "none";

    playOnlineButton.disabled = false;
    playWithAIButton.disabled = false;
    document.getElementById("loginNote").style.display = "none";
    playOnlineButton.classList.add("mainButtonClass");
    playOnlineButton.classList.remove("mainButtonDisabledClass");
    playWithAIButton.classList.add("mainButtonClass");
    playWithAIButton.classList.remove("mainButtonDisabledClass");
    playButton.style.display = "inline";

    const storeProfile = async () => {
      const response = await fetch(`/api/profile?of=${getUsername()}`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      const profileData = data.profile;
      let profileDataString = JSON.stringify(profileData);
      localStorage.setItem("profileString", profileDataString);
    };
    storeProfile();
    challengeCheck(1000);
  }
};

function logout() {
  fetch("/api/logout", {
    method: "POST",
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = ".";
        playWithAIButton.style.display = "none";
        playLocalButton.style.display = "none";
        playOnlineButton.style.display = "none";
        playOnlineButton.disabled = true;
        playWithAIButton.disabled = true;
        profileButton.style.display = "none";
        leaderBoardButton.style.display = "none";
        friendsButton.style.display = "none";
        notifsButton.style.display = "none";

        playButton.style.display = "inline";
        loginButton.style.display = "inline";
        signinButton.style.display = "inline";

        document.getElementById("loginNote").style.display = "inline";
        playOnlineButton.classList.remove("mainButtonClass");
        playOnlineButton.classList.add("mainButtonDisabledClass");
        playWithAIButton.classList.remove("mainButtonClass");
        playWithAIButton.classList.add("mainButtonDisabledClass");
      }
    })
    .catch((error) => console.error("Error:", error));
}

playButton.addEventListener("click", function () {
  playButton.style.display = "none";
  loginButton.style.display = "none";
  signinButton.style.display = "none";

  playWithAIButton.style.display = "inline";
  playLocalButton.style.display = "inline";
  playOnlineButton.style.display = "inline";
});

leaderBoardButton.addEventListener("click", function () {
  loadLeaderboardModal();
  /*
  document.getElementById("indexPopup").style.display = "flex";
  document.getElementById("profileEditorPopup").style.display = "none";
  document.getElementById("eloPopup").style.display = "block";
  displayEloWorld();*/
});

friendsButton.addEventListener("click", function (event) {
  loadFriendsModal();
});

profileButton.addEventListener("click", function () {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue) {
    connectedCookieValue = JSON.parse(connectedCookieValue);
    loadProfileModal(connectedCookieValue.user);
  } else {
    throw new Error("Failed to fetch profile");
  }
});

notifsButton.addEventListener("click", function () {
    loadNotifications();
});

function closeAllModals() {
  document.getElementById("leaderboard-modal-container").innerHTML = "";
  document.getElementById("friends-modal-container").innerHTML = "";
  document.getElementById("profile-modal-container").innerHTML = "";
  document.getElementById("challenge-modal-container").innerHTML = "";
}

async function challengeCheck(param) {
  while (true) {
    try {
      while (localStorage.getItem("pendingChallenge") === null) {
        await new Promise((resolve) => setTimeout(resolve, param));
      }

      closeAllModals();
      let profileOpponentData = localStorage.getItem("pendingChallenge");
      let profileOpponent = JSON.parse(profileOpponentData).data;
      localStorage.removeItem("pendingChallenge");
      loadChallengeModal(profileOpponent);
    } catch (error) {
      console.error("Error:", error);
      break;
    }
  }
}
