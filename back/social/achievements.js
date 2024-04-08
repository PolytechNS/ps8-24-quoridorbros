const achievements = {
    ach1: {
        id:'ach1',
        description: "Have 1 friend",
        progression: 0,
        out: 1,
        notify: false
    },
    ach2: {
        id:'ach2',
        description: "Have 10 friends",
        progression: 0,
        out: 10,
        notify: false
    },
    ach3: {
        id:'ach3',
        description: "Place a wall",
        progression: 0,
        out: 1,
        notify: false
    },
    ach4: {
        id:'ach4',
        description: "Place all wall",
        progression: 0,
        out: 10,
        notify: false
    },
    ach5: {
        id:'ach5',
        description: "Win a game",
        progression: 0,
        out: 1,
        notify: false
    },
    ach6: {
        id:'ach6',
        description: "Lose a game",
        progression: 0,
        out: 1,
        notify: false
    }
}

class AchievementsManager {

    static async initializeAchievements(userProfileCollection,userId, achievements) {
        try {
            await userProfileCollection.updateOne(
                { _id: userId },
                { $set: { achievements: achievements } }
            );
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
                return updatedProgression;
            } else {
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
    
            if (achievement.progression < achievement.out) {
                await userProfileCollection.updateOne(
                    { _id: userId },
                    { $set: { [`achievements.${achievementId}.progression`]: 0 } }
                );
                return 0;
            } else {
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
                    updatedAchievements[achievementId] = {id: achievements[achievementId].id,description: achievements[achievementId].description, progression: 0,out: achievements[achievementId].out, notify: achievements[achievementId].notify};
                }
            }
            await userProfileCollection.updateOne(
                { _id: userId },
                { $set: { achievements: updatedAchievements } }
            );
            return updatedAchievements;
        } catch (error) {
            console.error("Error updating achievements list:", error);
            return null;
        }
    }

    static async getNotifiedAchievements(userProfileCollection,notificationsCollection, userId) {
        try {
            const userProfile = await userProfileCollection.findOne({ _id: userId._id });
            if (!userProfile) {
                console.error("User profile not found");
                return null;
            }
    
            const achievements = userProfile.achievements || {};
            const notifiedAchievements = [];
    
            for (const achievementId in achievements) {
                const achievement = achievements[achievementId];
                if (achievement.progression === achievement.out && !achievement.notify) {
                    notifiedAchievements.push(achievement);
                }
            }
            console.log(userId.username);
            console.log(notifiedAchievements);
            for (const achievement of notifiedAchievements) {
                const existingNotification = await notificationsCollection.findOne({ 
                    user_id: userId.username,
                    'notifications.type': 'achievement',
                    message: `Congratulations! You have completed the achievement: ${achievement.description}` });
                    console.log(existingNotification);

                    const currentDateTime = new Date();
                    const notificationId = `ac_${currentDateTime.getTime()}`;
    
                    if (!existingNotification) {
                        await notificationsCollection.updateOne(
                            { user_id: userId.username },
                            { 
                              $push: {
                                notifications: {
                                  $each: [{ _id: notificationId,type: 'achievement',message: `Congratulations! You have completed the achievement: ${achievement.description}`,
                                  sender: 'SYSTEM', readed: false }],
                                  $slice: -50
                                }
                              }
                            },
                            { upsert: true }
                          );
                          await userProfileCollection.updateOne(
                            { _id: userId._id },
                            { $set: { [`achievements.${achievement.id}.notify`]: true } }
                        );
                        
                    }
            }
            return notifiedAchievements;
        } catch (error) {
            console.error("Error getting notified achievements:", error);
            return null;
        }
    }
    
    
}

exports.AchievementsManager = AchievementsManager;

