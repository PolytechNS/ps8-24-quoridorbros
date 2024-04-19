const friendListContainer = document.getElementById("friend-list-container");

function openform() {
  let modal = document.getElementById("friendRequestPopup");
  if (modal.style.display === "" || modal.style.display === "none") {
    modal.style.display = "block";
  } else {
    modal.style.display = "none";
  }
}

function challenge(username) {
  socket.emit("challengeFriend", username);
}

async function loadFriends() {
  const response = await fetch("./app/friendlist/friendlist.html");
  const html = await response.text();
  friendListContainer.innerHTML = html;
  await displayFriends();
}

loadFriends();
