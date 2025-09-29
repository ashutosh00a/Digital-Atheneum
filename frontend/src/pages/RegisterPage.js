import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, InputGroup, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../utils/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState({
    length: false,
    hasNumber: false,
    hasUpper: false,
    hasLower: false,
    hasSpecial: false
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { register, userInfo } = useContext(AuthContext);

  // Get the redirect path from location state or default to home
  const redirect = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Only redirect if we have userInfo and we're not already on the redirect path
    if (userInfo && location.pathname === '/register' && !isRedirecting) {
      setIsRedirecting(true);
      navigate(redirect, { replace: true });
    }
  }, [navigate, userInfo, location.pathname, redirect, isRedirecting]);

  // Check password strength whenever password changes
  useEffect(() => {
    validatePassword(password);
  }, [password]);

  const validatePassword = (password) => {
    const lengthValid = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const feedback = {
      length: lengthValid,
      hasNumber,
      hasUpper,
      hasLower,
      hasSpecial
    };
    
    setPasswordFeedback(feedback);
    
    // Calculate strength (0-100)
    const criteriaCount = Object.values(feedback).filter(Boolean).length;
    setPasswordStrength(criteriaCount * 20);
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'danger';
    if (passwordStrength < 80) return 'warning';
    return 'success';
  };

  const isPasswordValid = () => {
    return Object.values(passwordFeedback).every(Boolean);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid()) {
      setError('Password does not meet all requirements');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await register(name, email, password);
      
      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }
      
      // Navigation will be handled by the useEffect
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="py-5 col-md-6">
        <h1 className="text-center mb-4">Create Account</h1>
        
        {error && <Message variant="danger">{error}</Message>}
        {loading && <Loader />}
        
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="password" className="mb-3">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                isInvalid={password.length > 0 && !isPasswordValid()}
              />
              <Button
                variant="outline-secondary"
                onClick={togglePasswordVisibility}
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </Button>
            </InputGroup>
            
            {password.length > 0 && (
              <div className="mt-2">
                <ProgressBar 
                  now={passwordStrength} 
                  variant={getStrengthColor()} 
                  className="mb-2" 
                />
                <div className="password-requirements small">
                  <div className={passwordFeedback.length ? 'text-success' : 'text-danger'}>
                    <FontAwesomeIcon icon={passwordFeedback.length ? faCheck : faTimes} className="me-1" />
                    At least 8 characters
                  </div>
                  <div className={passwordFeedback.hasUpper ? 'text-success' : 'text-danger'}>
                    <FontAwesomeIcon icon={passwordFeedback.hasUpper ? faCheck : faTimes} className="me-1" />
                    At least one uppercase letter
                  </div>
                  <div className={passwordFeedback.hasLower ? 'text-success' : 'text-danger'}>
                    <FontAwesomeIcon icon={passwordFeedback.hasLower ? faCheck : faTimes} className="me-1" />
                    At least one lowercase letter
                  </div>
                  <div className={passwordFeedback.hasNumber ? 'text-success' : 'text-danger'}>
                    <FontAwesomeIcon icon={passwordFeedback.hasNumber ? faCheck : faTimes} className="me-1" />
                    At least one number
                  </div>
                  <div className={passwordFeedback.hasSpecial ? 'text-success' : 'text-danger'}>
                    <FontAwesomeIcon icon={passwordFeedback.hasSpecial ? faCheck : faTimes} className="me-1" />
                    At least one special character
                  </div>
                </div>
              </div>
            )}
          </Form.Group>

          <Form.Group controlId="confirmPassword" className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                isInvalid={confirmPassword.length > 0 && password !== confirmPassword}
              />
              <Button
                variant="outline-secondary"
                onClick={toggleConfirmPasswordVisibility}
                type="button"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </Button>
            </InputGroup>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Form.Text className="text-danger">
                Passwords do not match
              </Form.Text>
            )}
          </Form.Group>

          <div className="d-grid gap-2">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg"
              disabled={!isPasswordValid() || password !== confirmPassword || loading || isRedirecting}
            >
              Register
            </Button>
          </div>
        </Form>

        <Row className="py-3">
          <Col className="text-center">
            Already have an account? <Link to="/login" state={{ from: location.state?.from }}>Login</Link>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default RegisterPage; 