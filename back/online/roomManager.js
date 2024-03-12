class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
  }

  matchmaking(socketId, playerToken) {
    console.log("matchmaking");
    const availableRoom = Array.from(this.rooms.values()).find(room => room.players.size < 2 && !room.players.has(playerToken));
    console.log(this.rooms);

    if (availableRoom) {
      availableRoom.players.add(playerToken);
      this.io.to(availableRoom.name).emit('roomUpdate', Array.from(availableRoom.players));
      this.io.to(socketId).emit('joinedRoom', availableRoom.name);
      console.log(availableRoom.name + "full with ");
      console.log(availableRoom.players);
    } else {
      this.createRoomAndJoin(socketId, playerToken);
    }
  }

  createRoomAndJoin(socketId, playerToken) {
    console.log("createRoomAndJoin");
    const newRoomName = `Room-${Math.floor(Math.random() * 1000)}`;
    const newRoom = { name: newRoomName, players: new Set([playerToken]) };
    this.rooms.set(newRoomName, newRoom);
    this.io.to(socketId).emit('joinedRoom', newRoomName);
  }
}

class Room {
  constructor(playerToken){
    this.name=this.generate_name(),
    this.players=[]
  }

  generate_name(){
    return "Room-"+Math.floor(Math.random() * 1000)+"-"+playerToken.token;
  }

  add_player(playerToken){
    if (this.players.length<2)
      this.players.push(playerToken);
  }


}

exports.RoomManager = RoomManager;
