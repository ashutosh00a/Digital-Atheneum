import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBookVerificationEmail = async (user, book, status, reason = '') => {
  const subject = `Book ${status === 'approved' ? 'Approved' : 'Rejected'}: ${book.title}`;
  const html = `
    <h1>Book ${status === 'approved' ? 'Approved' : 'Rejected'}</h1>
    <p>Dear ${user.name},</p>
    <p>Your book "${book.title}" has been ${status}.</p>
    ${status === 'rejected' ? `<p>Reason: ${reason}</p>` : ''}
    <p>Thank you for contributing to our library!</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject,
    html,
  });
};

export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Digital Athenaeum';
  const html = `
    <h1>Welcome to Digital Athenaeum!</h1>
    <p>Dear ${user.name},</p>
    <p>Thank you for joining our community of readers and contributors.</p>
    <p>You can now:</p>
    <ul>
      <li>Browse our collection of books</li>
      <li>Upload your own books</li>
      <li>Track your reading progress</li>
      <li>Connect with other readers</li>
    </ul>
    <p>Happy reading!</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject,
    html,
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const subject = 'Password Reset Request';
  const html = `
    <h1>Password Reset</h1>
    <p>Dear ${user.name},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}">Reset Password</a>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject,
    html,
  });
};

export const sendNewBookNotification = async (admin, book) => {
  const subject = 'New Book Pending Verification';
  const html = `
    <h1>New Book Pending Verification</h1>
    <p>Dear Admin,</p>
    <p>A new book "${book.title}" by ${book.author} has been uploaded and is pending verification.</p>
    <p>Please review it at your earliest convenience.</p>
    <a href="${process.env.FRONTEND_URL}/admin/verify-books">View Pending Books</a>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: admin.email,
    subject,
    html,
  });
}; 