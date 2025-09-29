import mongoose from 'mongoose';

const moderationSettingsSchema = new mongoose.Schema(
  {
    autoModeration: {
      enabled: {
        type: Boolean,
        default: true,
      },
      spamThreshold: {
        type: Number,
        default: 3,
      },
      profanityFilter: {
        enabled: {
          type: Boolean,
          default: true,
        },
        customWords: [String],
      },
      contentFilter: {
        enabled: {
          type: Boolean,
          default: true,
        },
        minLength: {
          type: Number,
          default: 10,
        },
        maxLength: {
          type: Number,
          default: 1000,
        },
      },
    },
    reviewSettings: {
      requireApproval: {
        type: Boolean,
        default: false,
      },
      minRating: {
        type: Number,
        default: 1,
      },
      maxRating: {
        type: Number,
        default: 5,
      },
      minReviewLength: {
        type: Number,
        default: 50,
      },
      maxReviewLength: {
        type: Number,
        default: 2000,
      },
    },
    userSettings: {
      maxWarnings: {
        type: Number,
        default: 3,
      },
      warningExpiryDays: {
        type: Number,
        default: 30,
      },
      suspensionDuration: {
        type: Number,
        default: 7,
      },
      banThreshold: {
        type: Number,
        default: 3,
      },
    },
    notificationSettings: {
      notifyOnReport: {
        type: Boolean,
        default: true,
      },
      notifyOnWarning: {
        type: Boolean,
        default: true,
      },
      notifyOnSuspension: {
        type: Boolean,
        default: true,
      },
      notifyOnBan: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const ModerationSettings = mongoose.model('ModerationSettings', moderationSettingsSchema);

export default ModerationSettings; 