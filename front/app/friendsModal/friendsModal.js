const friendsModalContainer = document.getElementById(
  "friends-modal-container",
);

let friendListTab;
let addFriendTab;
let friendRequestsTab;

let friendListButton;
let addFriendButton;
let friendRequestsButton;

function setUpFriendsModalClosingListeners() {
  document
    .getElementsByClassName("close")[0]
    .addEventListener("click", function () {
      friendsModalContainer.innerHTML = "";
    });

  window.addEventListener("click", function (event) {
    if (event.target == document.getElementById("friends-modal")) {
      friendsModalContainer.innerHTML = "";
    }
  });
}

function enableButton(button) {
  button.classList.remove("disabled");
  button.classList.add("btn--primary");
}

function disableButton(button) {
  button.classList.remove("btn--primary");
  button.classList.add("disabled");
}
function setUpFriendsModalListeners() {
  setUpFriendsModalClosingListeners();

  friendListTab = document.getElementById("friend-list-tab");
  addFriendTab = document.getElementById("add-friend-tab");
  friendRequestsTab = document.getElementById("friend-requests-tab");

  friendListButton = document.getElementById("friend-list-button");
  addFriendButton = document.getElementById("add-friend-button");
  friendRequestsButton = document.getElementById("friend-requests-button");

  friendListButton.addEventListener("click", function (event) {
    enableButton(friendListButton);
    disableButton(addFriendButton);
    disableButton(friendRequestsButton);
    friendListTab.style.display = "flex";
    addFriendTab.style.display = "none";
    friendRequestsTab.style.display = "none";
  });

  addFriendButton.addEventListener("click", function (event) {
    enableButton(addFriendButton);
    disableButton(friendListButton);
    disableButton(friendRequestsButton);
    addFriendTab.style.display = "flex";
    friendListTab.style.display = "none";
    friendRequestsTab.style.display = "none";
  });

  friendRequestsButton.addEventListener("click", function (event) {
    enableButton(friendRequestsButton);
    disableButton(addFriendButton);
    disableButton(friendListButton);
    friendRequestsTab.style.display = "flex";
    friendListTab.style.display = "none";
    addFriendTab.style.display = "none";
  });
}

async function displayFriendList() {
  const friends = await FriendsService.getFriends(getUsername());

  friendListTab.innerHTML = "";

  friends.forEach((friend) => {
    const friendElement = document.createElement("div");
    friendElement.classList.add("friend");
    friendElement.id = "friendID-" + friend.username;

    const profilePic = document.createElement("img");
    profilePic.src = friend.photo;
    profilePic.classList.add("profile-picture");
    friendElement.appendChild(profilePic);

    const usernameElement = document.createElement("div");
    usernameElement.textContent = friend.username;
    usernameElement.addEventListener("click", () => {
      friendsModalContainer.innerHTML = "";
      loadProfileModal(friend.username);
    });
    usernameElement.classList.add("username");
    friendElement.appendChild(usernameElement);

    const messageElement = document.createElement("button");
    messageElement.classList.add("message-button");
    messageElement.addEventListener("click", () => {
      friendsModalContainer.innerHTML = "";
      loadMessagesModal(friend.username);
    });
    const iconeMessages = document.createElement("img");
    iconeMessages.src = "../../assets/images/bulles-de-chat.png";
    messageElement.appendChild(iconeMessages);
    friendElement.appendChild(messageElement);

    const challengeButton = document.createElement("button");
    challengeButton.classList.add("challenge-button");
    challengeButton.setAttribute("data-username", friend.username);
    challengeButton.addEventListener("click", () => {
      sendChallenge(friend.username);
    });
    const iconeChallenge = document.createElement("img");
    iconeChallenge.src = "../../assets/images/challenge.png";
    challengeButton.appendChild(iconeChallenge);
    friendElement.appendChild(challengeButton);
    friendListTab.appendChild(friendElement);
    checkFriendConnectionStatus(friend.username);
  });
}
async function displayFriendRequests() {
  friendRequestsTab.innerHTML = "";

  const friendRequests = await FriendsService.getFriendRequests(getUsername());
  if (friendRequests.length > 0) {
    friendRequests.forEach((friendRequest) => {
      const friendRequestElement = document.createElement("div");
      friendRequestElement.classList.add("friend-request");
      const userText = document.createElement("p");
      userText.textContent = friendRequest.sender;

      const divButtons = document.createElement("div");
      divButtons.classList.add("friend-requests-buttons");

      const acceptButton = document.createElement("button");
      acceptButton.classList.add("accept-button");
      acceptButton.addEventListener("click", async () => {
        FriendsService.acceptFriendRequest(friendRequest.sender, getUsername());
        friendRequestElement.remove();
      });

      const declineButton = document.createElement("button");
      declineButton.classList.add("decline-button");
      declineButton.addEventListener("click", async () => {
        FriendsService.declineFriendRequest(
          friendRequest.sender,
          getUsername(),
        );

        friendRequestElement.remove();
      });

      friendRequestElement.appendChild(userText);
      divButtons.appendChild(acceptButton);
      divButtons.appendChild(declineButton);
      friendRequestElement.appendChild(divButtons);
      friendRequestsTab.appendChild(friendRequestElement);
    });
  }
}
function displayAddFriend() {}

function displayTabs() {
  displayFriendList();
  displayFriendRequests();
  displayAddFriend();
}

async function sendFriendRequest(event) {
  event.preventDefault(); // Prevent the default form submission
  const sender = getUsername();
  const receiver = document.getElementById("newFriendUsername").value;
  await FriendsService.sendFriendRequest(sender, receiver);
}

function checkFriendConnectionStatus(username) {
  socket.emit("checkFriendConnectionStatus", username);
}

function sendChallenge(username) {
  localStorage.setItem("challengedfriend", username);
  socket.emit("challengeFriend", username);
  window.location.href = "./app/challengeWaitingRoom/challengeWaitingRoom.html";
}

async function loadFriendsModal() {
  const response = await fetch("../../app/friendsModal/friendsModal.html");
  const html = await response.text();
  friendsModalContainer.innerHTML = html;
  setUpFriendsModalListeners();
  displayTabs();
  document.getElementById("friends-modal").style.display = "block";
}
