const {
  OneVOneOnlineGameManager,
} = require("../logic/gameManagers/OneVOneOnlineGameManager.js");
const { SocketMapper } = require("../socket/socketMapper.js");
const { SocketSender } = require("../socket/socketSender.js");

class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Array();
  }

  enterMatchmaking(userId) {
    try {
      if (this.playerAlreadyInARoom(userId)) {
        console.log("the player is already in a room");
        return;
      }

      const availableRooms = this.getAvailableRooms();
      if (availableRooms.length === 0) {
        this.createRoomAndJoin(userId);
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

  quitMatchmaking(userId) {
    try {
      const existingRoom = this.findPlayerRoom(userId);
      if (!existingRoom) {
        console.log("the player was not in a room");
        return;
      }

      this.removePlayerFromRoom(existingRoom.name, userId);
      SocketSender.sendMessage(userId, "quitMatchmaking");
    } catch (error) {
      console.error("An error occurred while quitting matchmaking:", error);
    }
  }

  findPlayerRoom(userId) {
    return this.rooms.find((room) => room.players.includes(userId));
  }

  getAvailableRooms() {
    return this.rooms.filter((value) => value.isAvailable());
  }

  playerAlreadyInARoom(userId) {
    const playerRoom = this.findPlayerRoom(userId);
    return playerRoom ? true : false;
  }

  createRoomAndJoin(userId) {
    let newRoom = new Room(userId, this.io);
    newRoom.add_player(userId);
    this.rooms.push(newRoom);

    console.log(SocketMapper.toString());
    SocketSender.sendMessage(userId, "joinedRoom");
  }

  removePlayerFromRoom(userId) {
    const room = this.findPlayerRoom(userId);
    if (!room) {
      console.log(
        "the player cannot be removed from the room since he is not in a room"
      );
      return;
    }
    room.removePlayer(socketId);
    if (room.players.length === 0) {
      this.rooms = this.rooms.filter((room) => {
        return !room.players.includes(userId);
      });
    }
  }

  findAvaiableRoom() {
    this.rooms.forEach((room) => {
      if (room.isAvailable()) return room;
    });
    return null;
  }
}

class Room {
  constructor(userId, io) {
    this.io = io;
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
    new OneVOneOnlineGameManager(
      this.io,
      this.roomId,
      this.players[0],
      this.players[1]
    );
  }

  createSocketRoom() {
    this.players.forEach((playerId) => {
      const socket = SocketMapper.getSocketById(playerId);
      socket.join(this.roomId);
    });
    this.io.to(this.roomId).emit("RoomFull");
  }
}

exports.RoomManager = RoomManager;
