const { GameManagerFactory } = require("../gameManagers/gameManagerFactory.js");
const { SocketMapper } = require("../../socket/socketMapper.js");
const {
  getProfileOf,
  getUserById,
  getProfileByUserId,
} = require("../../mongoDB/mongoManager.js");
const { SocketSender } = require("../../socket/socketSender");

class RoomManager {
  static players = [];
  static actionInprogress = false;

  static async enterMatchmaking(userId) {
    //console.log("enterMatchmaking", userId);
    if (RoomManager.playerAlreadyWaiting(userId)) {
      console.log("the player is already in a room");
      return;
    }
    const userProfile = await getProfileByUserId(userId);
    let player = { userId, userProfile, deltaElo: 100 };
    RoomManager.players.push(player);
    this.findMatch(player);
  }

  static quitMatchmaking(userId) {
    const player = RoomManager.findPlayer(userId);
    if (!this.playerAlreadyWaiting(userId)) {
      console.log("the player was not in matchmaking");
      return;
    }
    RoomManager.removePlayer(userId);
  }

  static findPlayer(userId) {
    return RoomManager.players.find((player) => player.userId === userId);
  }

  static playerAlreadyWaiting(userId) {
    const player = RoomManager.findPlayer(userId);
    return !!player;
  }

  static async findMatch(player) {
    await this.waitIfActionInProgress();

    this.actionInprogress = true;

    //si le joueur a trouvé un opponent
    if (!this.playerAlreadyWaiting(player.userId)) {
      this.actionInprogress = false;
      return;
    }

    const otherPlayer = RoomManager.players.find(
      (otherPlayer) =>
        Math.abs(otherPlayer.userProfile.elo - player.userProfile.elo) <=
          player.deltaElo && otherPlayer.userId !== player.userId,
    );

    if (!otherPlayer) {
      player.deltaElo *= 2;
      setTimeout(() => this.findMatch(player), 4000);
    } else {
      this.removePlayer(player.userId);
      this.removePlayer(otherPlayer.userId);
      await RoomManager.createRoom(
        player.userId,
        otherPlayer.userId,
        player.userProfile,
        otherPlayer.userProfile,
      );
    }

    this.actionInprogress = false;
  }

  static removePlayer(userId) {
    RoomManager.players = RoomManager.players.filter((player) => {
      return player.userId !== userId;
    });
  }

  static async waitIfActionInProgress() {
    while (this.actionInprogress) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  static async createRoom(userId1, userId2, userProfile1, userProfile2) {
    SocketSender.sendMessage(userId1, "RoomFull", userProfile2);
    SocketSender.sendMessage(userId2, "RoomFull", userProfile1);
    SocketMapper.removeSocketById(userId1);
    SocketMapper.removeSocketById(userId2);
    GameManagerFactory.createOneVOneOnlineGameManager(
      userId1,
      userId2,
      userProfile1.elo,
      userProfile2.elo,
    );
  }

  static async challengeAccepted(userId1, userId2) {
    const userProfile1 = await getProfileByUserId(userId1);
    const userProfile2 = await getProfileByUserId(userId2);
    SocketSender.sendMessage(userId1, "ChallengeBegin", userProfile2);
    SocketSender.sendMessage(userId2, "ChallengeBegin", userProfile1);
    SocketMapper.removeSocketById(userId1);
    SocketMapper.removeSocketById(userId2);
    GameManagerFactory.createOneVOneOnlineGameManager(
      userId1,
      userId2,
      userProfile1.elo,
      userProfile2.elo,
    );
  }
}

exports.RoomManager = RoomManager;
