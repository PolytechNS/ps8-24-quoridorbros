const { GameManagerFactory } = require("../gameManagers/gameManagerFactory.js");
const { SocketMapper } = require("../../socket/socketMapper.js");
class RoomManager {
  static io;
  static rooms = [];

  static initialize(ioInstance) {
    RoomManager.io = ioInstance;
  }

  static enterMatchmaking(userId) {
    try {
      if (RoomManager.playerAlreadyInARoom(userId)) {
        console.log("the player is already in a room");
        return;
      }

      const availableRooms = RoomManager.getAvailableRooms();
      if (availableRooms.length === 0) {
        RoomManager.createRoomAndJoin(userId);
      } else {
        const availableRoom = availableRooms[0];
        availableRoom.add_player(userId);
        availableRoom.createSocketRoom();
        availableRoom.initGame();
      }
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

      RoomManager.removePlayerFromRoom(existingRoom.name, userId);
    } catch (error) {
      console.error("An error occurred while quitting matchmaking:", error);
    }
  }

  static findPlayerRoom(userId) {
    return RoomManager.rooms.find((room) => room.players.includes(userId));
  }

  static getAvailableRooms() {
    return RoomManager.rooms.filter((value) => value.isAvailable());
  }

  static playerAlreadyInARoom(userId) {
    const playerRoom = RoomManager.findPlayerRoom(userId);
    return playerRoom ? true : false;
  }

  static createRoomAndJoin(userId) {
    let newRoom = new Room(userId);
    newRoom.add_player(userId);
    RoomManager.rooms.push(newRoom);

    console.log(SocketMapper.toString());
  }

  static removePlayerFromRoom(userId) {
    const room = RoomManager.findPlayerRoom(userId);
    if (!room) {
      console.log(
          "the player cannot be removed from the room since he is not in a room"
      );
      return;
    }
    room.removePlayer(socketId);
    if (room.players.length === 0) {
      RoomManager.rooms = RoomManager.rooms.filter((room) => {
        return !room.players.includes(userId);
      });
    }
  }

  static findAvaiableRoom() {
    for (const room of RoomManager.rooms) {
      if (room.isAvailable()) return room;
    }
    return null;
  }
}

class Room {
  constructor(userId) {
    this.roomId = this.generateRoomId(userId);
    this.players = [];
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

  isAvailable() {
    return this.players.length < 2;
  }

  initGame() {
    const oneVOneOnlineGameManager =
        GameManagerFactory.createOneVOneOnlineGameManager(
            RoomManager.io,
            this.roomId,
            this.players[0],
            this.players[1]
        );
  }

  createSocketRoom() {
    this.players.forEach((playerId) => {
      const socket = SocketMapper.getSocketById(playerId);
      socket.join(this.roomId);
      SocketMapper.removeSocketById(playerId);
    });
    RoomManager.io.to(this.roomId).emit("RoomFull");
  }
}

exports.RoomManager = RoomManager;
