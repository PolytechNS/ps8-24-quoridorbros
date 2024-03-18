const { getIdOfUser } = require("../mongoDB/mongoManager.js");
class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
  }

  enterMatchmaking(socketId, playerToken) {
    try {
      const availableRoom = Array.from(this.rooms.values()).find(room => room.isAvaible() && !room.isOnGame(playerToken));
  
      if (availableRoom) {
        availableRoom.add_player(socketId, playerToken);
        const player1 = availableRoom.players[0];
        const player2 = availableRoom.players[1];
        this.io.to(player1.playersocket).emit('RoomFull', {
          roomName: availableRoom.name,
          opponentName: player2.playertoken.user
        });
        this.io.to(player2.playersocket).emit('RoomFull', {
          roomName: availableRoom.name,
          opponentName: player1.playertoken.user
        });
      } else {
        const existingRoom = this.findPlayerRoom(playerToken);
        if (existingRoom) {
          const player1 = existingRoom.players[0];
          const player2 = existingRoom.players[1];
          this.io.to(player1.playersocket).emit('RoomFull', {
            roomName: existingRoom.name,
            opponentName: player2.playerToken
          });
          this.io.to(player2.playersocket).emit('RoomFull', {
            roomName: existingRoom.name,
            opponentName: player1.playerToken
          });
        } else {
          this.createRoomAndJoin(socketId, playerToken);
        }
      }
    } catch (error) {
      console.error("An error occurred while entering matchmaking:", error);
      // Handle the error as needed
    }
  }

    quitMatchmaking(socketId, playerToken) {
      try {
        const existingRoom = this.findPlayerRoom(playerToken);
        if (existingRoom) {
          this.removePlayerFromRoom(existingRoom.name, socketId);
          this.io.to(socketId).emit('quitMatchmaking');
        }
      } catch (error) {
        console.error("An error occurred while quitting matchmaking:", error);
      }
    }


  findPlayerRoom(playerToken) {
    return Array.from(this.rooms.values()).find(room => room.isOnGame(playerToken));
  }

  createRoomAndJoin(socketId, playerToken) {
    let newRoom = new Room(playerToken);
    newRoom.add_player(socketId,playerToken);
    this.rooms.set(newRoom.name,newRoom);
    this.io.to(socketId).emit('joinedRoom', newRoom.name);
  }

  removePlayerFromRoom(roomName, socketId) {
    const room = this.rooms.get(roomName);
    if (room) {
      room.removePlayer(socketId);
      if (room.players.length === 0) {
        this.rooms.delete(roomName); // Remove the room if it becomes empty
      }
    }
  }

  findAvaiableRoom(playerToken){
    this.rooms.forEach(room => {
      if (!room.isOnGame(playerToken)&&room.isAvaible())
        return room;
    });
    return null;
  }
}

class Room {
  constructor(playerToken){
    this.name=this.generate_name(playerToken),
    this.players=[]
  }

  generate_name(playerToken){
    return "Room-"+Math.floor(Math.random() * 1000)+"-"+playerToken.user;
  }

  add_player(socket,token){
    if (this.players.length<2)
      this.players.push({playertoken:token,playersocket:socket});
  }

  removePlayer(socketId) {
    this.players = this.players.filter(player => player.playersocket !== socketId);
  }

  isAvaible(){
    return this.players.length<2;
  }

  isOnGame(playerToken){
    this.players.forEach(player => {
      if (player.playertoken==playerToken)
        return true;
    });
    return false;
  }


}

exports.RoomManager = RoomManager;
