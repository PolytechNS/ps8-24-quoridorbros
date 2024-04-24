function getCookie(name) {
  let value = `; ${document.cookie}`;
  const cookies = value.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const [cookieName, cookieValue] = cookies[i].trim().split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

function getUsername() {
  let connectedCookieValue = getCookie("connected");
  if (connectedCookieValue) {
    return JSON.parse(connectedCookieValue).user;
  } else {
    throw new Error("Failed to get username");
  }
}
