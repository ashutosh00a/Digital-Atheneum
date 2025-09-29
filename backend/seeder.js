import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './models/userModel.js';
import Book from './models/Book.js';
import Review from './models/reviewModel.js';
import Comment from './models/commentModel.js';
import Notification from './models/notificationModel.js';
import Chat from './models/chatModel.js';

import users from './data/users.js';
import books from './data/books.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    console.log('Starting data import...');
    console.log('MongoDB URI:', process.env.MONGO_URI);
    console.log('Number of books to import:', books.length);
    console.log('Number of users to import:', users.length);

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Book.deleteMany();
    await Review.deleteMany();
    await Comment.deleteMany();
    await Notification.deleteMany();
    await Chat.deleteMany();

    // Import users
    console.log('Importing users...');
    const createdUsers = await User.insertMany(users);
    console.log('Users imported:', createdUsers.length);
    const adminUser = createdUsers[0]._id;
    console.log('Admin user ID:', adminUser);

    // Add admin user to books
    console.log('Preparing books data...');
    const sampleBooks = books.map(book => {
      return { ...book, user: adminUser };
    });

    // Import books
    console.log('Importing books...');
    const createdBooks = await Book.insertMany(sampleBooks);
    console.log('Books imported:', createdBooks.length);

    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error('Error during import:'.red);
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    // Clear all data
    await User.deleteMany();
    await Book.deleteMany();
    await Review.deleteMany();
    await Comment.deleteMany();
    await Notification.deleteMany();
    await Chat.deleteMany();

    console.log('Data Destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 