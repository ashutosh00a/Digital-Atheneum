import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Table, Badge } from 'react-bootstrap';
import axios from 'axios';

const ModerationSettings = ({ userInfo }) => {
  const [settings, setSettings] = useState({
    autoFilter: {
      enabled: true,
      sensitivity: 'medium',
      filterTypes: ['spam', 'inappropriate', 'copyright'],
      notifyAdmins: true
    },
    warningSystem: {
      enabled: true,
      maxWarnings: 3,
      warningActions: ['restrict_upload', 'temporary_ban', 'permanent_ban'],
      warningExpiry: 30 // days
    },
    bannedWords: [],
    customRules: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newRule, setNewRule] = useState({ pattern: '', action: 'flag' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get('/api/moderation/settings', config);
      setSettings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching moderation settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put('/api/moderation/settings', settings, config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBannedWord = () => {
    if (newWord.trim()) {
      setSettings(prev => ({
        ...prev,
        bannedWords: [...prev.bannedWords, newWord.trim()]
      }));
      setNewWord('');
    }
  };

  const handleRemoveBannedWord = (word) => {
    setSettings(prev => ({
      ...prev,
      bannedWords: prev.bannedWords.filter(w => w !== word)
    }));
  };

  const handleAddCustomRule = () => {
    if (newRule.pattern.trim()) {
      setSettings(prev => ({
        ...prev,
        customRules: [...prev.customRules, { ...newRule }]
      }));
      setNewRule({ pattern: '', action: 'flag' });
    }
  };

  const handleRemoveCustomRule = (index) => {
    setSettings(prev => ({
      ...prev,
      customRules: prev.customRules.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="moderation-settings">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Settings saved successfully!</Alert>}

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Automated Content Filtering</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="autoFilter"
                label="Enable Automated Filtering"
                checked={settings.autoFilter.enabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  autoFilter: { ...prev.autoFilter, enabled: e.target.checked }
                }))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Filter Sensitivity</Form.Label>
              <Form.Select
                value={settings.autoFilter.sensitivity}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  autoFilter: { ...prev.autoFilter, sensitivity: e.target.value }
                }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Filter Types</Form.Label>
              {['spam', 'inappropriate', 'copyright'].map(type => (
                <Form.Check
                  key={type}
                  type="checkbox"
                  id={`filter-${type}`}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  checked={settings.autoFilter.filterTypes.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...settings.autoFilter.filterTypes, type]
                      : settings.autoFilter.filterTypes.filter(t => t !== type);
                    setSettings(prev => ({
                      ...prev,
                      autoFilter: { ...prev.autoFilter, filterTypes: newTypes }
                    }));
                  }}
                />
              ))}
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Warning System</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="warningSystem"
                label="Enable Warning System"
                checked={settings.warningSystem.enabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  warningSystem: { ...prev.warningSystem, enabled: e.target.checked }
                }))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Maximum Warnings</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="10"
                value={settings.warningSystem.maxWarnings}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  warningSystem: { ...prev.warningSystem, maxWarnings: parseInt(e.target.value) }
                }))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Warning Actions</Form.Label>
              {['restrict_upload', 'temporary_ban', 'permanent_ban'].map(action => (
                <Form.Check
                  key={action}
                  type="checkbox"
                  id={`action-${action}`}
                  label={action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  checked={settings.warningSystem.warningActions.includes(action)}
                  onChange={(e) => {
                    const newActions = e.target.checked
                      ? [...settings.warningSystem.warningActions, action]
                      : settings.warningSystem.warningActions.filter(a => a !== action);
                    setSettings(prev => ({
                      ...prev,
                      warningSystem: { ...prev.warningSystem, warningActions: newActions }
                    }));
                  }}
                />
              ))}
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Banned Words</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex mb-3">
            <Form.Control
              type="text"
              placeholder="Add banned word"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              className="me-2"
            />
            <Button onClick={handleAddBannedWord}>Add</Button>
          </div>

          <div className="banned-words-list">
            {settings.bannedWords.map((word, index) => (
              <Badge
                key={index}
                bg="danger"
                className="me-2 mb-2"
                style={{ cursor: 'pointer' }}
                onClick={() => handleRemoveBannedWord(word)}
              >
                {word} ×
              </Badge>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Custom Rules</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex mb-3">
            <Form.Control
              type="text"
              placeholder="Pattern (regex)"
              value={newRule.pattern}
              onChange={(e) => setNewRule(prev => ({ ...prev, pattern: e.target.value }))}
              className="me-2"
            />
            <Form.Select
              value={newRule.action}
              onChange={(e) => setNewRule(prev => ({ ...prev, action: e.target.value }))}
              className="me-2"
              style={{ width: '200px' }}
            >
              <option value="flag">Flag for Review</option>
              <option value="block">Block Automatically</option>
              <option value="warn">Issue Warning</option>
            </Form.Select>
            <Button onClick={handleAddCustomRule}>Add Rule</Button>
          </div>

          <Table responsive>
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Action</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.customRules.map((rule, index) => (
                <tr key={index}>
                  <td>{rule.pattern}</td>
                  <td>{rule.action}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveCustomRule(index)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-end">
        <Button
          variant="primary"
          onClick={handleSaveSettings}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default ModerationSettings; 