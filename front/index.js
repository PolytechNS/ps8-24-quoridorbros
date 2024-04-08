let playWithAIButton = document.getElementById("playAIButton");
let playLocalButton = document.getElementById("playLocalButton");
let playOnlineButton = document.getElementById("playOnlineButton");
let logoutButton = document.getElementById("logoutButton");

window.onload = function () {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue !== null) {
    document.getElementById("profile-container").style.display = "block";
    document.getElementById("logoutButton").style.display = "block";
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("signinButton").style.display = "none";
    playWithAIButton.style.display = "inline";
    playLocalButton.style.display = "inline";
    playOnlineButton.style.display = "inline";
  }
};

document.getElementById("logoutButton").addEventListener("click", function () {
  fetch("/api/logout", {
    method: "POST",
  })
    .then((response) => {
      if (response.ok) {
        document.getElementById("profile-container").style.display = "none";
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
//displayAchievements();