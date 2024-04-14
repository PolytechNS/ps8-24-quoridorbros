const profileContainer = document.getElementById("profile-container");

async function displayProfile() {
  try {
    let connectedCookieValue = getCookie("connected");
    if (connectedCookieValue) {
      connectedCookieValue = JSON.parse(connectedCookieValue);
      const sender = connectedCookieValue.user;
      const response = await fetch(`/api/profile?of=${sender}`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      const profileData = data.profile;

      const profilePhotoElement = document.createElement("img");
      profilePhotoElement.src = profileData.photo;
      profilePhotoElement.alt = "Profile Photo";
      profilePhotoElement.id = "profilePhoto";

      const profileUsernameElement = document.createElement("div");
      profileUsernameElement.textContent = profileData.username;
      profileUsernameElement.id = "profileUsername";

      const profileEloElement = document.createElement("div");
      profileEloElement.textContent = `ELO: ${profileData.elo}`;
      profileEloElement.id = "profileElo";

      let profileDataString = JSON.stringify(profileData);
      localStorage.setItem("profileString", profileDataString);

      profileContainer.appendChild(profilePhotoElement);
      profileContainer.appendChild(profileUsernameElement);
      profileContainer.appendChild(profileEloElement);
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadProfile() {
  const response = await fetch("./app/profile/profile.html");
  const html = await response.text();
  profileContainer.innerHTML = html;
  await displayProfile();
}

loadProfile();
