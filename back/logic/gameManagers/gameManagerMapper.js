class GameManagerMapper {
  static aiGameManagerMap = new Map();
  static onlineGameManagerMap = new Map();

  static updateAiGameManager(userId, gameManager) {
    if (userId === null) {
      console.log("User ID is null");
      return;
    }
    GameManagerMapper.aiGameManagerMap.set(userId, gameManager);
    this.toString();
  }

  static updateOnlineGameManager(userId, playerNumber, gameManager) {
    if (userId === null) {
      console.log("User ID is null");
      return;
    }
    GameManagerMapper.onlineGameManagerMap.set(userId, {
      playerNumber,
      gameManager,
    });
    //this.toString();
  }

  static getAiGameManagerByUserId(userId) {
    return GameManagerMapper.aiGameManagerMap.get(userId);
  }

  static getOnlineGameInfoByUserId(userId) {
    return GameManagerMapper.onlineGameManagerMap.get(userId);
  }

  static removeAiGameManagerByUserId(userId) {
    const success = GameManagerMapper.aiGameManagerMap.delete(userId);
    if (success) {
      console.log(`AI game manager successfully removed for user ID ${userId}`);
      this.toString();
    } else {
      console.error(`User ID ${userId} not found in the AI game manager map.`);
    }
  }

  static removeOnlineGameManagerByUserId(userId) {
    const success = GameManagerMapper.onlineGameManagerMap.delete(userId);
    if (success) {
      /*console.log(
        `Online game manager successfully removed for user ID ${userId}`
      );*/
      //this.toString();
    } else {
      console.error(
        `User ID ${userId} not found in the online game manager map.`
      );
    }
  }

  static toString() {
    console.log("AI GameManager Map contents:");
    this.aiGameManagerMap.forEach((value, key) => {
      console.log(`UserID: ${key}, GameManager: ${value}`);
    });
    console.log("\n");

    console.log("Online GameManager Map contents:");
    this.onlineGameManagerMap.forEach((value, key) => {
      console.log(
        `UserID: ${key}, PlayerNumber: ${value.playerNumber}, GameManager: ${value.gameManager}`
      );
    });
    console.log("\n");
  }
}

exports.GameManagerMapper = GameManagerMapper;
