const friendlistcontainer = document.getElementById('friend-container');

async function fetchFriendList() {
  try {
    let connectedCookieValue = getCookie("connected");
    if (connectedCookieValue) {
      connectedCookieValue = JSON.parse(connectedCookieValue);
      const sender = connectedCookieValue.user;
      const response = await fetch(`/api/friends?of=${sender}`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch friends');
      }
      const friends = await response.json();
      displayFriends(friends.friendList);
    }
  } catch (error) {
    console.error(error);
  }
}

function displayFriends(friends) {
  const friendListContainer = document.getElementById('friend-list');
  friendListContainer.innerHTML = '';

  friends.forEach(friend => {
    const friendElement = document.createElement('div');
    friendElement.classList.add('friend');

    const profilePic = document.createElement('img');
    profilePic.src = friend.photo;
    profilePic.style.maxHeight = '100px';
    profilePic.classList.add('profile-picture');
    friendElement.appendChild(profilePic);

    const usernameElement = document.createElement('div');
    usernameElement.textContent = friend.username;
    usernameElement.classList.add('username');
    friendElement.appendChild(usernameElement);
    const challengeButton = document.createElement('button');
    challengeButton.textContent = 'Challenge';
    challengeButton.classList.add('challenge-button');
    friendElement.appendChild(challengeButton);

    friendListContainer.appendChild(friendElement);
  });
}

function openform() {
  var modal = document.getElementById("friendRequestPopup");
  console.log("coucou");
  if (modal.style.display === "" || modal.style.display === "none") {
    modal.style.display = "block";
  } else {
    modal.style.display = "none";
  }
}


async function loadFriends() {
    const response = await fetch('./app/friendlist/friendlist.html');
    const html = await response.text();
    friendlistcontainer.innerHTML = html;
    await fetchFriendList();
}

loadFriends();
