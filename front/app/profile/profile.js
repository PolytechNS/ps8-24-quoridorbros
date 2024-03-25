const profileContainer = document.getElementById('profile-container');

async function displayProfile() {
    try {
        let connectedCookieValue = getCookie("connected");
        if (connectedCookieValue) {
            connectedCookieValue = JSON.parse(connectedCookieValue);
            const sender = connectedCookieValue.user;
            const response = await fetch(`/api/profile?of=${sender}`);
            if (response.status !== 200) {
                throw new Error('Failed to fetch profile');
            }
            
            const data = await response.json();
            const profileData = data.profile;

            const profilePhotoElement = document.createElement('img');
            profilePhotoElement.src = profileData.photo;
            profilePhotoElement.alt = "Profile Photo";

            const profileEmailElement = document.createElement('div');
            profileEmailElement.textContent = `${profileData.username}`;

            const profileBioElement = document.createElement('div');
            profileBioElement.textContent = `Elo: ${profileData.elo}`;
            profileContainer.appendChild(profilePhotoElement);
            profileContainer.appendChild(profileEmailElement);
            profileContainer.appendChild(profileBioElement);
        }
    } catch (error) {
        console.error(error);
    }
}

async function loadProfile() {
    const response = await fetch('./app/profile/profile.html');
    const html = await response.text();
    profileContainer.innerHTML = html;
    await displayProfile();
}

loadProfile();