const friendlistcontainer = document.getElementById('friend-container');

/*
document.getElementById("friendRequestForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    let connectedCookieValue = getCookie("connected");
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
  
      } catch (error) {
        console.error('Error:', error);
        alert("An error occurred while processing your request.");
      }
    }
  });

  
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
      friendElement.textContent = friend;
      friendListContainer.appendChild(friendElement);
    });
  }
*/

async function loadFriends() {
    const response = await fetch('/app/friendlist/friendlist.html');
    const html = await response.text();
    friendlistcontainer.innerHTML = html;
}

loadFriends();
