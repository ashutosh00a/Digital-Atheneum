import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'admin', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const chatSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [messageSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update lastUpdated when messages are added
chatSchema.pre('save', function (next) {
  if (this.isModified('messages')) {
    this.lastUpdated = Date.now();
  }
  next();
});

// Create index for efficient querying
chatSchema.index({ user: 1, isActive: 1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat; 