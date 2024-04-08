const profileEditorContainer = document.getElementById('profile-editor-container');

const images = [
    "./assets/images/profile/img1.webp",
    "./assets/images/profile/img2.webp",
    "./assets/images/profile/img3.webp"
];

async function selectImage(profile, imageSrc) {
    const imgFileName = imageSrc.split("/").pop();
    
    try {
        const response = await fetch(`/api/profile?of=${profile}&newimg=${imgFileName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Failed to select image');
        }
        console.log('Image selected successfully');
        window.location.href="/index.html"
    } catch (error) {
        console.error('Error selecting image:', error);
    }
}

async function displayImagesFromDirectory() {
    try {
        const connectedCookieValue = getCookie("connected");
        if (!connectedCookieValue) {
            throw new Error('User not authenticated');
        }
        const { user: sender } = JSON.parse(connectedCookieValue);
        const response = await fetch(`/api/profile?of=${sender}`);
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        const { profile: profileData } = await response.json();

        const ulElement = document.getElementById("imageList");
        images.forEach(imageSrc => {
            const liElement = document.createElement("li");
            const imgElement = document.createElement("img");
            imgElement.src = imageSrc;
            if (imageSrc === profileData.photo) {
                imgElement.classList.add("glow");
            }
            imgElement.classList.add("clickable-img");
            imgElement.addEventListener("click", () => {
                selectImage(sender, imageSrc);
            });
            liElement.appendChild(imgElement);
            ulElement.appendChild(liElement);
        });
    } catch (error) {
        console.error('Error displaying images:', error);
    }
}

async function loadProfileEditor() {
    try {
        const response = await fetch('./app/profile/profileEditor/profileEditor.html');
        if (!response.ok) {
            throw new Error('Failed to load profile editor');
        }
        const html = await response.text();
        profileEditorContainer.innerHTML = html;
        await displayImagesFromDirectory();
    } catch (error) {
        console.error('Error loading profile editor:', error);
    }
}

loadProfileEditor();
