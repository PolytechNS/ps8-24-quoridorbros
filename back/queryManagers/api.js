const querystring = require("querystring");
const jwt = require("jsonwebtoken");
const { getDb, userExists} = require("../mongoDB/mongoManager.js");

function setCookie(name, value, daysToLive, response) {
  const stringValue = typeof value === "object" ? JSON.stringify(value) : value;

  const expires = new Date(
    Date.now() + daysToLive * 24 * 60 * 60 * 1000
  ).toUTCString();
  const cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    stringValue
  )}; expires=${expires}; path=/`;
  response.setHeader("Set-Cookie", cookie);
}

function manageRequest(request, response) {
  if (request.method === "POST") {
    switch (request.url) {
      case "/api/signin":
        handleSignIn(request, response);
        break;
      case "/api/login":
        handleLogin(request, response);
        break;
      case "/api/logout":
        handleLogout(request, response);
        break;
      case "/api/friend":
        handleFriendRequest(request, response);
      default:
        response.end(`Merci d'avoir appelé ${request.url}`);
    }
  }
  else if (request.method === "GET") {
    switch (request.url) {
      case "/api/friends/:user":
        getFriendRequests(request, response);
      default:
        response.end(`Merci d'avoir appelé ${request.url}`);
    }
  }
}

async function handleSignIn(request, response) {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk.toString();
  });
  request.on("end", async () => {
    const parsedData = querystring.parse(body);

    try {
      const db = getDb();
      const collection = db.collection("users");

      const tokenPayload = {
        username: parsedData.username,
        email: parsedData.mail,
        password: parsedData.password,
      };

      const existingUser = await collection.findOne({
        $or: [{ mail: parsedData.mail }, { username: parsedData.username }],
      });

      if (existingUser) {
        response.setHeader("Content-Type", "text/html");
        response.end(
          `<script>window.location.href = "/pages/signin.html";alert("Invalid username or password");</script>`
        );
        return;
      }
      const token = jwt.sign(tokenPayload, parsedData.username);

      const encodedData = {
        username: parsedData.username,
        mail: parsedData.mail,
        token: token,
      };

      await collection.insertOne(encodedData);
      response.setHeader("Content-Type", "text/html");
      response.end(
        `<script>window.location.href = "/index.html";alert("Sign in successful");</script>`
      );
    } catch (error) {
      console.error("Erreur lors de l’insertion des données", error);
      response.statusCode = 500;
      response.end(`Erreur serveur`);
    }
  });
}

async function handleLogin(request, response) {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk.toString();
  });
  request.on("end", async () => {
    const parsedData = querystring.parse(body);

    try {
      const db = getDb();
      const collection = db.collection("users");

      if (!collection) {
        response.setHeader("Content-Type", "text/html");
        response.end(
          `<script>window.location.href = "/pages/login.html";alert("Wrong username");</script>`
        );
        return;
      }

      const existingUser = await collection.findOne({
        $or: [{ mail: parsedData.login }, { username: parsedData.login }],
      });

      if (!existingUser) {
        response.setHeader("Content-Type", "text/html");
        response.end(
          `<script>window.location.href = "/pages/login.html";alert("Wrong username");</script>`
        );
        return;
      }

      const decodedToken = jwt.verify(
        existingUser.token,
        existingUser.username
      );

      if (parsedData.password != decodedToken.password) {
        response.setHeader("Content-Type", "text/html");
        response.end(
          `<script>window.location.href = "/pages/login.html";alert("Wrong username or password");</script>`
        );
        return;
      }
      setCookie(
        "connected",
        { user: existingUser.username, token: existingUser.token },
        1,
        response
      );
      response.setHeader("Content-Type", "text/html");
      response.end(
        `<script>window.location.href = "/index.html";alert("Connexion success");</script>`
      );
    } catch (error) {
      console.error("Erreur lors de la recherche de l'utilisateur", error);
      response.statusCode = 500;
      response.end(`Erreur serveur`);
    }
  });
}

function handleLogout(request, response) {
  try {
    setCookie("connected", "", -1, response);
    response.setHeader("Content-Type", "text/html");
    response.end(
      `<script>window.location.href = "/index.html";alert("You have been logged out successfully.");</script>`
    );
  } catch (error) {
    console.error("Erreur lors de la déconnexion", error);
    response.statusCode = 500;
    response.end("Erreur serveur lors de la déconnexion");
  }
}

async function handleFriendRequest(request, response){
  const { sender, receiver } = request.body;

  try {
    const receiverExists = await userExists(receiver);

    if (!receiverExists) {
      response.status(500).json({ error: 'Receiver not found' });
    }

    const db = getDb();
    const collection = db.collection("notifications");

    await collection.updateOne(
      { user_id: receiver },
      { 
        $push: {
          notifications: {
            $each: [{ type: "friendrequest", sender: sender }],
            $slice: -50
          }
        }
      },
      { upsert: true }
    );

    response.status(200).json({ message: 'Friend request handled successfully' });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    response.status(500).json({ error: 'Internal server error' });
  }
}

async function getFriendRequests(request, response) {
  const { user } = request.params;
  try {
    const db = getDb();
    const collection = db.collection("notifications");
    const friendRequests = await collection.findOne(
      { user_id: user },
      { notifications: { $elemMatch: { type: "friendrequest" } } }
    );

    if (!friendRequests || !friendRequests.notifications) {
      response.status(200).json([]);
      return;
    }

    response.status(200).json(friendRequests.notifications);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Failed to retrieve friend requests' });
  }
}




/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
 ** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
 ** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept PUT).
 ** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this example
 ** are probably not the ones you will need. */
function addCors(response) {
  // Website you wish to allow to connect to your server.
  response.setHeader("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow.
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  // Request headers you wish to allow.
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  // Set to true if you need the website to include cookies in the requests sent to the API.
  response.setHeader("Access-Control-Allow-Credentials", true);
}

exports.manage = manageRequest;
