class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
  }

  matchmaking(socketId, playerToken) {
    console.log("matchmaking");
    const availableRoom = Array.from(this.rooms.values()).find(room => room.isAvaible() && !room.isOnGame(playerToken));
    console.log(this.rooms);

    if (availableRoom) {
      availableRoom.add_player(socketId,playerToken);
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
    let newRoom = new Room(playerToken);
    newRoom.add_player(socketId,playerToken);
    this.rooms.set(newRoom.name,newRoom);
    this.io.to(socketId).emit('joinedRoom', newRoom.name);
  }
}

class Room {
  constructor(playerToken){
    this.name=this.generate_name(playerToken),
    this.players=[]
  }

  generate_name(playerToken){
    return "Room-"+Math.floor(Math.random() * 1000)+"-"+playerToken.token;
  }

  add_player(socket,token){
    if (this.players.length<2)
      this.players.push({playertoken:token,playersocket:socket});
  }

  isAvaible(){
    return this.players.length<2;
  }

  isOnGame(playerToken){
    this.players.forEach(player => {
      if (player.playertoken===playerToken)
        return true;
    });
    return false;
  }


}

exports.RoomManager = RoomManager;
