const notifsModalContainer = document.getElementById(
  "notifs-modal-container",
);

function setUpNotifModalClosingListeners() {
  document
    .getElementsByClassName("close")[0]
    .addEventListener("click", function () {
      notifsModalContainer.innerHTML = "";
    });

  window.addEventListener("click", function (event) {
    if (event.target == document.getElementById("notifications-modal")) {
      notifsModalContainer.innerHTML = "";
    }
  });
}

async function fetchNotifications() {
    try {
      let connectedCookieValue = getCookie("connected");
      if (connectedCookieValue) {
        connectedCookieValue = JSON.parse(connectedCookieValue);
        const sender = connectedCookieValue.user;
        const response = await fetch(endpoint+`/api/notifications?userId=${sender}`);
        if (response.status !== 200) {
          throw new Error('Failed to fetch notifications');
          return;
        }
        const notifications = await response.json()
        const notificationsList = document.getElementById("notifications");
        notificationsList.innerHTML = '';
        console.log(notifications);
        if (notifications) {
        notifications.forEach(notification => {

          const listItem = createNotification(sender,notification);
          if (listItem)
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
    await fetchNotifications();
    console.log("Affiche notifs");
}

function createNotification(user,notification){
  console.log(notification.type);
  switch (notification.type){
    case "friendrequest":
      return createFriendNotification(user,notification);
    case "achievement":
      return createAchievementNotification(user,notification);
  }
  return null;
}

function createAchievementNotification(user,notification){
  const listItem = document.createElement("li");
  listItem.textContent = notification.message;

  const acceptButton = document.createElement("button");
  acceptButton.textContent = "V";
  acceptButton.addEventListener("click", async () => {
    try {
      const requestURL = endpoint+`/api/notification/del?notif=${encodeURIComponent(notification._id)}&of=${encodeURIComponent(user)}`;
      const response = await fetch(requestURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (response.status === 200) {
        listItem.remove();
      } else {
        throw new Error('Failed to remove notification');
      }
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  });
  listItem.appendChild(acceptButton);
  return listItem;
}

function createFriendNotification(user,notification){
  const listItem = document.createElement("li");
  listItem.textContent = notification.message;

  const acceptButton = document.createElement("button");
  acceptButton.textContent = "Accept";
  acceptButton.addEventListener("click", async () => {
    try {
      const requestURL = endpoint+`/api/friend/accept?from=${encodeURIComponent(notification.sender)}&to=${encodeURIComponent(user)}`;
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
      const requestURL = endpoint+`/api/friend/decline?from=${encodeURIComponent(notification.sender)}&to=${encodeURIComponent(user)}`;
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
  return listItem;
  
}

async function loadNotifsModal() {
  const response = await fetch("../../app/notifications/notifications.html");
  const html = await response.text();
  notifsModalContainer.innerHTML = html;
  document.getElementById("notifications-modal").style.display = "block";
  setUpNotifModalClosingListeners();
  await fetchNotifications();
}