let socket = io();

let jsonCookie = getCookie("connected");
let cookie = JSON.parse(jsonCookie);
console.log("ON EST LA")

socket.on("getCookie", () => {
  socket.emit("cookie", cookie);
});

function getSocket() {
  return socket;
}
