let playWithAIButton = document.getElementById("playAIButton");
let playLocalButton = document.getElementById("playLocalButton");
let playOnlineButton = document.getElementById("playOnlineButton");
let logoutButton = document.getElementById("logoutButton");

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
    fetchFriendRequestNotifications();
    fetchFriendList();
    playOnlineButton.style.display = "inline";
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
        playOnlineButton.style.display = "none";
        alert("Deconnexion Successful");
      }
    })
    .catch((error) => console.error("Error:", error));
});
document.getElementById("friendRequestForm").addEventListener("submit", async function(event) {
  event.preventDefault();
  let connectedCookieValue = getCookie("connected");
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

async function fetchFriendRequestNotifications() {
  try {
    let connectedCookieValue = getCookie("connected");
    if (connectedCookieValue) {
      connectedCookieValue = JSON.parse(connectedCookieValue);
      const sender = connectedCookieValue.user;
      const response = await fetch(`/api/notifications/friends?userId=${sender}`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch notifications');
      }
      const notifications = await response.json();
      const notificationsList = document.getElementById("notifications");
      notificationsList.innerHTML = '';

      notifications.forEach(notification => {
        const listItem = document.createElement("li");
        listItem.textContent = `${notification.sender} sent you a friend request`;

        const acceptButton = document.createElement("button");
        acceptButton.textContent = "Accept";
        acceptButton.addEventListener("click", async () => {
          try {
            const requestURL = `/api/friend/accept?from=${encodeURIComponent(notification.sender)}&to=${encodeURIComponent(sender)}`;
            const response = await fetch(requestURL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              }
            });
            
            if (response.status === 200) {
              alert(`Accepted friend request from ${notification.sender}`);
              listItem.remove();
            } else {
              throw new Error('Failed to accept friend request');
            }
          } catch (error) {
            console.error("Error accepting friend request:", error);
          }
        });

        const declineButton = document.createElement("button");
        declineButton.textContent = "Decline";
        declineButton.addEventListener("click", async () => {
          try {
            const requestURL = `/api/friend/decline?from=${encodeURIComponent(notification.sender)}&to=${encodeURIComponent(sender)}`;
            const response = await fetch(requestURL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              }
            });
            
            if (response.status === 200) {
              alert(`Declined friend request from ${notification.sender}`);
              listItem.remove();
            } else {
              throw new Error('Failed to decline friend request');
            }
          } catch (error) {
            console.error("Error declining friend request:", error);
          }
        });

        listItem.appendChild(acceptButton);
        listItem.appendChild(declineButton);

        notificationsList.appendChild(listItem);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function fetchFriendList() {
  try {
    let connectedCookieValue = getCookie("connected");
    if (connectedCookieValue) {
      connectedCookieValue = JSON.parse(connectedCookieValue);
      const sender = connectedCookieValue.user;
      const response = await fetch(`/api/friends?of=${sender}`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch friends');
      }
      const friends = await response.json();
      displayFriends(friends.friendList);
    }
  } catch (error) {
    console.error(error);
  }
}

function displayFriends(friends) {
  const friendListContainer = document.getElementById('friend-list');
  friendListContainer.innerHTML = '';
  
  friends.forEach(friend => {
    const friendElement = document.createElement('div');
    friendElement.textContent = friend;
    friendListContainer.appendChild(friendElement);
  });
}

