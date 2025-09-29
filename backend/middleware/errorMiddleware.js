// Not Found Error Middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error for server-side debugging
  console.error(`Error: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Send response
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

const databaseError = (err, req, res, next) => {
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      message: 'Unable to connect to database. Please try again later or contact support.'
    });
  }
  next(err);
};

// Helper function to provide user-friendly error messages
const getFriendlyErrorMessage = (err, statusCode) => {
  // Database connection errors
  if (err.message && err.message.includes('ECONNREFUSED')) {
    return 'Unable to connect to database. Please try again later or contact support.';
  }
  
  // Authentication errors
  if (statusCode === 401) {
    return 'Authentication failed. Please check your credentials or try the test account.';
  }
  
  // Not found errors
  if (statusCode === 404) {
    return 'The requested resource was not found.';
  }
  
  // Validation errors
  if (statusCode === 400 && err.name === 'ValidationError') {
    return 'The information you provided is invalid. Please check your input and try again.';
  }
  
  // Server errors
  if (statusCode >= 500) {
    return 'Something went wrong on our end. Please try again later.';
  }
  
  return 'An error occurred. Please try again.';
};

export { notFound, errorHandler, databaseError }; 