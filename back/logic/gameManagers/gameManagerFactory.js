const { AiGameManager } = require("./aiGameManager.js");
const { OneVOneOnlineGameManager } = require("./OneVOneOnlineGameManager.js");

class GameManagerFactory {
  static aiGameManagers = [];
  static oneVOneOnlineGameManagers = [];

  static createAiGameManager(userId, loadGame = false) {
    const aiGameManager = new AiGameManager(userId, loadGame);
    this.aiGameManagers.push(aiGameManager);
    return aiGameManager;
  }

  static createOneVOneOnlineGameManager(io, roomId, idClient1, idClient2) {
    const oneVOneOnlineGameManager = new OneVOneOnlineGameManager(
      io,
      roomId,
      idClient1,
      idClient2
    );
    this.oneVOneOnlineGameManagers.push(oneVOneOnlineGameManager);
    return oneVOneOnlineGameManager;
  }

  static getAiGameManager(userId) {
    return this.aiGameManagers.find((manager) => manager.userId === userId);
  }

  static getOneVOneOnlineGameManager(userId) {
    return this.oneVOneOnlineGameManagers.find(
      (manager) => manager.idClient1 === userId || manager.idClient2 === userId
    );
  }
}

exports.GameManagerFactory = GameManagerFactory;
