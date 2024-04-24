const profileContainer = document.getElementById("profile-container");
const optionsContainer = document.getElementById("options-container");
const opponentProfileContainer = document.getElementById(
  "opponent-profile-container",
);

function displayProfile() {
  try {
    myProfile = JSON.parse(localStorage.getItem("profileString"));
    const profilePhotoElement = document.createElement("img");
    profilePhotoElement.src = "../../" + myProfile.photo;
    profilePhotoElement.alt = "Profile Photo";
    profilePhotoElement.id = "profilePhoto";
    const profileUsernameElement = document.createElement("div");
    profileUsernameElement.textContent = myProfile.username;
    profileUsernameElement.id = "profileUsername";
    const profileEloElement = document.createElement("div");
    profileEloElement.textContent = `ELO: ${myProfile.elo}`;
    profileEloElement.id = "profileElo";
    profileContainer.appendChild(profilePhotoElement);
    profileContainer.appendChild(profileUsernameElement);
    profileContainer.appendChild(profileEloElement);
  } catch (error) {
    console.error(error);
  }
  try {
    opponentProfile = JSON.parse(localStorage.getItem("profileOpponentString"));
    const opponentProfilePhotoElement = document.createElement("img");
    opponentProfilePhotoElement.src = "../../" + opponentProfile.photo;
    opponentProfilePhotoElement.alt = "Profile Photo";
    opponentProfilePhotoElement.id = "opponentProfilePhoto";
    const opponentProfileUsernameElement = document.createElement("div");
    opponentProfileUsernameElement.textContent = opponentProfile.username;
    opponentProfileUsernameElement.id = "opponentProfileUsername";
    const opponentProfileEloElement = document.createElement("div");
    opponentProfileEloElement.textContent = `ELO: ${opponentProfile.elo}`;
    opponentProfileEloElement.id = "opponentProfileElo";
    opponentProfileContainer.appendChild(opponentProfilePhotoElement);
    opponentProfileContainer.appendChild(opponentProfileUsernameElement);
    opponentProfileContainer.appendChild(opponentProfileEloElement);
  } catch (error) {
    console.error(error);
  }
}

displayProfile();
