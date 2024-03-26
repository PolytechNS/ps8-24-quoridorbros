const { MongoClient, ObjectId } = require("mongodb");

const url = "mongodb://mongodb:27017";
const dbName = "QuoribrosB";

let db = null;

async function connect() {
  const client = new MongoClient(url);
  await client.connect();
  console.log("Connected to MongoDB");
  db = client.db(dbName);
}

function getDb() {
  return db;
}

async function saveGameState(userId, gameState) {
  const save = {
    token: userId,
    game: gameState,
  };
  try {
    const db = getDb();
    const collection = db.collection("gameStates");
    await collection.updateOne(
      { token: userId },
      { $set: save },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error saving game state", error);
  }
}

async function loadGameState(userId) {
  try {
    const db = getDb();
    const collection = db.collection("gameStates");
    const save = await collection.findOne({
      token: userId,
    });
    if (!save) {
      console.log("No game state found for this user token");
      return null;
    }
    console.log(save.game);
    return save.game;
  } catch (error) {
    console.error("Error loading game state", error);
    return null;
  }
}

async function userExists(userToken) {
  try {
    const db = getDb();
    const collection = db.collection("users");
    const userDocument = await collection.findOne({ username: userToken });
    
    if (!userDocument) {
      console.log("No user found for the provided username:", userToken);
      return false;
    }

    return true;
  } catch (error) {
    console.error("An error occurred while loading user ID:", error);
    return false;
  }
}

async function getUserProfileById(userId, userProfileCollection) {
  const userProfile = await userProfileCollection.findOne({ _id: userId });
  if (!userProfile) {
    throw new Error(`User profile not found for user with ID ${userId}.`);
  }
  return userProfile;
}

async function areFriends(user1, user2) {
  try {
    if (!user1 || !user2) {
      throw new Error("Invalid input: Both users must be provided.");
    }

    const db = await getDb();
    const usersCollection = db.collection("users");
    const userProfileCollection = db.collection("user_profile");

    const user1Document = await usersCollection.findOne({ username: user1 });
    if (!user1Document) {
      throw new Error(`User ${user1} not found.`);
    }

    const user2Document = await usersCollection.findOne({ username: user2 });
    if (!user2Document) {
      throw new Error(`User ${user2} not found.`);
    }

    const user1Profile = await getUserProfileById(user1Document._id, userProfileCollection);
    const user2Profile = await getUserProfileById(user2Document._id, userProfileCollection);

    let areFriendsUser1 = false;
    user1Profile.friends.forEach(e => {
      if (e.equals(user2Document._id))
        areFriendsUser1 = true;
    });

    let areFriendsUser2 = false;
    user2Profile.friends.forEach(e => {
      if (e.equals(user1Document._id))
        areFriendsUser2 = true;
    });

    return areFriendsUser1 && areFriendsUser2;
  } catch (error) {
    console.error("Error checking friendship:", error);
    return false;
  }
}




async function getFriendList(username) {
  try {
    const db = await getDb();
    const userCollection = db.collection("users");
    const userProfileCollection = db.collection("user_profile");

    const user = await userCollection.findOne({ username: username });
    if (!user) {
      throw new Error(`User with username '${username}' not found.`);
    }
    
    const userProfile = await userProfileCollection.findOne({ _id: user._id });
    if (!userProfile) {
      throw new Error(`User profile not found for user '${username}'.`);
    }

    const friends = await userCollection
      .find(
        { _id: { $in: userProfile.friends } },
        { projection: { _id: 0, username: 1 } }
      )
      .toArray();

    const friendListWithProfiles = [];
    for (const friend of friends) {
      const friendProfile = await getProfileOf(friend.username);
      if (!friendProfile) {
        throw new Error(`Profile not found for user '${friend.username}'.`);
      }
      friendListWithProfiles.push(friendProfile);
    }

    return friendListWithProfiles;
  } catch (error) {
    console.error("Error getting friend list with profiles:", error);
    throw error;
  }
}

async function getProfileOf(username) {
  try {
    const db = await getDb();
    const userCollection = db.collection("users");
    const userProfileCollection = db.collection("user_profile");

    const user = await userCollection.findOne({ username: username });
    const userProfile = await userProfileCollection.findOne({ _id: user._id });
    if (userProfile){
      let photoPath;
      if (userProfile.photo==='')
        photoPath = `./assets/images/profile/img1.webp`;
      else
        photoPath = `./assets/images/profile/${userProfile.photo}`;
        return {
          photo: photoPath,
          username: user.username,
          elo: userProfile.elo
      };
    }
    else {
      return null;
  }

    
  } catch (error) {
    console.error("Error getting friend list:", error);
    throw error;
  }
}

async function getProfileOf(username) {
  try {
    const db = await getDb();
    const userCollection = db.collection("users");
    const userProfileCollection = db.collection("user_profile");

    const user = await userCollection.findOne({ username: username });
    const userProfile = await userProfileCollection.findOne({ _id: user._id });
    if (userProfile){
      let photoPath;
      if (user.photo!=='')
        photoPath = `back/ressources/img1.webp`;
      else
        photoPath = `back/ressources/${user.photo}`;
      return {
        photo: photoPath,
        username: user.username,
        elo: userProfile.elo
      };
    }
    else {
      return null;
    }


  } catch (error) {
    console.error("Error getting friend list:", error);
    throw error;
  }
}

async function getProfileByUserId(userId) {
  const username = await getUserById(userId);
  const profile =  await getProfileOf(username);
  return profile;

}


async function getUserById(userId) {
  try {
    const db = await getDb();
    const collection = db.collection("users");

    const objectIdUserId = new ObjectId(userId);
    const userDocument = await collection.findOne({ _id: objectIdUserId });

    if (!userDocument) {
      console.log("No user found for the provided username:", username);
      return null;
    }

    return userDocument.username;
  } catch (error) {
    console.error("An error occurred while loading username:", error);
    return null;
  }
}

async function getIdOfUser(username) {
  try {
    const db = getDb();
    const collection = db.collection("users");
    const userDocument = await collection.findOne({ username });

    if (!userDocument) {
      console.log("No user found for the provided username:", username);
      return null;
    }

    return userDocument._id.toString();
  } catch (error) {
    console.error("An error occurred while loading user ID:", error);
    return null;
  }
}

module.exports = { connect, getDb, saveGameState, loadGameState, userExists,areFriends, getFriendList, getProfileOf,getIdOfUser, getUserById, getProfileByUserId};
