import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Book from '../models/Book.js';
import User from '../models/userModel.js';
import Review from '../models/reviewModel.js';
import Comment from '../models/commentModel.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mauryavanshi0001:hDygcH6Zt7JKMToX@cluster0.0q62u4j.mongodb.net/book_recommender?retryWrites=true&w=majority';

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', MONGO_URI);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Connected Successfully');
  console.log('Connection state:', mongoose.connection.readyState);
  console.log('Database name:', mongoose.connection.name);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Generate random genres
const genres = [
  'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography',
  'Fantasy', 'Mystery', 'Romance', 'Philosophy', 'Science Fiction', 'Horror',
  'Thriller', 'Adventure', 'Children', 'Young Adult', 'Poetry', 'Drama',
  'Comedy', 'Satire', 'Mythology', 'Religion', 'Self-Help', 'Business',
  'Economics', 'Politics', 'Social Science', 'Education', 'Art', 'Music'
];

// Generate random languages
const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'
];

// Generate random publishers
const publishers = [
  'Penguin Books', 'HarperCollins', 'Random House', 'Simon & Schuster',
  'Macmillan', 'Hachette', 'Scholastic', 'Bloomsbury', 'Oxford University Press',
  'Cambridge University Press', 'Wiley', 'Pearson', 'McGraw-Hill', 'Cengage',
  'Springer', 'Elsevier', 'Wolters Kluwer', 'Sage', 'Routledge', 'Palgrave'
];

// Generate fake user data
const generateUsers = async (count) => {
  const users = [];
  const hashedPassword = await bcrypt.hash('password123', 10);

  for (let i = 0; i < count; i++) {
    const user = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: hashedPassword,
      role: faker.helpers.arrayElement(['user', 'admin']),
      isAdmin: faker.datatype.boolean(0.1),
      preferences: {
        emailNotifications: faker.datatype.boolean(),
        theme: faker.helpers.arrayElement(['light', 'dark']),
        fontSize: faker.number.int({ min: 12, max: 24 }),
        lineHeight: faker.number.float({ min: 1, max: 2, precision: 0.1 }),
        fontFamily: faker.helpers.arrayElement(['Arial', 'Times New Roman', 'Helvetica']),
        readingView: faker.helpers.arrayElement(['single', 'double']),
        autoSave: faker.datatype.boolean(),
        autoSaveInterval: faker.helpers.arrayElement([1, 5, 10, 15]),
        readingHistory: faker.datatype.boolean()
      },
      favorites: [],
      readingHistory: [],
      bookmarks: [],
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent()
    };
    users.push(user);
  }

  return users;
};

