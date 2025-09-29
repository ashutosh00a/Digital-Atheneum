import mongoose from 'mongoose';

const commentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
    },
    // Comment can be on a review or a book
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
    // Comment can be a reply to another comment
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for getting replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  justOne: false,
});

// Validate that comment is either on a review or a book, not both
commentSchema.pre('save', function (next) {
  if (this.review && this.book) {
    next(new Error('Comment can only be on a review or a book, not both'));
  } else if (!this.review && !this.book && !this.parentComment) {
    next(new Error('Comment must be on a review, book, or parent comment'));
  } else {
    next();
  }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment; 