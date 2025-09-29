import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Book description is required']
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  coverImage: {
    key: String,
    url: String
  },
  genre: [{
    type: String,
    required: [true, 'At least one genre is required']
  }],
  publicationYear: {
    type: Number,
    required: [true, 'Publication year is required']
  },
  publisher: {
    type: String,
    required: [true, 'Publisher name is required']
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    default: 'English'
  },
  pageCount: {
    type: Number,
    required: [true, 'Page count is required']
  },
  availability: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: 0,
    default: 0
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [reviewSchema],
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    readingLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    ageGroup: {
      type: String,
      enum: ['Children', 'Young Adult', 'Adult']
    },
    format: {
      type: String,
      enum: ['Hardcover', 'Paperback', 'E-Book', 'Audiobook']
    }
  },
  features: {
    hasIllustrations: {
      type: Boolean,
      default: false
    },
    isBestseller: {
      type: Boolean,
      default: false
    },
    isNewRelease: {
      type: Boolean,
      default: false
    }
  },
  relatedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for review count
bookSchema.virtual('reviewCount').get(function() {
  return this.reviews.length;
});

// Method to calculate average rating
bookSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
  } else {
    const total = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.ratings.average = total / this.reviews.length;
    this.ratings.count = this.reviews.length;
  }
  return this.save();
};

// Pre-save middleware to update average rating
bookSchema.pre('save', function(next) {
  this.calculateAverageRating();
  next();
});

// Index for search optimization
bookSchema.index({ 
  title: 'text', 
  author: 'text', 
  description: 'text',
  genre: 'text',
  tags: 'text'
});

// Check if model exists before creating
const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

export default Book; 