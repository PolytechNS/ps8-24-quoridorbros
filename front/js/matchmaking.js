document.getElementById("join").addEventListener("click", function () {
    let connectedCookieValue = getCookie("connected");
    console.log("click on matchmaking");

    let connectedData = JSON.parse(connectedCookieValue);
    console.log(connectedData);
    console.log(connectedData.user);
    console.log(connectedData.token);
    enterMatchMaking(connectedData);
  });