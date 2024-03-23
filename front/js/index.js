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
    fetchNotifications();
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
document.getElementById("friendRequestForm").addEventListener("submit", async function(event) {
  event.preventDefault(); // Prevents the default form submission behavior

  // Retrieves the value of the "connected" cookie
  let connectedCookieValue = getCookie("connected");

  // Checks if the "connected" cookie exists
  if (connectedCookieValue) {
    try {
      connectedCookieValue = JSON.parse(connectedCookieValue);

      const sender = connectedCookieValue.user;
      const receiver = document.getElementById("receiver").value;

      const requestURL = `/api/friend?sender=${encodeURIComponent(sender)}&receiver=${encodeURIComponent(receiver)}`;

      const response = await fetch(requestURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const responseData = await response.text();

      if (response.status === 200) {
        alert("Friend request sent successfully!");
      } else if (response.status === 400) {
        const errorResponse = JSON.parse(responseData);
        alert(`Bad request: ${errorResponse.error}`);
      } else if (response.status === 500) {
        alert("Internal Server Error. Please try again later.");
      } else {
        alert("Unexpected error. Please try again later.");
      }
        document.getElementById("friendRequestForm").reset();

    } catch (error) {
      console.error('Error:', error);
      alert("An error occurred while processing your request.");
    }
  }
});

async function fetchNotifications() {
  try {
    let connectedCookieValue = getCookie("connected");
    if (connectedCookieValue) {
      connectedCookieValue = JSON.parse(connectedCookieValue);
      const sender = connectedCookieValue.user;
      const response = await fetch(`/api/friends?userId=${sender}`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch notifications');
      }
      const notifications = await response.json();
      const notificationsList = document.getElementById("notifications");
      notificationsList.innerHTML = '';

      notifications.forEach(notification => {
        const listItem = document.createElement("li");
        listItem.textContent = `${notification.sender} sent you a friend request`;
        notificationsList.appendChild(listItem);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

