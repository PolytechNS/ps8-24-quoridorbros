const notificationcontainer = document.getElementById('notifications-container');

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
        const notifications = await response.json()
        const notificationsList = document.getElementById("notifications");
        notificationsList.innerHTML = '';
        if (notifications) {
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
        });}
      }
    } catch (error) {
      console.error(error);
    }
  }

async function loadNotifications() {
    const response = await fetch('./app/notifications/notifications.html');
    const html = await response.text();
    notificationcontainer.innerHTML = html;
    await fetchFriendRequestNotifications();
}

loadNotifications();