// notificationService.js
const admin = require('./firebase');
const User = require('./models/User');
const mongoose = require('mongoose');

/**
 * Enhanced push notification service with advanced features
 */
class NotificationService {
  /**
   * Send a push notification to a single user
   * @param {string} userId - The recipient user ID
   * @param {string} message - The notification message
   * @param {Object} options - Additional notification options
   * @returns {Promise<Object>} - The notification result
   */
  static async sendPushNotification(userId, message, options = {}) {
    try {
      // Default options
      const defaultOptions = {
        title: 'New Activity',
        type: 'general',
        priority: 'high',
        icon: 'notification_icon',
        clickAction: 'MAIN_ACTIVITY',
        data: {}
      };

      // Merge with provided options
      const notificationOptions = { ...defaultOptions, ...options };
      
      // Convert string userId to ObjectId if needed
      const userIdObj = typeof userId === 'string' ? 
        mongoose.Types.ObjectId(userId) : userId;
      
      // Find user and check notification preferences
      const user = await User.findById(userIdObj);
      
      if (!user) {
        console.log(`User not found: ${userId}`);
        return { success: false, error: 'User not found' };
      }
      
      // Check if user wants this type of notification
      if (user.notificationPreferences) {
        const prefType = notificationOptions.type;
        if (prefType in user.notificationPreferences && 
            user.notificationPreferences[prefType] === false) {
          console.log(`User ${userId} has disabled ${prefType} notifications`);
          return { 
            success: false, 
            skipped: true, 
            reason: 'Notification type disabled by user'
          };
        }
      }
      
      // Check if user has FCM tokens
      if (!user.fcmTokens || user.fcmTokens.length === 0) {
        console.log(`No FCM tokens found for user: ${userId}`);
        return { success: false, error: 'No FCM tokens available' };
      }
      
      // Extract tokens
      const tokens = user.fcmTokens.map(t => t.token);
      
      // Prepare notification payload
      const payload = {
        notification: {
          title: notificationOptions.title,
          body: message,
          icon: notificationOptions.icon,
          click_action: notificationOptions.clickAction,
          sound: 'default'
        },
        data: {
          ...notificationOptions.data,
          type: notificationOptions.type,
          timestamp: Date.now().toString()
        }
      };
      
      // Set notification priority
      const options = {
        priority: notificationOptions.priority,
        timeToLive: 60 * 60 * 24 // 24 hours
      };
      
      // Send to multiple devices if user has multiple tokens
      let result;
      if (tokens.length === 1) {
        // Send to single device
        result = await admin.messaging().sendToDevice(tokens[0], payload, options);
      } else {
        // Send to multiple devices
        result = await admin.messaging().sendToDevice(tokens, payload, options);
      }
      
      // Log successful deliveries and failed tokens
      const successCount = result.successCount;
      const failureCount = result.failureCount;
      
      // Handle failed tokens
      if (failureCount > 0) {
        const failedTokens = [];
        
        result.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        
        // Remove failed tokens if they have permanent errors
        if (failedTokens.length > 0) {
          user.fcmTokens = user.fcmTokens.filter(t => !failedTokens.includes(t.token));
          await user.save();
          console.log(`Removed ${failedTokens.length} invalid FCM tokens`);
        }
      }
      
      // Update notification count for user
      user.notificationCount = (user.notificationCount || 0) + 1;
      await user.save();
      
      return { 
        success: true, 
        successCount, 
        failureCount
      };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Send a notification to multiple users
   * @param {Array<string>} userIds - Array of user IDs
   * @param {string} message - The notification message
   * @param {Object} options - Additional notification options
   * @returns {Promise<Object>} - The batch notification results
   */
  static async sendBatchNotifications(userIds, message, options = {}) {
    try {
      // Filter out duplicate IDs
      const uniqueUserIds = [...new Set(userIds)];
      
      // Find all users with their tokens
      const users = await User.find({ 
        _id: { $in: uniqueUserIds },
        'fcmTokens.0': { $exists: true } // Only users with at least one token
      });
      
      if (users.length === 0) {
        return { success: false, error: 'No users with valid tokens found' };
      }
      
      // Get all tokens while respecting notification preferences
      const tokensMap = new Map(); // userId -> tokens[]
      const prefType = options.type || 'general';
      
      users.forEach(user => {
        // Skip if user has disabled this notification type
        if (user.notificationPreferences && 
            prefType in user.notificationPreferences && 
            user.notificationPreferences[prefType] === false) {
          return;
        }
        
        // Add tokens for this user
        const userTokens = user.fcmTokens.map(t => t.token);
        tokensMap.set(user._id.toString(), userTokens);
      });
      
      // Prepare the notification payload
      const payload = {
        notification: {
          title: options.title || 'New Activity',
          body: message,
          icon: options.icon || 'notification_icon',
          click_action: options.clickAction || 'MAIN_ACTIVITY',
          sound: 'default'
        },
        data: {
          ...options.data,
          type: options.type || 'general',
          timestamp: Date.now().toString()
        }
      };
      
      // Send notifications in batches of 500 (FCM limit)
      const allTokens = Array.from(tokensMap.values()).flat();
      const batchSize = 500;
      const batches = [];
      
      for (let i = 0; i < allTokens.length; i += batchSize) {
        const batch = allTokens.slice(i, i + batchSize);
        batches.push(batch);
      }
      
      // Send each batch
      const results = await Promise.all(
        batches.map(tokenBatch => 
          admin.messaging().sendMulticast({
            tokens: tokenBatch,
            ...payload
          })
        )
      );
      
      // Aggregate results
      const successCount = results.reduce((sum, r) => sum + r.successCount, 0);
      const failureCount = results.reduce((sum, r) => sum + r.failureCount, 0);
      
      // Update notification counts for all users
      await User.updateMany(
        { _id: { $in: uniqueUserIds } },
        { $inc: { notificationCount: 1 } }
      );
      
      return {
        success: true,
        totalUsers: users.length,
        totalDevices: allTokens.length,
        successCount,
        failureCount
      };
    } catch (error) {
      console.error('Error sending batch notifications:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Send a notification to all users in a group
   * @param {string} groupId - The group ID
   * @param {string} message - The notification message
   * @param {Object} options - Additional notification options
   * @returns {Promise<Object>} - The notification result
   */
  static async sendGroupNotification(groupId, message, options = {}) {
    try {
      // Get group from database
      const Group = mongoose.model('Group');
      const group = await Group.findById(groupId);
      
      if (!group) {
        return { success: false, error: 'Group not found' };
      }
      
      // Get member IDs
      const memberIds = group.members.map(id => id.toString());
      
      // Add group info to notification data
      const groupOptions = {
        ...options,
        data: {
          ...options.data,
          groupId: groupId.toString(),
          groupName: group.name
        },
        type: 'groupActivity'
      };
      
      // Send to all members
      return await this.sendBatchNotifications(memberIds, message, groupOptions);
    } catch (error) {
      console.error('Error sending group notification:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Send a notification about a discussion
   * @param {string} discussionId - The discussion ID
   * @param {string} message - The notification message
   * @param {Object} options - Additional notification options
   * @returns {Promise<Object>} - The notification result
   */
  static async sendDiscussionNotification(discussionId, message, options = {}) {
    try {
      // Get discussion details
      const Discussion = mongoose.model('Discussion');
      const discussion = await Discussion
        .findById(discussionId)
        .populate('group', 'name members');
      
      if (!discussion) {
        return { success: false, error: 'Discussion not found' };
      }
      
      // Get group members excluding the actor (if provided)
      const memberIds = discussion.group.members
        .map(id => id.toString())
        .filter(id => id !== options.actorId); // Exclude the user who performed the action
      
      // Add discussion info to notification data
      const discussionOptions = {
        ...options,
        data: {
          ...options.data,
          discussionId: discussionId.toString(),
          groupId: discussion.group._id.toString(),
          groupName: discussion.group.name
        },
        type: options.type || 'discussion'
      };
      
      // Send to all members
      return await this.sendBatchNotifications(memberIds, message, discussionOptions);
    } catch (error) {
      console.error('Error sending discussion notification:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = NotificationService;