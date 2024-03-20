document.getElementById("join").addEventListener("click", function () {
  let jsonCookie = getCookie("connected");
  console.log("click on matchmaking");

  let cookie = JSON.parse(jsonCookie);
  enterMatchMaking(cookie);
});
