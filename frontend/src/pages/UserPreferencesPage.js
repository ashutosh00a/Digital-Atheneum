import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import api from '../utils/api';
import { useSelector } from 'react-redux';

const UserPreferencesPage = () => {
  const { userInfo } = useSelector((state) => state.user);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    theme: 'light',
    readingHistory: true,
    fontSize: 16,
    lineHeight: 1.5,
    fontFamily: 'Arial',
    readingView: 'single',
    autoSave: true,
    autoSaveInterval: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const { data } = await api.get('/users/preferences');
        setPreferences(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching preferences');
      }
    };

    if (userInfo) {
      fetchPreferences();
    }
  }, [userInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.put('/users/preferences', preferences);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating preferences');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">User Preferences</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && (
        <Alert variant="success">Preferences updated successfully!</Alert>
      )}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <h4 className="mb-3">General Settings</h4>
                <Form.Group className="mb-3">
                  <Form.Label>Theme</Form.Label>
                  <Form.Select
                    name="theme"
                    value={preferences.theme}
                    onChange={handleChange}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    label="Enable Email Notifications"
                    checked={preferences.emailNotifications}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Receive notifications about new books, comments, and updates
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="readingHistory"
                    name="readingHistory"
                    label="Track Reading History"
                    checked={preferences.readingHistory}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Save your reading progress and history
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <h4 className="mb-3">Reading Settings</h4>
                <Form.Group className="mb-3">
                  <Form.Label>Font Size</Form.Label>
                  <Form.Range
                    name="fontSize"
                    min="12"
                    max="24"
                    value={preferences.fontSize}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Current size: {preferences.fontSize}px
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Line Height</Form.Label>
                  <Form.Range
                    name="lineHeight"
                    min="1"
                    max="2"
                    step="0.1"
                    value={preferences.lineHeight}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Current: {preferences.lineHeight}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Font Family</Form.Label>
                  <Form.Select
                    name="fontFamily"
                    value={preferences.fontFamily}
                    onChange={handleChange}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Helvetica">Helvetica</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Reading View</Form.Label>
                  <Form.Select
                    name="readingView"
                    value={preferences.readingView}
                    onChange={handleChange}
                  >
                    <option value="single">Single Page</option>
                    <option value="double">Double Page</option>
                    <option value="continuous">Continuous Scroll</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="autoSave"
                    name="autoSave"
                    label="Auto-save Reading Progress"
                    checked={preferences.autoSave}
                    onChange={handleChange}
                  />
                </Form.Group>

                {preferences.autoSave && (
                  <Form.Group className="mb-3">
                    <Form.Label>Auto-save Interval (minutes)</Form.Label>
                    <Form.Select
                      name="autoSaveInterval"
                      value={preferences.autoSaveInterval}
                      onChange={handleChange}
                    >
                      <option value="1">1 minute</option>
                      <option value="5">5 minutes</option>
                      <option value="10">10 minutes</option>
                      <option value="15">15 minutes</option>
                    </Form.Select>
                  </Form.Group>
                )}
              </Col>
            </Row>

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="mt-3"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserPreferencesPage; 