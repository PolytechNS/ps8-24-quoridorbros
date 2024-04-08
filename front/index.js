let playWithAIButton = document.getElementById("playAIButton");
let playLocalButton = document.getElementById("playLocalButton");
let playOnlineButton = document.getElementById("playOnlineButton");
let logoutButton = document.getElementById("logoutButton");
let playButton = document.getElementById("playButton");
let backButton = document.getElementById("backButton");
let notButton = document.getElementById("notificationsButton");

window.onload = function () {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue !== null) {
    /* Une hérésie qui nous évite de refactor : */
    document.getElementById("friendSocketInitAnchor").appendChild(document.createElement("script")).src = "/app/sockets/ioManager.js";
    document.getElementById("friendSocketInitAnchor").appendChild(document.createElement("script")).src = "/app/friendlist/friendlist.js";
    document.getElementById("friendSocketInitAnchor").appendChild(document.createElement("script")).src = "/app/sockets/matchmakingEvents.js";
    /* Désolé */
    document.getElementById("profile-container").style.display = "block";
    logoutButton.style.display = "block";
    notButton.style.display = "block";
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("signinButton").style.display = "none";
    document.getElementById("friend-container").style.display = "inline";
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
    backButton.style.display = "none";

  }
};

document.getElementById("logoutButton").addEventListener("click", function () {
  fetch("/api/logout", {
    method: "POST",
  })
    .then((response) => {
      if (response.ok) {
        document.getElementById("profile-container").style.display = "none";
        logoutButton.style.display = "none";
        notButton.style.display = "none";
        document.getElementById("loginButton").style.display = "inline";
        document.getElementById("signinButton").style.display = "inline";
        document.getElementById("friend-container").style.display = "none";
        playWithAIButton.style.display = "none";
        playLocalButton.style.display = "none";
        playOnlineButton.style.display = "none";
        playOnlineButton.disabled = true;
        playWithAIButton.disabled = true;
        document.getElementById("loginNote").style.display = "inline";
        playOnlineButton.classList.remove("mainButtonClass");
        playOnlineButton.classList.add("mainButtonDisabledClass");
        playWithAIButton.classList.remove("mainButtonClass");
        playWithAIButton.classList.add("mainButtonDisabledClass");
        playButton.style.display = "inline";
        backButton.style.display = "none";
      }
    })
    .catch((error) => console.error("Error:", error));
});

document.getElementById("playButton").addEventListener("click", function () {
  playWithAIButton.style.display = "inline";
  playLocalButton.style.display = "inline";
  playOnlineButton.style.display = "inline";
  playButton.style.display = "none";
  backButton.style.display = "inline";
  document.getElementById("loginButton").style.display = "none";
  document.getElementById("signinButton").style.display = "none";
});

document.getElementById("notificationsButton").addEventListener("click", function () {
  document.getElementById("indexPopup").style.display = "flex";
});
document.getElementById("notificationClose").addEventListener("click", function () {
  document.getElementById("indexPopup").style.display = "none";
});