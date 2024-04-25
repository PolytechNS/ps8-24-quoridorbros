const leaderboardModalContainer = document.getElementById(
  "leaderboard-modal-container",
);

let friendLBTab;
let globalLBTab;

let friendLBButton;
let globalLBButton;

function setUpLeaderboardModalClosingListeners() {
  document
    .getElementsByClassName("close")[0]
    .addEventListener("click", function () {
      leaderboardModalContainer.innerHTML = "";
    });

  window.addEventListener("click", function (event) {
    if (event.target == document.getElementById("lbModal")) {
      leaderboardModalContainer.innerHTML = "";
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
function setUpLeaderboardModalListeners() {
  setUpLeaderboardModalClosingListeners();

  friendLBTab = document.getElementById("friend-leaderboard-tab");
  globalLBTab = document.getElementById("global-leaderboard-tab");

  friendLBButton = document.getElementById("friend-leaderboard-button");
  globalLBButton = document.getElementById("global-leaderboard-button");

  friendLBButton.addEventListener("click", function (event) {
    enableButton(friendLBButton);
    disableButton(globalLBButton);
    friendLBTab.style.display = "flex";
    globalLBTab.style.display = "none";
  });

  globalLBButton.addEventListener("click", function (event) {
    enableButton(globalLBButton);
    disableButton(friendLBButton);
    globalLBTab.style.display = "flex";
    friendLBTab.style.display = "none";
  });
}


async function displayLeaderboardList() {
  try {
    let elos = await getEloWorld();
    if (elos) {
      elos.sort((a, b) => {
        if (a.elo !== b.elo) {
          return b.elo - a.elo;
        } else {
          return a.username.localeCompare(b.username);
        }
      });
      let connectedCookieValue = getCookie("connected");
      connectedCookieValue = JSON.parse(connectedCookieValue);
      friendLBTab.innerHTML = "";
      let profilenumber = 1;

      elos.forEach((profile) => {
        const profileElement = document.createElement("div");

        if (
            connectedCookieValue &&
            connectedCookieValue.user === profile.username
        ) {
          profileElement.style.backgroundColor = "green";
        }

        const num = document.createElement("div");
        num.textContent = profilenumber;
        profileElement.appendChild(num);

        const profilePic = document.createElement("img");
        profilePic.src = profile.photo;
        profilePic.style.maxHeight = "100px";
        profilePic.classList.add("profile-picture");
        profilePic.addEventListener("click", () => {
          leaderboardModalContainer.innerHTML = "";
          loadProfileModal(profile.username);
        });
        profileElement.appendChild(profilePic);

        const usernameElement = document.createElement("div");
        usernameElement.textContent = profile.username;
        usernameElement.classList.add("elo-username");
        usernameElement.addEventListener("click", () => {
          leaderboardModalContainer.innerHTML = "";
          loadProfileModal(profile.username);
        });
        profileElement.appendChild(usernameElement);

        const eloElement = document.createElement("div");
        eloElement.textContent = profile.elo;
        eloElement.classList.add("elo");
        profileElement.appendChild(eloElement);

        globalLBTab.appendChild(profileElement);
        profilenumber++;
      });
    } else {
      console.log("User not connected or data not available.");
    }
  } catch (error) {
    console.error(error);
  }
}
async function displayFriendLeaderboard() {
  try {
    let elos = await getFriendList();
    if (elos) {
      elos.sort((a, b) => {
        if (a.elo !== b.elo) {
          return b.elo - a.elo;
        } else {
          return a.username.localeCompare(b.username);
        }
      });
      let connectedCookieValue = getCookie("connected");
      connectedCookieValue = JSON.parse(connectedCookieValue);
      friendLBTab.innerHTML = "";
      let profilenumber = 1;
      elos.forEach((profile) => {
        const profileElement = document.createElement("div");

        if (
            connectedCookieValue &&
            connectedCookieValue.user === profile.username
        ) {
          profileElement.style.backgroundColor = "green";
        }

        const num = document.createElement("div");
        num.textContent = profilenumber;
        profileElement.appendChild(num);

        const profilePic = document.createElement("img");
        profilePic.src = profile.photo;
        profilePic.style.maxHeight = "100px";
        profilePic.classList.add("profile-picture");
        profilePic.addEventListener("click", () => {
          leaderboardModalContainer.innerHTML = "";
          loadProfileModal(profile.username);
        });
        profileElement.appendChild(profilePic);

        const usernameElement = document.createElement("div");
        usernameElement.textContent = profile.username;
        usernameElement.classList.add("elo-username");
        usernameElement.addEventListener("click", () => {
          leaderboardModalContainer.innerHTML = "";
          loadProfileModal(profile.username);
        });
        profileElement.appendChild(usernameElement);

        const eloElement = document.createElement("div");
        eloElement.textContent = profile.elo;
        eloElement.classList.add("elo");
        profileElement.appendChild(eloElement);

        friendLBTab.appendChild(profileElement);
        profilenumber++;
      });
    } else {
      console.log("User not connected or data not available.");
    }
  } catch (error) {
    console.error(error);
  }
}
function displayLBTabs() {
  displayLeaderboardList();
}

async function sendFriendRequest(event) {
  event.preventDefault(); // Prevent the default form submission
  const sender = getUsername();
  const receiver = document.getElementById("newFriendUsername").value;
  await FriendsService.sendFriendRequest(sender, receiver);
}

function checkFriendConnectionStatus(username) {
  socket.emit("checkFriendConnectionStatus", username);
  console.log("checkFriendConnectionStatus" + username);
}

async function loadLeaderboardModal() {
  const response = await fetch("../../app/leaderboardModal/leaderboardModal.html");
  const html = await response.text();
  leaderboardModalContainer.innerHTML = html;
  setUpLeaderboardModalListeners();
  displayLBTabs();
  displayFriendLeaderboard();
  document.getElementById("lbModal").style.display = "block";
}



async function getEloWorld() {
  try {
    let connectedCookieValue = getCookie("connected");
    if (connectedCookieValue) {
      const response = await fetch(endpoint+`/api/world`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch profile");
      }

      const profiles = await response.json();
      return profiles.profiles;
    }
  } catch (error) {
    console.error(error);
  }
}

async function getFriendList() {
  try {
    let connectedCookieValue = getCookie("connected");
    if (connectedCookieValue) {
      connectedCookieValue = JSON.parse(connectedCookieValue);
      const response = await fetch(`/api/friends?of=${connectedCookieValue.user}`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch profile");
      }

      const profile = await fetch(`/api/profile?of=${connectedCookieValue.user}`);
      const me = await profile.json();
      const profiles = await response.json();
      profiles.push(me.profile);
      return profiles;
    }
  } catch (error) {
    console.error(error);
  }
}

