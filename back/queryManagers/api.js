const querystring = require("querystring");
const jwt = require("jsonwebtoken");
const { RoomManager } = require("../logic/matchMaking/roomManager");
const { AchievementsManager } = require("../social/achievements");
const { getDb, userExists, areFriends, getFriendList,getProfileOf, getIdOfUser,updateProfileImage, getAllProfiles} = require("../mongoDB/mongoManager.js");
const url = require('url');
const {SocketSender} = require("../socket/socketSender");

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
    const path = request.url.split('?')[0];
    switch (path) {
      case "/api/signin":
        handleSignIn(request, response);
        break;
      case "/api/login":
        handleLogin(request, response);
        break;
      case "/api/logout":
        handleLogout(request, response);
        break;
      case "/api/matchmaking":
        handleMatchmakingRequest(request, response);
        break;
      case "/api/friend":
        console.log("friendRequest");
        handleFriendRequest(request, response);
        break;
      case "/api/versus":
        handleVersus(request, response);
        break;
      case "/api/friend/accept":
        handleFriendAcceptance(request, response);
        break;
      case "/api/friend/decline":
        handleFriendDecline(request,response);
        break;
      case "/api/profile":
        handleChangeProfile(request,response);
        break;
      case "/api/notification/del":
        handleDeleteNotification(request,response);
        break;
      default:
        response.end(`Merci d'avoir appelé ${request.url}`);
    }
  }
  else if (request.method === "GET") {
    switch (true) {
      case request.url.startsWith("/api/notifications/friends"):
        getFriendRequests(request, response);
        break;
      case request.url.startsWith("/api/notification"):
        getNotifications(request, response);
        break;
      case request.url.startsWith("/api/friends"):
        getFriends(request, response);
        break;
      case request.url.startsWith("/api/achievements"):
        getAchievements(request, response);
        break;
      case request.url.startsWith("/api/profile"):
        getProfile(request, response);
        break;
      case request.url.startsWith("/api/world"):
        getWorld(request, response);
        break;
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
      const userCollection = db.collection("users");
      const userProfileCollection = db.collection("user_profile");
      const notificationsCollection = db.collection("notifications");

      const tokenPayload = {
        username: parsedData.username,
        email: parsedData.mail,
        password: parsedData.password,
      };

      const existingUser = await userCollection.findOne({
        $or: [{ mail: parsedData.mail }, { username: parsedData.username }],
      });

      if (existingUser) {
        response.setHeader("Content-Type", "text/html");
        response.end(
          `<script>window.location.href = "/app/signin/signin.html";alert("Invalid username or password");</script>`
        );
        return;
      }
      const token = jwt.sign(tokenPayload, parsedData.username);

      const userData = {
        username: parsedData.username,
        mail: parsedData.mail,
        token: token
      };

      const { insertedId } = await userCollection.insertOne(userData);

      const userProfileData = {
        _id: insertedId,
        elo: 1000,
        friends: [],
        photo: '',
        achievements: []
      };

      await notificationsCollection.insertOne({user_id:parsedData.username,notifications:[]});

      await userProfileCollection.insertOne(userProfileData);
      await AchievementsManager.updateAchievementsList(userProfileCollection,insertedId);

      response.setHeader("Content-Type", "text/html");
      response.end(
        `<script>window.location.href = "/index.html";alert("Sign in successful");</script>`
      );
    } catch (error) {
      console.error("Error while inserting data", error);
      response.statusCode = 500;
      response.end(`Server error`);
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
          `<script>window.location.href = "/app/login/login.html";alert("Wrong username");</script>`
        );
        return;
      }

      const existingUser = await collection.findOne({
        $or: [{ mail: parsedData.login }, { username: parsedData.login }],
      });

      if (!existingUser) {
        response.setHeader("Content-Type", "text/html");
        response.end(
          `<script>window.location.href = "/app/login/login.html";alert("Wrong username");</script>`
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
          `<script>window.location.href = "/app/login/login.html";alert("Wrong username or password");</script>`
        );
        return;
      }
      setCookie(
        "connected",
        { user: existingUser.username, token: existingUser.token },
        1,
        response
      );
      const userProfileCollection = db.collection("user_profile");
      const notificationsCollection = db.collection("notifications");
      await AchievementsManager.updateAchievementsList(userProfileCollection,existingUser._id);
      let achievementNotifications = await AchievementsManager.getNotifiedAchievements(userProfileCollection,notificationsCollection,existingUser);

      console.log(achievementNotifications);
      
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

