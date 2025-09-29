import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'admin',
    profileImage: '/images/users/admin.jpg',
    bio: 'BookClub administrator and avid reader with a passion for classic literature.',
    isActive: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'user',
    profileImage: '/images/users/john.jpg',
    bio: 'Mystery and thriller enthusiast who enjoys decoding complex plots.',
    isActive: true,
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'user',
    profileImage: '/images/users/jane.jpg',
    bio: 'Science fiction reader and aspiring author. Fascinated by futuristic concepts.',
    isActive: true,
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    password: bcrypt.hashSync('123456', 10),
    profileImage: '/images/users/bob.jpg',
    bio: 'History buff who loves historical fiction and biographies of world leaders.',
    isActive: true,
  },
  {
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    password: bcrypt.hashSync('123456', 10),
    profileImage: '/images/users/sarah.jpg',
    bio: 'Romance novel expert and book club organizer. Looking for reading buddies!',
    isActive: true,
  },
];

export default users; 