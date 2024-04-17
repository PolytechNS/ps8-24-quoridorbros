const modalContainer = document.getElementById("modal-container");

document
  .getElementsByClassName("close")[0]
  .addEventListener("click", function () {
    modalContainer.innerHTML = "";
  });

window.addEventListener("click", function (event) {
  if (event.target == document.getElementById("myModal")) {
    modalContainer.innerHTML = "";
  }
});

async function getAchievements(username) {
  try {
    console.log("getAchievements", username);

      const response = await fetch(`/api/achievements?of=${username}`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      return data.achievements;

  } catch (error) {
    console.error(error);
  }
}

async function displayAchievements(username) {
  try {
    console.log("displayAchievements", username);

    let achievements = await getAchievements(username);
    const achievementsContainer = document.getElementById(
      "achievements-container",
    );
    console.log(achievements);

    for (let achievementId in achievements) {
      const achievement = achievements[achievementId];

      const achievementElement = document.createElement("div");
      achievementElement.classList.add("achievement");

      const imageElement = document.createElement("img");
      imageElement.src = `./assets/images/achievements/${achievement.id}.png`;
      imageElement.style.filter =
        achievement.progression < achievement.out ? "grayscale(100%)" : "none";
      achievementElement.appendChild(imageElement);

      const descriptionElement = document.createElement("p");
      descriptionElement.textContent = achievement.description;
      achievementElement.appendChild(descriptionElement);

      achievementsContainer.appendChild(achievementElement);
    }
  } catch (error) {
    console.error(error);
  }
}

async function displayProfileLine(username) {
  try {
    console.log("displayProfileLine", username);

      const response = await fetch(`/api/profile?of=${username}`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      const profileData = data.profile;

      const profilePhotoElement = document.getElementById("profile-photo");
      profilePhotoElement.src = profileData.photo;
      profilePhotoElement.alt = "Profile Photo";

      const profileUsernameElement = document.getElementById("username");
      profileUsernameElement.textContent = profileData.username;

      const profileEloElement = document.getElementById("elo-text");
      profileEloElement.textContent = `${profileData.elo} 🏆`;

  } catch (error) {
    console.error(error);
  }
}

async function loadModal(username) {
  console.log("loadModal", username);
  const response = await fetch("../../app/modal/modal.html");
  const html = await response.text();
  modalContainer.innerHTML = html;
  document.getElementById("myModal").style.display = "block";
  displayAchievements(username);
  displayProfileLine(username);
}
