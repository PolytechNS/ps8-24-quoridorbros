const { MongoClient, ObjectId } = require("mongodb");
const { AchievementsManager } = require("../social/achievements");

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

async function saveGameState(userId, gameState, level) {
  const save = {
    token: userId,
    game: gameState,
    level: level,
  };

  try {
    const db = getDb();
    const collection = db.collection("gameStates");
    await collection.updateOne(
      { token: userId },
      { $set: save },
      { upsert: true },
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
      return null;
    }
    return save;
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

    const user1Profile = await getUserProfileById(
      user1Document._id,
      userProfileCollection,
    );
    const user2Profile = await getUserProfileById(
      user2Document._id,
      userProfileCollection,
    );

    let areFriendsUser1 = false;
    user1Profile.friends.forEach((e) => {
      if (e.equals(user2Document._id)) areFriendsUser1 = true;
    });

    let areFriendsUser2 = false;
    user2Profile.friends.forEach((e) => {
      if (e.equals(user1Document._id)) areFriendsUser2 = true;
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
      return null;
    }

    const userProfile = await userProfileCollection.findOne({ _id: user._id });
    if (!userProfile) {
      throw new Error(`User profile not found for user '${username}'.`);
      return null;
    }

    const friends = await userCollection
      .find(
        { _id: { $in: userProfile.friends } },
        { projection: { _id: 0, username: 1 } },
      )
      .toArray();

    const friendListWithProfiles = [];
    await AchievementsManager.reinitializeAchievement(
      userProfileCollection,
      user._id,
      "ach1",
    );
    await AchievementsManager.reinitializeAchievement(
      userProfileCollection,
      user._id,
      "ach2",
    );
    for (const friend of friends) {
      const friendProfile = await getProfileOf(friend.username);
      await AchievementsManager.updateAchievement(
        userProfileCollection,
        user._id,
        "ach1",
      );
      await AchievementsManager.updateAchievement(
        userProfileCollection,
        user._id,
        "ach2",
      );
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
    if (user) {
      const userProfile = await userProfileCollection.findOne({ _id: user._id });
      let photoPath;
      if (userProfile.photo === "")
        photoPath = `./assets/images/profile/img1.webp`;
      else photoPath = `./assets/images/profile/${userProfile.photo}`;
      return {
        photo: photoPath,
        username: user.username,
        elo: userProfile.elo,
        achievements: userProfile.achievements,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting friend list:", error);
    throw error;
  }
}

async function getProfileByUserId(userId) {
  const username = await getUserById(userId);
  const profile = await getProfileOf(username);
  return profile;
}

async function getUserById(userId) {
  try {
    const db = await getDb();
    const collection = db.collection("users");

    const objectIdUserId = new ObjectId(userId);
    const userDocument = await collection.findOne({ _id: objectIdUserId });

    if (!userDocument) {
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
      return null;
    }

    return userDocument._id.toString();
  } catch (error) {
    console.error("An error occurred while loading user ID:", error);
    return null;
  }
}

async function saveElo(userId, newElo) {
  try {
    const db = await getDb();
    const collection = db.collection("user_profile");

    // Mettre à jour le rating Elo de l'utilisateur spécifié
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { elo: newElo } },
    );
  } catch (error) {
    console.error("Error updating Elo:", error);
    throw error;
  }
}

async function updateProfileImage(username, img) {
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

    const modif = await userProfileCollection.updateOne(
      { _id: user._id },
      { $set: { photo: img } },
    );
    return modif;
  } catch (error) {
    console.error("Error getting friend list with profiles:", error);
    throw error;
  }
}

async function getAllProfiles() {
  try {
    const db = await getDb();
    const userCollection = db.collection("users");
    const userProfileCollection = db.collection("user_profile");

    const users = await userCollection.find().toArray();
    const profiles = [];

    for (const user of users) {
      const userProfile = await userProfileCollection.findOne({
        _id: user._id,
      });
      if (userProfile) {
        let photoPath;
        if (userProfile.photo === "") {
          photoPath = `./assets/images/profile/img1.webp`;
        } else {
          photoPath = `./assets/images/profile/${userProfile.photo}`;
        }
        profiles.push({
          photo: photoPath,
          username: user.username,
          elo: userProfile.elo,
        });
      }
    }
    return profiles;
  } catch (error) {
    console.error("Error getting all profiles:", error);
    throw error;
  }
}

async function winAGameAchievement(userId){

  try {
    const db = await getDb();
    const userProfileCollection = db.collection("user_profile");

    const objectIdUserId = new ObjectId(userId);

    const user = await userProfileCollection.findOne({ _id: objectIdUserId });
    if (!user) {
      throw new Error(`User not found.`);
    }

    await AchievementsManager.updateAchievement(
      userProfileCollection,
      objectIdUserId,
      "ach5",
    );
    
  } catch (error) {
    console.error("Error Updating achievement:", error);
    throw error;
  }
}

async function loseAGameAchievement(userId){

  try {
    const db = await getDb();
    const userProfileCollection = db.collection("user_profile");

    const objectIdUserId = new ObjectId(userId);

    const user = await userProfileCollection.findOne({ _id: objectIdUserId });
    if (!user) {
      throw new Error(`User not found.`);
    }

    await AchievementsManager.updateAchievement(
      userProfileCollection,
      objectIdUserId,
      "ach6",
    );
    
  } catch (error) {
    console.error("Error Updating achievement:", error);
    throw error;
  }
}

async function placeAWallAchievement(userId,nbWalls){

  try {
    const db = await getDb();
    const userProfileCollection = db.collection("user_profile");

    const objectIdUserId = new ObjectId(userId);

    const user = await userProfileCollection.findOne({ _id: objectIdUserId });
    if (!user) {
      throw new Error(`User not found.`);
    }

    await AchievementsManager.reinitializeAchievement(
      userProfileCollection,
      objectIdUserId,
      "ach3",
    );

    for (let i=0; i<nbWalls; i++){
      await AchievementsManager.updateAchievement(
        userProfileCollection,
        objectIdUserId,
        "ach3",
      );

    }

    await AchievementsManager.reinitializeAchievement(
      userProfileCollection,
      objectIdUserId,
      "ach4",
    );

    for (let i=0; i<nbWalls; i++){
      await AchievementsManager.updateAchievement(
        userProfileCollection,
        objectIdUserId,
        "ach4",
      );

    }
    
  } catch (error) {
    console.error("Error Updating achievement:", error);
    throw error;
  }
}
async function sendMessage(senderId, receiverId, content) {
  try {
    const db = getDb();
    const collection = db.collection("messages");
    const message = {
      sender: senderId,
      receiver: receiverId,
      content: content,
      timestamp: new Date(),
      read: false, // Marquer le message comme non lu lors de l'envoi
    };
    await collection.insertOne(message);
    const allMessages = await collection.find().toArray();
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
}

async function getMessagesBetweenUsers(userId, otherUserId) {
  try {
    const db = getDb();
    const collection = db.collection("messages");

    // Récupère tous les messages échangés entre les deux utilisateurs
    const messages = await collection
      .find({
        $or: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId },
        ],
      })
      .toArray();

    // Marque les messages destinés à l'utilisateur actuel comme lus
    await collection.updateMany(
      { receiver: userId, sender: otherUserId, read: false },
      { $set: { read: true } },
    );

    // Récupérer les noms d'utilisateur à l'avance
    const [username1, username2] = await Promise.all([
      getUserById(userId),
      getUserById(otherUserId),
    ]);

    // Convertir les identifiants d'utilisateur en noms d'utilisateur
    const messagesWithUsernames = messages.map((message) => {
      if (message.sender == userId) {
        message.sender = username1;
        message.receiver = username2;
      } else {
        message.sender = username2;
        message.receiver = username1;
      }
      return message;
    });

    return messagesWithUsernames;
  } catch (error) {
    console.error("Error getting messages between users:", error);
    return [];
  }
}

