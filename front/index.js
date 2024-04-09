let playWithAIButton = document.getElementById("playAIButton");
let playLocalButton = document.getElementById("playLocalButton");
let playOnlineButton = document.getElementById("playOnlineButton");
let logoutButton = document.getElementById("logoutButton");
let playButton = document.getElementById("playButton");
let backButton = document.getElementById("backButton");
let notButton = document.getElementById("notificationsButton");
let PEButton = document.getElementById("profileEditorButton");
let eloButton = document.getElementById("eloButton");
let achButton = document.getElementById("achievementsButton");

window.onload = function () {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue !== null) {
    /* Une hérésie qui nous évite de refactor : */
    document.getElementById("friendSocketInitAnchor").appendChild(document.createElement("script")).src = "/app/sockets/ioManager.js";
    document.getElementById("friendSocketInitAnchor").appendChild(document.createElement("script")).src = "/app/friendlist/friendlist.js";
    document.getElementById("friendSocketInitAnchor").appendChild(document.createElement("script")).src = "/app/sockets/matchmakingEvents.js";
    document.getElementById("friendSocketInitAnchor").appendChild(document.createElement("script")).src = "/app/notifications/notifications.js";
    /* Désolé */
    document.getElementById("profile-container").style.display = "flex";
    logoutButton.style.display = "block";
    notButton.style.display = "block";
    PEButton.style.display = "block";
    eloButton.style.display = "block";
    achButton.style.display = "block";
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("signinButton").style.display = "none";
    document.getElementById("friend-container").style.display = "inline";
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
    backButton.style.display = "none";

  }
};

document.getElementById("logoutButton").addEventListener("click", function () {
  fetch("/api/logout", {
    method: "POST",
  })
    .then((response) => {
      if (response.ok) {
        document.getElementById("profile-container").style.display = "none";
        logoutButton.style.display = "none";
        notButton.style.display = "none";
        PEButton.style.display = "none";
        eloButton.style.display = "none";
        achButton.style.display = "none";
        document.getElementById("loginButton").style.display = "inline";
        document.getElementById("signinButton").style.display = "inline";
        document.getElementById("friend-container").style.display = "none";
        playWithAIButton.style.display = "none";
        playLocalButton.style.display = "none";
        playOnlineButton.style.display = "none";
        playOnlineButton.disabled = true;
        playWithAIButton.disabled = true;
        document.getElementById("loginNote").style.display = "inline";
        playOnlineButton.classList.remove("mainButtonClass");
        playOnlineButton.classList.add("mainButtonDisabledClass");
        playWithAIButton.classList.remove("mainButtonClass");
        playWithAIButton.classList.add("mainButtonDisabledClass");
        playButton.style.display = "inline";
        backButton.style.display = "none";
      }
    })
    .catch((error) => console.error("Error:", error));
});


async function getAchievements(){
  try {
    let connectedCookieValue = getCookie("connected");
    if (connectedCookieValue) {
        connectedCookieValue = JSON.parse(connectedCookieValue);
        const sender = connectedCookieValue.user;
        const response = await fetch(`/api/achievements?of=${sender}`);
        if (response.status !== 200) {
            throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        return data.achievements;
    }
} catch (error) {
    console.error(error);
}
}

async function displayAchievements() {
  try {
    let achievements = await getAchievements();
    const achievementsDiv = document.getElementById('achievements');
    console.log(achievements);

    for (let achievementId in achievements) {
      const achievement = achievements[achievementId];

      const achievementElement = document.createElement('div');
      achievementElement.classList.add('achievement');

      const imageElement = document.createElement('img');
      imageElement.src = `./assets/images/achievements/${achievement.id}.png`;
      imageElement.style.filter = achievement.progression < achievement.out ? 'grayscale(100%)' : 'none';
      achievementElement.appendChild(imageElement);

      const descriptionElement = document.createElement('p');
      descriptionElement.textContent = achievement.description;
      achievementElement.appendChild(descriptionElement);

      achievementsDiv.appendChild(achievementElement);
    }
  } catch (error) {
    console.error(error);
  }
}


async function getEloWorld(){
  try {
    let connectedCookieValue = getCookie("connected");
    if (connectedCookieValue) {
        const response = await fetch(`/api/world`);
        if (response.status !== 200) {
            throw new Error('Failed to fetch profile');
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
          
          const achievementsDiv = document.getElementById('elos-world');
          achievementsDiv.innerHTML = '';
          console.log(elos);
          let profilenumber=1;

          elos.forEach(profile => {
            const profileElement = document.createElement('div');

            if (connectedCookieValue && connectedCookieValue.user === profile.username){
              profileElement.style.backgroundColor = 'green';
            }

            const num = document.createElement('div');
            num.textContent = profilenumber;
            profileElement.appendChild(num);

            const profilePic = document.createElement('img');
            profilePic.src = profile.photo;
            profilePic.style.maxHeight = '100px';
            profilePic.classList.add('profile-picture');
            profileElement.appendChild(profilePic);

            const usernameElement = document.createElement('div');
            console.log(profile.username);
            usernameElement.textContent = profile.username;
            usernameElement.classList.add('elo-username');
            profileElement.appendChild(usernameElement);
            
            const eloElement = document.createElement('div');
            eloElement.textContent = profile.elo;
            console.log(profile.elo);
            eloElement.classList.add('elo');
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
document.getElementById("playButton").addEventListener("click", function () {
  playWithAIButton.style.display = "inline";
  playLocalButton.style.display = "inline";
  playOnlineButton.style.display = "inline";
  playButton.style.display = "none";
  backButton.style.display = "inline";
  document.getElementById("loginButton").style.display = "none";
  document.getElementById("signinButton").style.display = "none";
});
document.getElementById("notificationsButton").addEventListener("click", function () {
  document.getElementById("indexPopup").style.display = "flex";
  document.getElementById("notificationsPopup").style.display = "block";
  document.getElementById("profileEditorPopup").style.display = "none";
  document.getElementById("eloPopup").style.display = "none";
  document.getElementById("achievementsPopup").style.display = "none";
});
document.getElementById("profileEditorButton").addEventListener("click", function () {
  document.getElementById("indexPopup").style.display = "flex";
  document.getElementById("notificationsPopup").style.display = "none";
  document.getElementById("profileEditorPopup").style.display = "block";
    document.getElementById("eloPopup").style.display = "none";
    document.getElementById("achievementsPopup").style.display = "none";
});
document.getElementById("eloButton").addEventListener("click", function () {
    document.getElementById("indexPopup").style.display = "flex";
    document.getElementById("notificationsPopup").style.display = "none";
    document.getElementById("profileEditorPopup").style.display = "none";
    document.getElementById("eloPopup").style.display = "block";
    document.getElementById("achievementsPopup").style.display = "none";
    displayEloWorld()
});
document.getElementById("achievementsButton").addEventListener("click", function () {
    document.getElementById("indexPopup").style.display = "flex";
    document.getElementById("notificationsPopup").style.display = "none";
    document.getElementById("profileEditorPopup").style.display = "none";
    document.getElementById("eloPopup").style.display = "none";
    document.getElementById("achievementsPopup").style.display = "block";
    displayAchievements();
});
document.getElementById("popupClose").addEventListener("click", function () {
  document.getElementById("indexPopup").style.display = "none";
    document.getElementById("notificationsPopup").style.display = "none";
    document.getElementById("profileEditorPopup").style.display = "none";
    document.getElementById("eloPopup").style.display = "none";
    document.getElementById("achievementsPopup").style.display = "none";
});

