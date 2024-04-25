const notifsModalContainer = document.getElementById("notifs-modal-container");

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
      const response = await fetch(`/api/notifications?userId=${sender}`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch notifications");
        return;
      }
      const notifications = await response.json();
      const notificationsList = document.getElementById("notifications");
      notificationsList.innerHTML = "";
      console.log(notifications);
      if (notifications) {
        notifications.forEach((notification) => {
          const listItem = createNotification(sender, notification);
          if (listItem) notificationsList.appendChild(listItem);
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadNotifications() {
  const response = await fetch("./app/notifications/notifications.html");
  const html = await response.text();
  notificationcontainer.innerHTML = html;
  await fetchNotifications();
  console.log("Affiche notifs");
}

function createNotification(user, notification) {
  console.log(notification.type);
  switch (notification.type) {
    case "friendrequest":
      return createFriendNotification(user, notification);
    case "achievement":
      return createAchievementNotification(user, notification);
  }
  return null;
}

function createAchievementNotification(user, notification) {
  const notificationItem = document.createElement("div");
  notificationItem.classList.add("notification-item");

  const notificationText = document.createElement("p");
  notificationText.textContent = notification.message;

  const okButton = document.createElement("button");
  okButton.classList.add("ok-button");

  okButton.textContent = "Ok";
  okButton.addEventListener("click", async () => {
    try {
      const requestURL =
        endpoint +
        `/api/notification/del?notif=${encodeURIComponent(notification._id)}&of=${encodeURIComponent(user)}`;
      const response = await fetch(requestURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        notificationItem.remove();
      } else {
        throw new Error("Failed to remove notification");
      }
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  });
  notificationItem.appendChild(notificationText);
  notificationItem.appendChild(okButton);
  return notificationItem;
}

function createFriendNotification(user, notification) {
  const notificationItem = document.createElement("div");
  notificationItem.classList.add("notification-item");

  const notificationText = document.createElement("p");

  notificationText.textContent = notification.message;

  const buttonsItem = document.createElement("div");

  const acceptButton = document.createElement("button");
  acceptButton.classList.add("accept-button");
  acceptButton.addEventListener("click", async () => {
    try {
      const requestURL =
        endpoint +
        `/api/friend/accept?from=${encodeURIComponent(notification.sender)}&to=${encodeURIComponent(user)}`;
      const response = await fetch(requestURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        alert(`Accepted friend request from ${notification.sender}`);
        notificationItem.remove();
      } else {
        throw new Error("Failed to accept friend request");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  });

  const declineButton = document.createElement("button");
  declineButton.classList.add("decline-button");
  declineButton.addEventListener("click", async () => {
    try {
      const requestURL =
        endpoint +
        `/api/friend/decline?from=${encodeURIComponent(notification.sender)}&to=${encodeURIComponent(user)}`;
      const response = await fetch(requestURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        alert(`Declined friend request from ${notification.sender}`);
        notificationItem.remove();
      } else {
        throw new Error("Failed to decline friend request");
      }
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  });

  notificationItem.appendChild(notificationText);
  buttonsItem.appendChild(acceptButton);
  buttonsItem.appendChild(declineButton);
  notificationItem.appendChild(buttonsItem);
  return notificationItem;
}

async function loadNotifsModal() {
  const response = await fetch("../../app/notifications/notifications.html");
  const html = await response.text();
  notifsModalContainer.innerHTML = html;
  document.getElementById("notifications-modal").style.display = "block";
  setUpNotifModalClosingListeners();
  await fetchNotifications();
}
