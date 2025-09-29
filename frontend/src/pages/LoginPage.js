import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, InputGroup, Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../utils/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, userInfo } = useContext(AuthContext);

  // Get the redirect path from location state or default to home
  const redirect = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Only redirect if we have userInfo and we're not already on the redirect path
    if (userInfo && location.pathname === '/login' && !isRedirecting) {
      setIsRedirecting(true);
      navigate(redirect, { replace: true });
    }
  }, [navigate, userInfo, location.pathname, redirect, isRedirecting]);

  const submitHandler = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Submitting login form...', { email });
      
      // Add a small delay to ensure error messages are visible
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await login(email, password);
      
      if (!result.success) {
        console.error('Login failed:', result.message);
        setError(result.message);
        setLoading(false);
        return;
      }
      
      console.log('Login successful, redirecting...');
      // Navigation will be handled by the useEffect
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Set a more detailed error message
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'An unexpected error occurred. Please try again.';
      
      setError(errorMessage);
      setLoading(false);
      
      // Keep error visible for at least 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <Card className="login-card">
            <Card.Body>
              <h1 className="text-center mb-4">Sign In</h1>
              
              {error && (
                <Alert 
                  variant="danger" 
                  className="mb-3" 
                  onClose={() => setError(null)} 
                  dismissible
                  style={{ 
                    animation: 'fadeIn 0.3s ease-in',
                    fontSize: '1.1rem',
                    padding: '1rem'
                  }}
                >
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    <span>{error}</span>
                  </div>
                </Alert>
              )}
              
              <Form onSubmit={submitHandler}>
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
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={loading || isRedirecting}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form>

              <Row className="py-3">
                <Col>
                  New Customer?{' '}
                  <Link to="/register" state={{ from: location.state?.from }}>Register</Link>
                </Col>
                <Col className="text-end">
                  <Link to="/forgot-password">Forgot Password?</Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage; 