// Generate fake book data
const generateBooks = async (count, userIds) => {
  const books = [];
  const usedIsbns = new Set();

  for (let i = 0; i < count; i++) {
    // Generate unique ISBN
    let isbn;
    do {
      isbn = faker.number.int({ min: 1000000000000, max: 9999999999999 }).toString();
    } while (usedIsbns.has(isbn));
    usedIsbns.add(isbn);

    // Generate initial reviews for the book
    const numReviews = faker.number.int({ min: 0, max: 5 });
    const reviews = [];
    for (let j = 0; j < numReviews; j++) {
      reviews.push({
        name: faker.person.fullName(),
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.paragraph(),
        user: faker.helpers.arrayElement(userIds)
      });
    }

    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? Number((reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1))
      : 0;

    const book = {
      user: faker.helpers.arrayElement(userIds),
      title: faker.lorem.words(faker.number.int({ min: 2, max: 6 })),
      author: faker.person.fullName(),
      description: faker.lorem.paragraphs(faker.number.int({ min: 2, max: 5 })),
      genre: faker.helpers.arrayElements(genres, faker.number.int({ min: 1, max: 4 })),
      coverImage: faker.image.urlLoremFlickr({ category: 'book' }),
      pdfUrl: faker.internet.url() + '/book.pdf',
      totalPages: faker.number.int({ min: 100, max: 1000 }),
      isbn: isbn,
      publishedDate: faker.date.past({ years: 50 }),
      publisher: faker.helpers.arrayElement(publishers),
      bookLanguage: faker.helpers.arrayElement(languages),
      featured: faker.datatype.boolean(0.1),
      rating: avgRating,
      numReviews: reviews.length,
      tags: faker.helpers.arrayElements(genres, faker.number.int({ min: 1, max: 5 })),
      relatedBooks: [], // Will be populated after all books are created
      reviews: reviews,
      readCount: faker.number.int({ min: 0, max: 10000 }),
      verificationStatus: 'approved',
      verifiedBy: faker.helpers.arrayElement(userIds),
      verifiedAt: faker.date.recent(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent()
    };
    books.push(book);
  }

  return books;
};

// Generate fake reviews
const generateReviews = async (count, bookIds, userIds) => {
  const reviews = [];

  for (let i = 0; i < count; i++) {
    const review = {
      user: faker.helpers.arrayElement(userIds),
      book: faker.helpers.arrayElement(bookIds),
      rating: faker.number.int({ min: 1, max: 5 }),
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
      likes: [],
      isFeatured: faker.datatype.boolean(0.1),
      isHelpful: faker.number.int({ min: 0, max: 100 }),
      isNotHelpful: faker.number.int({ min: 0, max: 50 }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent()
    };
    reviews.push(review);
  }

  return reviews;
};

// Generate fake comments
const generateComments = async (count, reviewIds, userIds) => {
  const comments = [];

  for (let i = 0; i < count; i++) {
    const comment = {
      user: faker.helpers.arrayElement(userIds),
      content: faker.lorem.paragraph(),
      review: faker.helpers.arrayElement(reviewIds),
      likes: [],
      isEdited: faker.datatype.boolean(0.2),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent()
    };
    comments.push(comment);
  }

  return comments;
};

// Main function to generate and save all fake data
const generateFakeData = async () => {
  try {
    console.log('Starting data generation process...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Book.deleteMany({}),
      Review.deleteMany({}),
      Comment.deleteMany({})
    ]);
    console.log('Existing data cleared successfully');

    console.log('Generating users...');
    const users = await generateUsers(100);
    console.log(`${users.length} users generated`);
    const savedUsers = await User.insertMany(users);
    console.log(`${savedUsers.length} users saved to database`);
    const userIds = savedUsers.map(user => user._id);

    console.log('Generating books...');
    const books = await generateBooks(1000, userIds);
    console.log(`${books.length} books generated`);
    
    // Save books first to get their IDs
    const savedBooks = await Book.insertMany(books);
    console.log(`${savedBooks.length} books saved to database`);
    const bookIds = savedBooks.map(book => book._id);

    // Update related books
    console.log('Updating related books...');
    for (let i = 0; i < savedBooks.length; i++) {
      const book = savedBooks[i];
      const relatedCount = faker.number.int({ min: 0, max: 3 });
      const relatedBooks = faker.helpers.arrayElements(
        bookIds.filter(id => id.toString() !== book._id.toString()),
        relatedCount
      );
      
      await Book.findByIdAndUpdate(book._id, {
        relatedBooks: relatedBooks
      });
    }

    console.log('Generating standalone reviews...');
    const reviews = await generateReviews(5000, bookIds, userIds);
    console.log(`${reviews.length} reviews generated`);
    const savedReviews = await Review.insertMany(reviews);
    console.log(`${savedReviews.length} reviews saved to database`);
    const reviewIds = savedReviews.map(review => review._id);

    console.log('Generating comments...');
    const comments = await generateComments(10000, reviewIds, userIds);
    console.log(`${comments.length} comments generated`);
    await Comment.insertMany(comments);
    console.log(`${comments.length} comments saved to database`);

    console.log('Fake data generation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating fake data:', error);
    process.exit(1);
  }
};

// Run the script
generateFakeData(); 