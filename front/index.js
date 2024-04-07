let playWithAIButton = document.getElementById("playAIButton");
let playLocalButton = document.getElementById("playLocalButton");
let playOnlineButton = document.getElementById("playOnlineButton");
let logoutButton = document.getElementById("logoutButton");

window.onload = function () {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue !== null) {
    document.getElementById("profile-container").style.display = "block";
    document.getElementById("logoutButton").style.display = "block";
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("signinButton").style.display = "none";
    playWithAIButton.style.display = "inline";
    playLocalButton.style.display = "inline";
    playOnlineButton.style.display = "inline";
  }
};

document.getElementById("logoutButton").addEventListener("click", function () {
  fetch("/api/logout", {
    method: "POST",
  })
    .then((response) => {
      if (response.ok) {
        document.getElementById("profile-container").style.display = "none";
        document.getElementById("logoutButton").style.display = "none";
        document.getElementById("loginButton").style.display = "inline";
        document.getElementById("signinButton").style.display = "inline";
        playWithAIButton.style.display = "none";
        playLocalButton.style.display = "none";
        playOnlineButton.style.display = "none";
        alert("Deconnexion Successful");
      }
    })
    .catch((error) => console.error("Error:", error));
});

