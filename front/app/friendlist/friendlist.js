const friendlistcontainer = document.getElementById('friend-container');

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
    friendElement.classList.add('friend');

    const profilePic = document.createElement('img');
    profilePic.src = friend.photo;
    profilePic.style.maxHeight = '100px';
    profilePic.classList.add('profile-picture');
    friendElement.appendChild(profilePic);

    const usernameElement = document.createElement('div');
    usernameElement.textContent = friend.username;
    usernameElement.classList.add('username');
    friendElement.appendChild(usernameElement);
    const challengeButton = document.createElement('button');
    challengeButton.textContent = 'Challenge';
    challengeButton.classList.add('challenge-button');
    friendElement.appendChild(challengeButton);

    friendListContainer.appendChild(friendElement);
  });
}

function openform() {
  var modal = document.getElementById("friendRequestPopup");
  console.log("coucou");
  if (modal.style.display === "" || modal.style.display === "none") {
    modal.style.display = "block";
  } else {
    modal.style.display = "none";
  }
}


async function loadFriends() {
    const response = await fetch('./app/friendlist/friendlist.html');
    const html = await response.text();
    friendlistcontainer.innerHTML = html;
    await fetchFriendRequestNotifications();
    await fetchFriendList();
}

loadFriends();
