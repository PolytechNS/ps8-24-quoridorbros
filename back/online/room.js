class Matchmaking {
    constructor(io) {
      this.io = io;
      this.rooms = {};
    }
  
    matchmaking(playerToken) {
      const roomId = this.findAvailableRoom() || this.createRoom();
  
      this.addPlayerToRoom(playerToken, roomId);
      console.log(playerToken+` join `+roomId);
  
      this.checkRoomReady(roomId);
    }
  
    findAvailableRoom() {
      for (const [roomId, players] of Object.entries(this.rooms)) {
        if (players.length < 2) {
          return roomId;
        }
      }
      return null;
    }
    
    createRoom() {
      const roomId = `room_${Object.keys(this.rooms).length + 1}`;
      console.log(`New room`);
      this.rooms[roomId] = [];
      return roomId;
    }

    addPlayerToRoom(playerToken, roomId) {
      this.rooms[roomId].push(playerToken);
      this.io.to(playerToken).join(roomId);
    }
  
    checkRoomReady(roomId) {
      if (this.rooms[roomId].length === 2) {
        this.startGame(roomId);
      }
    }

    startGame(roomId) {
        console.log(roomId+" start a game");
        this.io.to(roomId).emit('startGame', { roomId });
    }
  }
  
  module.exports = Matchmaking;
  