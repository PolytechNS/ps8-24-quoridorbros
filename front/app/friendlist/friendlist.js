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

async function sendFriendResquet(event) {
  event.preventDefault(); // Prevent the default form submission
  let connectedCookieValue = getCookie("connected");
  console.log("friendRequestForm");
  if (connectedCookieValue) {
      try {
      connectedCookieValue = JSON.parse(connectedCookieValue);

      const sender = connectedCookieValue.user;
      const receiver = document.getElementById("receiver").value;

      const requestURL = `/api/friend?sender=${encodeURIComponent(sender)}&receiver=${encodeURIComponent(receiver)}`;

      const response = await fetch(requestURL, {
          method: "POST",
          headers: {
          "Content-Type": "application/json"
          }
      });
      const responseData = await response.text();
      console.log(response.status);
      if (response.status === 200) {
          alert("Friend request sent successfully!");
      } else if (response.status === 400) {
          const errorResponse = JSON.parse(responseData);
          alert(`Bad request: ${errorResponse.error}`);
      } else if (response.status === 500) {
          alert("Internal Server Error. Please try again later.");
      } else {
          alert("Unexpected error. Please try again later.");
      }
          document.getElementById("friendRequestForm").reset();
          console.log("bonjour");
          openform();

      } catch (error) {
      console.error('Error:', error);
      alert("An error occurred while processing your request.");
      }
  }
}

loadFriends();
