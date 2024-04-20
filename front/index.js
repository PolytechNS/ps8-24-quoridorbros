let playButton = document.getElementById("playButton");
let profileButton = document.getElementById("profile-button");

let playWithAIButton = document.getElementById("playAIButton");
let playLocalButton = document.getElementById("playLocalButton");
let playOnlineButton = document.getElementById("playOnlineButton");

let loginButton = document.getElementById("loginButton");
let signinButton = document.getElementById("signinButton");

let leaderBoardButton = document.getElementById("leaderboard-button");
let friendsButton = document.getElementById("friends-button");

window.onload = function () {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue !== null) {
    /*
    document
      .getElementById("friendSocketInitAnchor")
      .appendChild(document.createElement("script")).src =
      "/app/sockets/ioManager.js";
    document
      .getElementById("friendSocketInitAnchor")
      .appendChild(document.createElement("script")).src =
      "/app/friendlist/friendlist.js";
    document
      .getElementById("friendSocketInitAnchor")
      .appendChild(document.createElement("script")).src =
      "/app/sockets/matchmakingEvents.js";
      */

    leaderBoardButton.style.display = "block";
    friendsButton.style.display = "block";
    profileButton.style.display = "inline-block";

    loginButton.style.display = "none";
    signinButton.style.display = "none";
    playWithAIButton.style.display = "none";
    playLocalButton.style.display = "none";
    playOnlineButton.style.display = "none";

    playOnlineButton.disabled = false;
    playWithAIButton.disabled = false;
    document.getElementById("loginNote").style.display = "none";
    playOnlineButton.classList.add("mainButtonClass");
    playOnlineButton.classList.remove("mainButtonDisabledClass");
    playWithAIButton.classList.add("mainButtonClass");
    playWithAIButton.classList.remove("mainButtonDisabledClass");
    playButton.style.display = "inline";

    const storeProfile = async () => {
      const response = await fetch(`/api/profile?of=${getUsername()}`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      const profileData = data.profile;
      let profileDataString = JSON.stringify(profileData);
      localStorage.setItem("profileString", profileDataString);
    };
    storeProfile();
  }
};

function logout() {
  fetch("/api/logout", {
    method: "POST",
  })
    .then((response) => {
      if (response.ok) {
        playWithAIButton.style.display = "none";
        playLocalButton.style.display = "none";
        playOnlineButton.style.display = "none";
        playOnlineButton.disabled = true;
        playWithAIButton.disabled = true;
        profileButton.style.display = "none";
        leaderBoardButton.style.display = "none";
        friendsButton.style.display = "none";

        playButton.style.display = "inline";
        loginButton.style.display = "inline";
        signinButton.style.display = "inline";

        document.getElementById("loginNote").style.display = "inline";
        playOnlineButton.classList.remove("mainButtonClass");
        playOnlineButton.classList.add("mainButtonDisabledClass");
        playWithAIButton.classList.remove("mainButtonClass");
        playWithAIButton.classList.add("mainButtonDisabledClass");
      }
    })
    .catch((error) => console.error("Error:", error));
}

async function getEloWorld() {
  try {
    let connectedCookieValue = getCookie("connected");
    if (connectedCookieValue) {
      const response = await fetch(`/api/world`);
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

async function displayEloWorld() {
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

      const achievementsDiv = document.getElementById("elos-world");
      achievementsDiv.innerHTML = "";
      console.log(elos);
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
        profileElement.appendChild(profilePic);

        const usernameElement = document.createElement("div");
        console.log(profile.username);
        usernameElement.textContent = profile.username;
        usernameElement.classList.add("elo-username");
        profileElement.appendChild(usernameElement);

        const eloElement = document.createElement("div");
        eloElement.textContent = profile.elo;
        console.log(profile.elo);
        eloElement.classList.add("elo");
        profileElement.appendChild(eloElement);

        achievementsDiv.appendChild(profileElement);
        profilenumber++;
      });
      // Here you can manipulate the DOM to display elos data as needed
    } else {
      console.log("User not connected or data not available.");
    }
  } catch (error) {
    console.error(error);
  }
}

playButton.addEventListener("click", function () {
  playButton.style.display = "none";
  loginButton.style.display = "none";
  signinButton.style.display = "none";

  playWithAIButton.style.display = "inline";
  playLocalButton.style.display = "inline";
  playOnlineButton.style.display = "inline";
});

leaderBoardButton.addEventListener("click", function () {
  document.getElementById("indexPopup").style.display = "flex";
  document.getElementById("profileEditorPopup").style.display = "none";
  document.getElementById("eloPopup").style.display = "block";
  displayEloWorld();
});

friendsButton.addEventListener("click", function (event) {
  loadFriendsModal();
});

profileButton.addEventListener("click", function () {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue) {
    connectedCookieValue = JSON.parse(connectedCookieValue);
    loadProfileModal(connectedCookieValue.user);
  } else {
    throw new Error("Failed to fetch profile");
  }
});
