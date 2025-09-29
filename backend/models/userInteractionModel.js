import mongoose from 'mongoose';

const userInteractionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    bookId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    coverUrl: {
      type: String,
    },
    interactionType: {
      type: String,
      enum: ['view', 'favorite', 'read', 'review'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'removed'],
      default: 'active',
    },
    metadata: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: String,
      progress: Number, // For reading progress (0-100)
      lastReadAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
userInteractionSchema.index({ user: 1, bookId: 1, interactionType: 1 });

const UserInteraction = mongoose.model('UserInteraction', userInteractionSchema);

export default UserInteraction; 