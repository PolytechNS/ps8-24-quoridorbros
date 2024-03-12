document.getElementById("join").addEventListener("click", function () {
    let connectedCookieValue = getCookie("connected");
    console.log("click on matchmaking");
    enterMatchMaking(connectedCookieValue);
  });