const {
  getIdOfUser,
  getProfileByUserId,
} = require("../../mongoDB/mongoManager");
const { SocketMapper } = require("../../socket/socketMapper");
const { SocketSender } = require("../../socket/socketSender");
const { RoomManager } = require("./roomManager");

class ChallengeManager {
  static challenges = {};

  static async acceptChallenge(challengerUserId) {
    const challenge = this.findChallengeByChallengerUserId(challengerUserId);
    if (challenge) {
      delete this.challenges[challenge.challengedUserId];
      console.log(
        `Challenge from ${challenge.challengerUserId} accepted by ${challenge.challengedUserId}.`,
      );
      RoomManager.challengeAccepted(
        challenge.challengerUserId,
        challenge.challengedUserId,
      );
    } else {
      console.log(`No challenge found for challenger ID ${challengerUserId}.`);
    }
  }

  static async declineChallenge(challengerUserId) {
    const challenge = this.findChallengeByChallengerUserId(challengerUserId);
    if (challenge) {
      delete this.challenges[challenge.challengedUserId];
      const challengedUserId = challenge.challengedUserId;
      console.log(
        `Challenge from ${challenge.challengerUserId} declined by ${challengedUserId}.`,
      );
      SocketSender.sendMessage(challenge.challengerUserId, "challengeDeclined");
    } else {
      console.log(`No challenge found with challenger ID ${challengerUserId}.`);
    }
  }

  static async cancelChallenge(challengerUserId) {
    console.log("challengerUserId", challengerUserId);
    console.log("challenges", this.challenges);

    const challenge = this.findChallengeByChallengerUserId(challengerUserId);
    if (challenge) {
      delete this.challenges[challenge.challengedUserId];
      const challengedUserId = challenge.challengedUserId;
      console.log(
        `Challenge to ${challengedUserId} cancelled by ${challengerUserId}.`,
      );
      SocketSender.sendMessage(challengedUserId, "removeChallenge");
    } else {
      console.log(
        `LOG : ERROR: Cancelled non existing challenge ${challengerUserId}.`,
      );
    }
  }

  static async addChallenge(challengerUserId, challengedUserId) {
    if (!this.challenges[challengedUserId]) {
      this.challenges[challengedUserId] = {
        challengerUserId,
        challengedUserId,
      };
      console.log(
        `Challenge sent to user with ID ${challengedUserId} from user with ID ${challengerUserId}.`,
      );
    } else {
      console.log(
        `User with ID ${challengedUserId} already has a pending challenge.`,
      );
      await this.declineChallenge(challengedUserId);
    }
  }

  static async sendChallenge(challengedUsername, challengerUserId) {
    const challengedUserId = await getIdOfUser(challengedUsername);
    const challengerProfile = await getProfileByUserId(challengerUserId);
    await this.addChallenge(challengerUserId, challengedUserId);
    console.log(this.challenges);
    SocketSender.sendMessage(
      challengedUserId,
      "receiveChallenge",
      challengerProfile,
    );
  }

  static findChallengeByChallengerUserId(challengerUserId) {
    return Object.values(this.challenges).find(
      (challenge) => challenge.challengerUserId === challengerUserId,
    );
  }

  static findChallengeByChallengedUserId(challengedUserId) {
    return this.challenges[challengedUserId];
  }
}

exports.ChallengeManager = ChallengeManager;
