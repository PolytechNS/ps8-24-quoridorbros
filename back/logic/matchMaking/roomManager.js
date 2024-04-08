const { GameManagerFactory } = require("../gameManagers/gameManagerFactory.js");
const { SocketMapper } = require("../../socket/socketMapper.js");
const { getProfileOf, getUserById, getProfileByUserId } = require("../../mongoDB/mongoManager.js");
const {SocketSender} = require("../../socket/socketSender");

class RoomManager {
  static io;
  static rooms = [];

  static initialize(ioInstance) {
    RoomManager.io = ioInstance;
  }

  static async enterMatchmaking(userId) {
    console.log("enterMatchmaking", userId);
    try {
      if (RoomManager.playerAlreadyInARoom(userId)) {
        console.log("the player is already in a room");
        return;
      }
      await this.findRoom(userId);
    } catch (error) {
      console.error("An error occurred while entering matchmaking:", error);
      // Handle the error as needed
    }
  }

  static quitMatchmaking(userId) {
    try {
      const existingRoom = RoomManager.findPlayerRoom(userId);
      if (!existingRoom) {
        console.log("the player was not in a room");
        return;
      }

      RoomManager.removeRoom(existingRoom);
    } catch (error) {
      console.error("An error occurred while quitting matchmaking:", error);
    }
  }

  static findPlayerRoom(userId) {
    return RoomManager.rooms.find((room) => room.players.includes(userId));
  }

  static playerAlreadyInARoom(userId) {
    const playerRoom = RoomManager.findPlayerRoom(userId);
    return !!playerRoom;
  }

  static createRoomAndJoin(userId, userElo) {
    let newRoom = new Room(userId, userElo);
    RoomManager.rooms.push(newRoom);
  }

  static async findRoom(userId) {
    const userProfile = await getProfileByUserId(userId);
    const userElo = userProfile.elo;

    const room = RoomManager.rooms.find((room) =>
        Math.abs(room.elo - userElo) <= room.deltaElo
    );


    if(!room){
      this.createRoomAndJoin(userId, userElo);
      return;
    }
    room.add_player(userId);
    const userProfile1 = await getProfileByUserId(room.players[0]);
    const userProfile2 = await getProfileByUserId(room.players[1]);
    await room.createSocketRoom(userProfile1, userProfile2);
    room.initGame(userProfile1.elo, userProfile2.elo);
    RoomManager.removeRoom(room);

  }

  static removeRoom(room) {
    RoomManager.rooms = RoomManager.rooms.filter((element) => {
      return room.roomId !== element.roomId;
    });
  }
}

class Room {
  constructor(userId, userElo) {
    this.roomId = this.generateRoomId(userId);
    this.elo = userElo;
    this.deltaElo = 500;
    this.players = [];
    this.players.push(userId);
  }

  generateRoomId(userId) {
    return "Room-" + Math.floor(Math.random() * 1000) + "-" + userId;
  }

  add_player(userId) {
    if (this.players.length < 2) this.players.push(userId);
  }

  removePlayer(userId) {
    this.players = this.players.filter((playerId) => playerId !== userId);
  }


  initGame(eloPlayer1, eloPlayer2) {


      GameManagerFactory.createOneVOneOnlineGameManager(
            this.players[0],
            this.players[1],
            eloPlayer1,
            eloPlayer2
        );
  }

  async createSocketRoom(userProfile1, userProfile2) {
    SocketSender.sendMessage(this.players[0], "RoomFull", userProfile2);
    SocketSender.sendMessage(this.players[1], "RoomFull", userProfile1);
    SocketMapper.removeSocketById(this.players[0]);
    SocketMapper.removeSocketById(this.players[1]);


    //const profilePlayer1 = getProfileById()

  }
}

exports.RoomManager = RoomManager;
