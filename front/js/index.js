let playWithAIButton = document.getElementById("playAIButton");
let playLocalButton = document.getElementById("playLocalButton");

window.onload = function () {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue !== undefined) {
    document.getElementById("loggedInText").style.display = "block";
    let connected = JSON.parse(connectedCookieValue);
    document.getElementById(
      "loggedInText"
    ).innerText = `You are logged as ${connected.user}`;
    document.getElementById("logoutButton").style.display = "block";
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("signinButton").style.display = "none";
    playWithAIButton.style.display = "inline";
    playLocalButton.style.display = "inline";
  }
};

document.getElementById("logoutButton").addEventListener("click", function () {
  fetch("/api/logout", {
    method: "POST",
  })
    .then((response) => {
      if (response.ok) {
        document.getElementById("loggedInText").style.display = "none";
        document.getElementById("logoutButton").style.display = "none";
        document.getElementById("loginButton").style.display = "inline";
        document.getElementById("signinButton").style.display = "inline";
        playWithAIButton.style.display = "none";
        playLocalButton.style.display = "none";
        alert("Deconnexion Successful");
      }
    })
    .catch((error) => console.error("Error:", error));
});
document.getElementById("sendRequestBtn").addEventListener("click", async function() {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue) {
    try {
      connectedCookieValue = JSON.parse(connectedCookieValue);
      const sender = connectedCookieValue.user;
      const receiver = document.getElementById("receiver").value;

      const response = await fetch("/api/friend", {
        method: "POST",
        body: JSON.stringify({
          sender: sender,
          receiver: receiver
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        }
      });

      if (response.ok) { // Vérifie si le statut de la réponse est OK (code HTTP 200-299)
        alert("Friend request sended");
      } else {
        // Gestion des réponses d'erreur de l'API
        const errorText = await response.text(); // ou response.json() si l'API retourne du JSON
        alert("OUPS : " + errorText);
      }


    } catch (error) {
      console.error('Error:', error);
    }
  }
});


/*

async function fetchNotifications() {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue) {
    try {
      const response = await fetch('/api/friends/' + connectedCookieValue.user);
      const notifications = await response.json();
      const notificationsList = document.getElementById("notifications");
      notificationsList.innerHTML = '';

      notifications.forEach(notification => {
        const listItem = document.createElement("li");
        listItem.textContent = `${notification.sender} sent you a friend request`;
        notificationsList.appendChild(listItem);
      });
    } catch (error) {
      console.error(error);
    }
  }
}
*/
