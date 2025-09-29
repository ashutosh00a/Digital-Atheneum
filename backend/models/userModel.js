import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Password validation regex patterns
const passwordValidation = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/
};

const validatePassword = function(password) {
  if (password.length < passwordValidation.minLength) {
    return false;
  }
  
  if (!passwordValidation.hasUppercase.test(password)) {
    return false;
  }
  
  if (!passwordValidation.hasLowercase.test(password)) {
    return false;
  }
  
  if (!passwordValidation.hasNumber.test(password)) {
    return false;
  }
  
  if (!passwordValidation.hasSpecial.test(password)) {
    return false;
  }
  
  return true;
};

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
    address: {
      street: {
        type: String,
        default: '',
      },
      city: {
        type: String,
        default: '',
      },
      state: {
        type: String,
        default: '',
      },
      country: {
        type: String,
        default: '',
      },
      zipCode: {
        type: String,
        default: '',
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      fontSize: {
        type: Number,
        default: 16,
        min: 12,
        max: 24,
      },
      lineHeight: {
        type: Number,
        default: 1.5,
        min: 1,
        max: 2,
      },
      fontFamily: {
        type: String,
        default: 'Arial',
        enum: ['Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Helvetica'],
      },
      readingView: {
        type: String,
        enum: ['single', 'double', 'continuous'],
        default: 'single',
      },
      autoSave: {
        type: Boolean,
        default: true,
      },
      autoSaveInterval: {
        type: Number,
        default: 5,
        enum: [1, 5, 10, 15],
      },
      readingHistory: {
        type: Boolean,
        default: true,
      },
    },
    readingHistory: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
        },
        lastPage: {
          type: Number,
          default: 1,
        },
        readCount: {
          type: Number,
          default: 0,
        },
        lastRead: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    bookmarks: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
        },
        page: {
          type: Number,
          required: true,
        },
        note: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;