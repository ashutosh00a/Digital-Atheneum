import React, { useContext } from 'react';
import ThemeContext from '../utils/ThemeContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useContext(ThemeContext);

  return (
    <footer className={`footer ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>Digital Athenaeum</h5>
            <p>Your digital book collection accessible anytime, anywhere.</p>
          </div>
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/">Home</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Register</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Connect With Us</h5>
            <div className="social-icons">
              <a href="#" className="me-3"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="me-3"><i className="fab fa-twitter"></i></a>
              <a href="#" className="me-3"><i className="fab fa-instagram"></i></a>
              <a href="#" className="me-3"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
        <hr className="mt-3" />
        <div className="text-center">
          <p className={theme === 'dark' ? 'text-light-muted' : 'text-muted'}>Copyright &copy; {currentYear} Digital Athenaeum. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 