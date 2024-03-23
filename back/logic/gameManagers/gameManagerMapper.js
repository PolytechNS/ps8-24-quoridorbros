class GameManagerMapper {
  static mapper = new Map();

  static updateGameManager(userId, gameManager) {
    if (userId === null) {
      console.log("User ID is null");
      return;
    }
    GameManagerMapper.mapper.set(userId, gameManager);
    this.toString();
  }

  static getGameManagerByUserId(userId) {
    return GameManagerMapper.mapper.get(userId);
  }

  static removeGameManagerByUserId(userId) {
    const success = GameManagerMapper.mapper.delete(userId);

    if (success) {
      console.log(`Game manager successfully removed for user ID ${userId}`);
    } else {
      console.error(`User ID ${userId} not found in the map.`);
    }
  }

  static toString() {
    console.log("GameManagerMapper contents:");
    this.mapper.forEach((value, key) => {
      console.log(`UserID: ${key}, GameManager: ${value}`);
    });
    console.log("\n");
  }
}

exports.GameManagerMapper = GameManagerMapper;