async function handleMatchmakingRequest(request, response){
  const parsedUrl = url.parse(request.url, true);
  const queryParameters = parsedUrl.query;

  const userName = queryParameters.userName;

  try {
    const userId = await getIdOfUser(userName);
    RoomManager.enterMatchmaking(userId);

    response.statusCode = 200;
    response.end(JSON.stringify({ message: 'Matchmaking request handled successfully' }));
} catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
async function handleFriendRequest(request, response){
  const parsedUrl = url.parse(request.url, true);
  const queryParameters = parsedUrl.query;

  const sender = queryParameters.sender;
  const receiver = queryParameters.receiver;
  console.log("Friend request");

  try {
    const receiverExists = await userExists(receiver);

    if (!receiverExists) {
      response.statusCode = 400;
      response.end(JSON.stringify({ error: 'User not found' }));
      return;
    }

    const alreadyFriends = await areFriends(sender,receiver);
    if (alreadyFriends){
      response.statusCode = 400;
      response.end(JSON.stringify({ error: 'Already friends' }));
      return;
    }


    const db = getDb();
    const collection = db.collection("notifications");

    const existingNotification = await collection.findOne({
      user_id: receiver,
      'notifications.sender': sender,
      'notifications.type': 'friendrequest'
    });

    if (existingNotification) {
      console.log("Dejà existant");
      response.statusCode = 400;
      response.end(JSON.stringify({ error: 'Friend request already sent' }));
      return;
    }

    const currentDateTime = new Date();
    const notificationId = `fr_${currentDateTime.getTime()}`;

    await collection.updateOne(
      { user_id: receiver },
      { 
        $push: {
          notifications: {
            $each: [{ _id:notificationId,type: "friendrequest", message:`${sender} wants to become your friend!`,sender: sender, readed: false }],
            $slice: -50
          }
        }
      },
      { upsert: true }
    );

    console.log("updateOne OK");

    response.statusCode = 200;
    response.end(JSON.stringify({ message: 'Friend request handled successfully' }));
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

async function getFriendRequests(request, response) {
  const parsedUrl = url.parse(request.url, true);
  const query = parsedUrl.query;
  console.log(query);
  const user = query.userId;

  try {
    const db = getDb();
    const collection = db.collection("notifications");
    const friendRequests = await collection.findOne(
      { user_id: user, "notifications.type": "friendrequest" },
      { "notifications.$": 1 }
    );

    if (!friendRequests || !friendRequests.notifications) {
      response.statusCode = 200;
      response.end(JSON.stringify({}));
      return;
    }

    response.statusCode = 200;
    response.end(JSON.stringify(friendRequests.notifications));
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

async function getNotifications(request, response) {
  const parsedUrl = url.parse(request.url, true);
  const query = parsedUrl.query;
  console.log(query);
  const user = query.userId;

  try {
    const db = getDb();
    const collection = db.collection("notifications");
    const notifications = await collection.findOne(
      { user_id: user }
    );

    console.log(notifications);

    if (!notifications || !notifications.notifications) {
      response.statusCode = 200;
      response.end(JSON.stringify({}));
      return;
    }

    response.statusCode = 200;
    response.end(JSON.stringify(notifications.notifications));
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

async function getAchievements(request,response){
  const parsedUrl = url.parse(request.url, true);
  const queryParameters = parsedUrl.query;

  const fromUsername = queryParameters.of;

  try {
    const profile = await getProfileOf(fromUsername);
    let achievements = profile.achievements;
    console.log(achievements);
    response.statusCode = 200;
    response.end(JSON.stringify({ achievements }));
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }

}


async function handleFriendAcceptance(request, response){
  const parsedUrl = url.parse(request.url, true);
  const queryParameters = parsedUrl.query;

  const fromUsername = queryParameters.from;
  const toUsername = queryParameters.to;

  try {
    const db = await getDb();
    const notificationsCollection = db.collection("notifications");
    const userCollection = db.collection("users");
    const userProfileCollection = db.collection("user_profile");

    const fromUser = await userCollection.findOne({ username: fromUsername });
    if (!fromUser) {
      throw new Error(`User with username '${fromUsername}' not found.`);
    }
    const fromUserId = fromUser._id;

    const toUser = await userCollection.findOne({ username: toUsername });
    if (!toUser) {
      throw new Error(`User with username '${toUsername}' not found.`);
    }
    const toUserId = toUser._id;

    await notificationsCollection.updateOne(
      { user_id: toUsername },
      { $pull: { notifications: { sender: fromUsername, type: 'friendrequest' } } }
    );

    await userProfileCollection.updateOne(
      { _id: fromUserId },
      { $addToSet: { friends: toUserId } }
    );

    await userProfileCollection.updateOne(
      { _id: toUserId },
      { $addToSet: { friends: fromUserId } }
    );

    console.log('accept');

    response.statusCode = 200;
    response.end(JSON.stringify({ message: 'Friend added successfully' }));
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

async function handleVersus(request, response){
  const parsedUrl = url.parse(request.url, true);
  const queryParameters = parsedUrl.query;

  const sender = queryParameters.sender;
  const receiver = queryParameters.receiver;

  try {
    const receiverExists = await userExists(receiver);

    if (!receiverExists) {
      response.statusCode = 400;
      response.end(JSON.stringify({ error: 'User not found' }));
      return;
    }


    const db = getDb();
    const collection = db.collection("notifications");

    const existingNotification = await collection.findOne({
      user_id: receiver,
      'notifications.sender': sender,
      'notifications.type': 'versus'
    });

    if (existingNotification) {
      response.statusCode = 400;
      response.end(JSON.stringify({ error: 'Versus request already sent' }));
      return;
    }

    const currentDateTime = new Date();
    const notificationId = `ve_${currentDateTime.getTime()}`;

    await collection.updateOne(
      { user_id: receiver },
      { 
        $push: {
          notifications: {
            $each: [{ _id:notificationId,type: "versus", message:`${sender} challenges you!`,sender: sender, readed: false }],
            $slice: -50
          }
        }
      },
      { upsert: true }
    );

    response.statusCode = 200;
    response.end(JSON.stringify({ message: 'Versus request handled successfully' }));
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
}


async function handleFriendDecline(request, response){
  const parsedUrl = url.parse(request.url, true);
  const queryParameters = parsedUrl.query;

  const from = queryParameters.from;
  const to = queryParameters.to;

  try {
    const db = await getDb();
    const notificationsCollection = db.collection("notifications");
    const usersCollection = db.collection("users");

    await notificationsCollection.updateOne(
      { user_id: to },
      { $pull: { notifications: { sender: from, type: 'friendrequest' } } }
    );
    response.statusCode = 200;
    response.end(JSON.stringify({ message: 'Friend request declined successfully' }));
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

async function getFriends(request, response){
  const parsedUrl = url.parse(request.url, true);
  const queryParameters = parsedUrl.query;

  const fromUsername = queryParameters.of;

  try {
    const friendList = await getFriendList(fromUsername);
    response.statusCode = 200;
    response.end(JSON.stringify({ friendList }));
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

async function getProfile(request, response){
  const parsedUrl = url.parse(request.url, true);
  const queryParameters = parsedUrl.query;

  const fromUsername = queryParameters.of;

  try {
    const profile = await getProfileOf(fromUsername);
    response.statusCode = 200;
    response.end(JSON.stringify({ profile }));
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

async function handleChangeProfile(request,response){
  const parsedUrl = url.parse(request.url, true);
  const queryParameters = parsedUrl.query;

  const fromUsername = queryParameters.of;
  const img = queryParameters.newimg;

  try {
    const profile = await updateProfileImage(fromUsername,img);
    response.statusCode = 200;
    response.end(JSON.stringify({ profile }));
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }

}

async function handleDeleteNotification(request,response){
  const parsedUrl = url.parse(request.url, true);
  const queryParameters = parsedUrl.query;

  const from = queryParameters.of;
  const notif = queryParameters.notif;

  try {
    
    const db = getDb();
    const collection = db.collection('notifications');
    // Delete the specified notification for the user
    const result = await collection.updateOne(
      { user_id: from },
      { $pull: { notifications: { _id: notif } } }
    );

    if (result.modifiedCount === 1) {
      response.statusCode = 200;
      response.end(JSON.stringify({ success: true, message: 'Notification deleted successfully' }));
    } else {
      response.statusCode = 404;
      response.end(JSON.stringify({ success: false, message: 'Notification not found or already deleted' }));
    }
  } catch (error) {
    console.error('Error occurred:', error);
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ success: false, message: 'Internal Server Error' }));
  }
}

async function getWorld(request,response){
  try {
    const profiles = await getAllProfiles();
    response.statusCode = 200;
    response.end(JSON.stringify({ profiles }));
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'Internal server error' }));
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