async function getUnreadMessages(userId, otherUserId) {
  try {
    const db = getDb();
    const collection = db.collection("messages");

    const unreadMessages = await collection
      .find({
        receiver: userId,
        sender: otherUserId,
        read: false,
      })
      .toArray();

    // Marque les messages récupérés comme lus
    await collection.updateMany(
      { receiver: userId, sender: otherUserId, read: false },
      { $set: { read: true } }, // Marque les messages comme lus
    );

    // Récupérer les noms d'utilisateur à l'avance
    const [username1, username2] = await Promise.all([
      getUserById(userId),
      getUserById(otherUserId),
    ]);

    // Convertir les identifiants d'utilisateur en noms d'utilisateur
    const unreadMessagesWithUsernames = unreadMessages.map((message) => {
      message.sender = username2; // L'autre utilisateur est le sender
      message.receiver = username1;
      return message;
    });

    return unreadMessagesWithUsernames;
  } catch (error) {
    console.error("Error getting unread messages:", error);
    return [];
  }
}

async function hasUnreadMessages(userId, otherUserId) {
  try {
    const db = getDb();
    const collection = db.collection("messages");

    const unreadMessagesCount = await collection.countDocuments({
      receiver: userId,
      sender: otherUserId,
      read: false,
    });

    return unreadMessagesCount > 0;
  } catch (error) {
    console.error("Error checking unread messages:", error);
    return false;
  }
}

async function clearMessageCollection() {
  try {
    const db = getDb();
    const collection = db.collection("messages");

    // Supprimer tous les documents de la collection
    const deleteResult = await collection.deleteMany({});

    return deleteResult.deletedCount; // Retourne le nombre de documents supprimés
  } catch (error) {
    console.error("Error clearing message collection:", error);
    return 0; // Retourne 0 en cas d'erreur
  }
}
module.exports = {
  connect,
  getDb,
  saveGameState,
  loadGameState,
  userExists,
  areFriends,
  getFriendList,
  getProfileOf,
  getIdOfUser,
  updateProfileImage,
  getUserById,
  getProfileByUserId,
  getAllProfiles,
  saveElo,
  winAGameAchievement,
  loseAGameAchievement,
  sendMessage,
  getMessagesBetweenUsers,
  getUnreadMessages,
  hasUnreadMessages,
  placeAWallAchievement,
};
