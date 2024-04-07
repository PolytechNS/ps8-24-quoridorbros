const achievements = {
    ach1: {
        description: "Have 1 friend",
        progression: 0,
        out: 1
    },
    ach2: {
        description: "Have 10 friends",
        progression: 0,
        out: 10
    },
    ach3: {
        description: "Place a wall",
        progression: 0,
        out: 1
    },
    ach4: {
        description: "Place all wall",
        progression: 0,
        out: 10
    },
    ach5: {
        description: "Win a game",
        progression: 0,
        out: 1
    },
    ach6: {
        description: "Lose a game",
        progression: 0,
        out: 1
    }
}

class AchievementsManager {

    static async initializeAchievements(userProfileCollection,userId, achievements) {
        try {
            await userProfileCollection.updateOne(
                { _id: userId },
                { $set: { achievements: achievements } }
            );
            console.log("Achievements initialized for user with ID:", userId);
        } catch (error) {
            console.error("Error initializing achievements:", error);
        }
    }

    static async updateAchievement(userProfileCollection, userId, achievementId) {
        try {
            const userProfile = await userProfileCollection.findOne({ _id: userId });
            if (!userProfile) {
                console.error("User profile not found");
                return null;
            }
    
            const achievement = userProfile.achievements[achievementId];
            if (!achievement) {
                console.error("Achievement not found for this user");
                return null;
            }
    
            const currentProgression = achievement.progression || 0;
            if (currentProgression < achievement.out) {
                const updatedProgression = currentProgression + 1;
                await userProfileCollection.updateOne(
                    { _id: userId },
                    { $set: { [`achievements.${achievementId}.progression`]: updatedProgression } }
                );
                console.log("Achievement updated for user with ID:", userId);
                return updatedProgression;
            } else {
                console.log("Achievement is already complete, skipping update.");
                return currentProgression;
            }
        } catch (error) {
            console.error("Error updating achievement:", error);
            return null;
        }
    }
    
    

    static async getAchievements(userProfileCollection,userId) {
        try {
            const userProfile = await userProfileCollection.findOne({ _id: userId });
            return userProfile.achievements;
        } catch (error) {
            console.error("Error getting achievements:", error);
            return null;
        }
    }

    static async reinitializeAchievement(userProfileCollection, userId, achievementId) {
        try {
            const userProfile = await userProfileCollection.findOne({ _id: userId });
            if (!userProfile) {
                console.error("User profile not found");
                return null;
            }
    
            const achievement = userProfile.achievements[achievementId];
            if (!achievement) {
                console.error("Achievement not found for this user");
                return null;
            }
            if (achievement.progression === achievement.out) {
                await userProfileCollection.updateOne(
                    { _id: userId },
                    { $set: { [`achievements.${achievementId}.progression`]: 0 } }
                );
                console.log("Achievement reinitialized for user with ID:", userId);
                return 0;
            } else {
                console.log("Achievement is not completed, skipping reinitialization.");
                return null;
            }
        } catch (error) {
            console.error("Error reinitializing achievement:", error);
            return null;
        }
    }
    

    static async updateAchievementsList(userProfileCollection, userId) {
        try {
            const userProfile = await userProfileCollection.findOne({ _id: userId });
            if (!userProfile) {
                console.error("User profile not found");
                return null;
            }
    
            const existingAchievements = userProfile.achievements || {};
            const updatedAchievements = { ...existingAchievements };
    
            for (const achievementId in achievements) {
                if (!existingAchievements.hasOwnProperty(achievementId)) {
                    updatedAchievements[achievementId] = {description: achievements[achievementId].description, progression: 0,out: achievements[achievementId].out };
                }
            }
            await userProfileCollection.updateOne(
                { _id: userId },
                { $set: { achievements: updatedAchievements } }
            );
            console.log("Achievements list updated for user with ID:", userId);
            return updatedAchievements;
        } catch (error) {
            console.error("Error updating achievements list:", error);
            return null;
        }
    }
    
    
}

exports.AchievementsManager = AchievementsManager;

