import jwt from 'jsonwebtoken';

/**
 * Generate JWT tokens for user authentication
 * @param {string} id - User ID to encode in the token
 * @returns {Object} Object containing access and refresh tokens
 */
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h' // Changed from 15m to 24h
  });

  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '30d' // Changed from 7d to 30d
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 24 * 60 * 60 // 24 hours in seconds
  };
};

export default generateToken; 