const { AiGameManager } = require("./aiGameManager.js");
const { GameManagerMapper } = require("./gameManagerMapper.js");
const { OneVOneOnlineGameManager } = require("./OneVOneOnlineGameManager.js");

class GameManagerFactory {
  static createAiGameManager(userId, loadGame = false) {
    const aiGameManager = new AiGameManager(userId, loadGame);
    GameManagerMapper.updateAiGameManager(userId, aiGameManager);
    return aiGameManager;
  }

  static createOneVOneOnlineGameManager(io, roomId, idClient1, idClient2) {
    const oneVOneOnlineGameManager = new OneVOneOnlineGameManager(
      io,
      roomId,
      idClient1,
      idClient2
    );
    GameManagerMapper.updateOnlineGameManager(
      idClient1,
      1,
      oneVOneOnlineGameManager
    );
    GameManagerMapper.updateOnlineGameManager(
      idClient2,
      2,
      oneVOneOnlineGameManager
    );

    return oneVOneOnlineGameManager;
  }
}

exports.GameManagerFactory = GameManagerFactory;