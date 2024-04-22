let jsonCookie = getCookie("connected");
let cookie = JSON.parse(jsonCookie);
let cookieReceived = false;
let socket;

if (cookie) {
  socket = io();
  socket.on("getCookie", () => {
    socket.emit("cookie", cookie);
  });

  socket.on("cookieReceived", () => {
    cookieReceived = true;
  });
}

function getSocket() {
  return new Promise((resolve, reject) => {
    // Vérification de l'état du cookie
    if (cookieReceived) {
      // Si le cookie a déjà été reçu, résoudre la promesse avec la socket existante
      resolve(socket);
    } else if (cookie) {
      // Si le cookie n'a pas encore été reçu, attendre l'événement "cookieReceived"
      socket.on("cookieReceived", () => {
        // Une fois le cookie reçu, résoudre la promesse avec la socket
        resolve(socket);
      });
    }
  });
}
