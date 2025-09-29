import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Image, ListGroup, Badge, Tab, Nav, Alert, Table, Modal } from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import BookCard from '../components/BookCard';
import ThemeContext from '../utils/ThemeContext';
import FavoritesContext from '../utils/FavoritesContext';
import AuthContext from '../utils/AuthContext';
import axios from 'axios';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Auth verification states
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showDeviceRemoveModal, setShowDeviceRemoveModal] = useState(false);
  const [deviceToRemove, setDeviceToRemove] = useState(null);
  
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { favorites, loading: favoritesLoading, removeFromFavorites } = useContext(FavoritesContext);
  const { 
    currentUser, 
    isEmailVerified, 
    is2FAEnabled, 
    deviceList,
    sendEmailVerification, 
    verifyEmail, 
    enable2FA, 
    disable2FA, 
    verify2FA,
    updatePassword: updateUserPassword, 
    removeDevice 
  } = useContext(AuthContext);
  
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;
  
  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // For now, use data from localStorage
        setName(userInfo.name || '');
        setEmail(userInfo.email || '');
        setProfileImage(userInfo.profileImage || 'https://via.placeholder.com/150');
        
        // Set address if available in localStorage
        if (userInfo.address) {
          setAddress(userInfo.address);
        }
        
        setLoading(false);
        
        // Calculate profile completion percentage
        calculateProfileCompletion();
      } catch (error) {
        setError('Failed to load profile data');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate, userInfo]);
  
  // Calculate profile completion
  const calculateProfileCompletion = () => {
    let completedFields = 0;
    let totalFields = 7; // name, email, profile image, and 4 address fields
    
    if (name) completedFields++;
    if (email) completedFields++;
    if (profileImage && profileImage !== 'https://via.placeholder.com/150') completedFields++;
    if (address.street) completedFields++;
    if (address.city) completedFields++;
    if (address.state) completedFields++;
    if (address.zipCode) completedFields++;
    if (address.country) completedFields++;
    
    const percentage = Math.floor((completedFields / totalFields) * 100);
    setCompletionPercentage(percentage);
  };
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setUpdateError('Passwords do not match');
      return;
    }
    
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      
      if (currentPassword && newPassword) {
        // Update password
        const result = await updateUserPassword(currentPassword, newPassword);
        if (!result.success) {
          setUpdateError(result.message);
          setUpdateLoading(false);
          return;
        }
      }
      
      // Update localStorage with new user info
      const updatedUser = { 
        ...userInfo, 
        name, 
        email, 
        profileImage,
        address
      };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
      setSuccessMessage('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setUpdateLoading(false);
      
      // Recalculate profile completion
      calculateProfileCompletion();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      setUpdateError('Failed to update profile');
      setUpdateLoading(false);
    }
  };
  
  const handleRemoveFromFavorites = (bookId) => {
    try {
      removeFromFavorites(bookId);
    } catch (error) {
      setError('Failed to remove book from favorites');
    }
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUpdateLoading(true);
        setUpdateError(null);

        const formData = new FormData();
        formData.append('profilePicture', file);
        formData.append('name', name);
        formData.append('email', email);

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.put('/api/users/profile', formData, config);

        // Update localStorage with new user info
        const updatedUser = { ...userInfo, ...data };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));

        setProfileImage(data.profilePicture);
        setSuccessMessage('Profile picture updated successfully');
        setUpdateLoading(false);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } catch (error) {
        setUpdateError(error.response?.data?.message || 'Failed to update profile picture');
        setUpdateLoading(false);
      }
    }
  };
  
  // Email verification handlers
  const handleSendVerification = async () => {
    const result = await sendEmailVerification();
    if (result.success) {
      setShowVerificationModal(true);
      setSuccessMessage(result.message);
    } else {
      setError(result.message);
    }
  };
  
  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      setError('Please enter verification code');
      return;
    }
    
    const result = await verifyEmail(verificationCode);
    if (result.success) {
      setShowVerificationModal(false);
      setSuccessMessage(result.message);
      setVerificationCode('');
    } else {
      setError(result.message);
    }
  };
  
  // 2FA handlers
  const handleToggle2FA = async () => {
    if (!is2FAEnabled) {
      // Enable 2FA
      const result = await enable2FA();
      if (result.success) {
        setSuccessMessage(result.message);
        setShowTwoFactorModal(true);
      } else {
        setError(result.message);
      }
    } else {
      // Disable 2FA
      setShowTwoFactorModal(true);
    }
  };
  
  const handleVerify2FA = async () => {
    if (!twoFactorCode) {
      setError('Please enter verification code');
      return;
    }
    
    const result = await verify2FA(twoFactorCode);
    if (result.success) {
      if (is2FAEnabled) {
        // Disable 2FA after verification
        const disableResult = await disable2FA();
        if (disableResult.success) {
          setSuccessMessage('Two-factor authentication disabled');
        } else {
          setError(disableResult.message);
        }
      } else {
        setSuccessMessage('Two-factor authentication enabled');
      }
      
      setShowTwoFactorModal(false);
      setTwoFactorCode('');
    } else {
      setError(result.message);
    }
  };
  
  // Device management handlers
  const handleRemoveDeviceClick = (device) => {
    setDeviceToRemove(device);
    setShowDeviceRemoveModal(true);
  };
  
  const handleRemoveDevice = async () => {
    if (!deviceToRemove) return;
    
    const result = await removeDevice(deviceToRemove.id);
    if (result.success) {
      setSuccessMessage(result.message);
    } else {
      setError(result.message);
    }
    
    setShowDeviceRemoveModal(false);
    setDeviceToRemove(null);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  return (
    <div className={`profile-page ${theme === 'dark' ? 'profile-dark' : 'profile-light'}`}>
      <h1 className="mb-4">My Profile</h1>
      
      {error && <Message variant="danger">{error}</Message>}
      {successMessage && <Message variant="success">{successMessage}</Message>}
      
      {loading ? (
        <Loader />
      ) : (
        <Row>
          <Col lg={3} md={4} className="mb-4">
            <Card className="profile-sidebar">
              <Card.Body className="text-center">
                <div className="profile-image-container mb-3">
                  <Image 
                    src={profileImage} 
                    roundedCircle 
                    className="profile-image" 
                    alt={name}
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                  <div className="profile-image-edit">
                    <label htmlFor="profile-image-upload" className="btn btn-sm btn-primary">
                      <i className="fas fa-camera"></i>
                    </label>
                    <input 
                      type="file" 
                      id="profile-image-upload" 
                      className="d-none" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
                <h3>{name}</h3>
                <p className="text-muted">{email}</p>
                
                <div className="profile-completion mb-3">
                  <p className="mb-1">Profile Completion: {completionPercentage}%</p>
                  <div className="progress">
                    <div 
                      className={`progress-bar ${getProfileCompletionClass(completionPercentage)}`} 
                      role="progressbar" 
                      style={{ width: `${completionPercentage}%` }} 
                      aria-valuenow={completionPercentage} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
                
                <div className="security-status mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Email Verification</span>
                    {isEmailVerified ? (
                      <Badge bg="success">Verified</Badge>
                    ) : (
                      <Badge bg="warning">Not Verified</Badge>
                    )}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Two-Factor Auth</span>
                    {is2FAEnabled ? (
                      <Badge bg="success">Enabled</Badge>
                    ) : (
                      <Badge bg="danger">Disabled</Badge>
                    )}
                  </div>
                </div>
                
                <div className="profile-stats">
                  <Row>
                    <Col xs={6}>
                      <div className="stat-item">
                        <h4>{favorites.length}</h4>
                        <p>Favorites</p>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="stat-item">
                        <h4>{deviceList?.length || 0}</h4>
                        <p>Devices</p>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={9} md={8}>
            <Tab.Container id="profile-tabs" defaultActiveKey="info">
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="info">Personal Info</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="security">Security</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="devices">Devices</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="favorites">
                    Favorites <Badge bg="primary">{favorites.length}</Badge>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              
              <Tab.Content>
                <Tab.Pane eventKey="info">
                  <Card className="mb-4">
                    <Card.Body>
                      {updateError && <Message variant="danger">{updateError}</Message>}
                      
                      <Form onSubmit={submitHandler}>
                        <Row>
                          <Col md={6}>
                            <h4 className="mb-3">Account Information</h4>
                            <Form.Group controlId="name" className="mb-3">
                              <Form.Label>Name</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                              />
                            </Form.Group>
                            
                            <Form.Group controlId="email" className="mb-3">
                              <Form.Label>Email Address</Form.Label>
                              <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          
                          <Col md={6}>
                            <h4 className="mb-3">Address Information</h4>
                            <Form.Group controlId="street" className="mb-3">
                              <Form.Label>Street Address</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter street address"
                                value={address.street}
                                onChange={(e) => setAddress({...address, street: e.target.value})}
                              />
                            </Form.Group>
                            
                            <Form.Group controlId="city" className="mb-3">
                              <Form.Label>City</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter city"
                                value={address.city}
                                onChange={(e) => setAddress({...address, city: e.target.value})}
                              />
                            </Form.Group>
                            
                            <Row>
                              <Col md={6}>
                                <Form.Group controlId="state" className="mb-3">
                                  <Form.Label>State/Province</Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder="Enter state"
                                    value={address.state}
                                    onChange={(e) => setAddress({...address, state: e.target.value})}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group controlId="zipCode" className="mb-3">
                                  <Form.Label>Postal/Zip Code</Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder="Enter zip code"
                                    value={address.zipCode}
                                    onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            
                            <Form.Group controlId="country" className="mb-3">
                              <Form.Label>Country</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter country"
                                value={address.country}
                                onChange={(e) => setAddress({...address, country: e.target.value})}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <div className="d-flex justify-content-end mt-3">
                          <Button type="submit" variant="primary" disabled={updateLoading}>
                            {updateLoading ? 'Updating...' : 'Update Profile'}
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                
                <Tab.Pane eventKey="security">
                  <Card className="mb-4">
                    <Card.Header as="h5">Security Settings</Card.Header>
                    <Card.Body>
                      <div className="security-section mb-4">
                        <h5>Email Verification</h5>
                        <p className="text-muted">Verify your email to enhance account security</p>
                        
                        <div className="d-flex align-items-center">
                          {isEmailVerified ? (
                            <div>
                              <Badge bg="success" className="me-2">Verified</Badge>
                              <span>Your email address has been verified</span>
                            </div>
                          ) : (
                            <div className="d-flex flex-column">
                              <div>
                                <Badge bg="warning" className="me-2">Not Verified</Badge>
                                <span>Your email address is not verified</span>
                              </div>
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="mt-2"
                                onClick={handleSendVerification}
                              >
                                <i className="fas fa-envelope me-1"></i> Send Verification Email
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <hr />
                      
                      <div className="security-section mb-4">
                        <h5>Two-Factor Authentication</h5>
                        <p className="text-muted">Add an extra layer of security to your account</p>
                        
                        <div className="d-flex align-items-center">
                          {is2FAEnabled ? (
                            <div className="d-flex flex-column">
                              <div>
                                <Badge bg="success" className="me-2">Enabled</Badge>
                                <span>Two-factor authentication is enabled</span>
                              </div>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                className="mt-2"
                                onClick={handleToggle2FA}
                              >
                                <i className="fas fa-lock-open me-1"></i> Disable 2FA
                              </Button>
                            </div>
                          ) : (
                            <div className="d-flex flex-column">
                              <div>
                                <Badge bg="danger" className="me-2">Disabled</Badge>
                                <span>Two-factor authentication is not enabled</span>
                              </div>
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                className="mt-2"
                                onClick={handleToggle2FA}
                              >
                                <i className="fas fa-lock me-1"></i> Enable 2FA
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <hr />
                      
                      <div className="security-section">
                        <h5>Change Password</h5>
                        <p className="text-muted">Update your password to maintain account security</p>
                        
                        <Form className="mt-3">
                          <Form.Group controlId="currentPassword" className="mb-3">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control
                              type="password"
                              placeholder="Enter current password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                          </Form.Group>
                          
                          <Form.Group controlId="newPassword" className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                              type="password"
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </Form.Group>
                          
                          <Form.Group controlId="confirmPassword" className="mb-3">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                              type="password"
                              placeholder="Confirm new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                          </Form.Group>
                          
                          <Button 
                            variant="primary" 
                            onClick={submitHandler}
                            disabled={!currentPassword || !newPassword || !confirmPassword}
                          >
                            Update Password
                          </Button>
                        </Form>
                      </div>
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                
                <Tab.Pane eventKey="devices">
                  <Card>
                    <Card.Header as="h5">Logged In Devices</Card.Header>
                    <Card.Body>
                      <p className="text-muted mb-3">View and manage devices currently logged into your account</p>
                      
                      {deviceList && deviceList.length > 0 ? (
                        <Table responsive striped hover className="devices-table">
                          <thead>
                            <tr>
                              <th>Device</th>
                              <th>Browser</th>
                              <th>OS</th>
                              <th>Last Activity</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {deviceList.map((device) => (
                              <tr key={device.id} className={device.isCurrent ? 'current-device' : ''}>
                                <td>{device.name}</td>
                                <td>{device.browser}</td>
                                <td>{device.os}</td>
                                <td>{formatDate(device.lastLogin)}</td>
                                <td>
                                  {device.isCurrent ? (
                                    <Badge bg="success">Current</Badge>
                                  ) : (
                                    <Badge bg="secondary">Active</Badge>
                                  )}
                                </td>
                                <td>
                                  {!device.isCurrent && (
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleRemoveDeviceClick(device)}
                                    >
                                      <i className="fas fa-trash-alt"></i>
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <Message>No devices found</Message>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                
                <Tab.Pane eventKey="favorites">
                  <Card>
                    <Card.Body>
                      <h4 className="mb-4">My Favorite Books</h4>
                      
                      {favoritesLoading ? (
                        <Loader />
                      ) : favorites.length === 0 ? (
                        <Message>You have no favorite books yet</Message>
                      ) : (
                        <Row>
                          {favorites.map(book => (
                            <Col xl={4} md={6} key={book._id} className="mb-4">
                              <Card className="h-100 favorite-book-card">
                                <div className="favorite-book-actions">
                                  <Button 
                                    variant="danger" 
                                    size="sm" 
                                    className="remove-favorite" 
                                    onClick={() => handleRemoveFromFavorites(book._id)}
                                  >
                                    <i className="fas fa-heart-broken"></i>
                                  </Button>
                                </div>
                                <Row className="g-0">
                                  <Col xs={4}>
                                    <Card.Img 
                                      src={book.coverImage} 
                                      alt={book.title} 
                                      className="h-100"
                                      style={{ objectFit: 'cover' }}
                                    />
                                  </Col>
                                  <Col xs={8}>
                                    <Card.Body>
                                      <Card.Title as="h5">{book.title}</Card.Title>
                                      <Card.Subtitle className="mb-2 text-muted">
                                        {book.author}
                                      </Card.Subtitle>
                                      <div className="d-flex align-items-center mb-2">
                                        <div className="rating me-2">
                                          {Array.from({ length: 5 }).map((_, index) => (
                                            <span key={index}>
                                              <i className={
                                                index + 1 <= Math.floor(book.rating)
                                                  ? 'fas fa-star'
                                                  : index + 0.5 < book.rating
                                                  ? 'fas fa-star-half-alt'
                                                  : 'far fa-star'
                                              }></i>
                                            </span>
                                          ))}
                                        </div>
                                        <span>{book.rating}</span>
                                      </div>
                                      <Badge bg="secondary" className="mb-2">
                                        {book.category}
                                      </Badge>
                                      <div className="mt-2">
                                        <Button 
                                          variant="primary" 
                                          size="sm" 
                                          onClick={() => navigate(`/book/${book._id}`)}
                                          className="me-2"
                                        >
                                          View
                                        </Button>
                                        <Button 
                                          variant="outline-primary" 
                                          size="sm"
                                          onClick={() => navigate(`/book/${book._id}/read`)}
                                        >
                                          Read
                                        </Button>
                                      </div>
                                    </Card.Body>
                                  </Col>
                                </Row>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
        </Row>
      )}
      
      {/* Email Verification Modal */}
      <Modal show={showVerificationModal} onHide={() => setShowVerificationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Verify Your Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>We've sent a verification code to your email address. Please enter the code below:</p>
          <Form.Group controlId="verificationCode" className="mb-3">
            <Form.Control
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <Form.Text className="text-muted">
              Check your email inbox for the verification code. For demo purposes, check the console for the code.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerificationModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleVerifyEmail}>
            Verify
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* 2FA Modal */}
      <Modal show={showTwoFactorModal} onHide={() => setShowTwoFactorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{is2FAEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {is2FAEnabled ? (
            <p>Please enter your 2FA code to disable two-factor authentication:</p>
          ) : (
            <>
              <p>Two-factor authentication adds an extra layer of security to your account.</p>
              <p>For demo purposes, enter any 6-digit code:</p>
            </>
          )}
          <Form.Group controlId="twoFactorCode" className="mb-3">
            <Form.Control
              type="text"
              placeholder="Enter 6-digit code"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              maxLength={6}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTwoFactorModal(false)}>
            Cancel
          </Button>
          <Button variant={is2FAEnabled ? 'danger' : 'success'} onClick={handleVerify2FA}>
            {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Remove Device Modal */}
      <Modal show={showDeviceRemoveModal} onHide={() => setShowDeviceRemoveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Remove Device</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to remove this device from your account?</p>
          {deviceToRemove && (
            <div className="device-details">
              <p><strong>Device:</strong> {deviceToRemove.name}</p>
              <p><strong>Browser:</strong> {deviceToRemove.browser}</p>
              <p><strong>Last Active:</strong> {formatDate(deviceToRemove.lastLogin)}</p>
            </div>
          )}
          <p className="text-danger mt-3">This will log out the user on this device.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeviceRemoveModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRemoveDevice}>
            Remove Device
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Helper function to get profile completion class
const getProfileCompletionClass = (percentage) => {
  if (percentage < 40) return 'bg-danger';
  if (percentage < 70) return 'bg-warning';
  return 'bg-success';
};

export default ProfilePage; 