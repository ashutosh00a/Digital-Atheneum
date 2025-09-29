import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Tabs, Tab, Nav } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Badge } from 'react-bootstrap';
import ModerationSettings from '../components/ModerationSettings';

const AdminDashboardPage = () => {
  const { userInfo } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [pendingBooks, setPendingBooks] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    pendingVerifications: 0,
    activeReaders: 0,
    totalDownloads: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [genreStats, setGenreStats] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [readingTrends, setReadingTrends] = useState([]);
  const [verificationStats, setVerificationStats] = useState(null);
  const [reportedContent, setReportedContent] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [moderationStats, setModerationStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    bannedUsers: 0
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const [
          usersRes,
          booksRes,
          statsRes,
          reportsRes,
          activityRes,
          moderationRes
        ] = await Promise.all([
          axios.get('/api/users', config),
          axios.get('/api/books/pending', config),
          axios.get('/api/analytics/overview', config),
          axios.get('/api/moderation/reports', config),
          axios.get('/api/analytics/user-activity', config),
          axios.get('/api/moderation/stats', config)
        ]);

        setUsers(usersRes.data);
        setPendingBooks(booksRes.data);
        setStats(statsRes.data);
        setReportedContent(reportsRes.data);
        setUserActivity(activityRes.data);
        setModerationStats(moderationRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userInfo]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
          },
        };

        const [
          overviewRes,
          genreRes,
          userRes,
          trendsRes,
          verificationRes,
        ] = await Promise.all([
          axios.get('/api/analytics/overview', config),
          axios.get('/api/analytics/genres', config),
          axios.get('/api/analytics/users', config),
          axios.get('/api/analytics/trends', config),
          axios.get('/api/analytics/verification', config),
        ]);

        setOverview(overviewRes.data);
        setGenreStats(genreRes.data);
        setUserStats(userRes.data);
        setReadingTrends(trendsRes.data);
        setVerificationStats(verificationRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching analytics');
      }
    };

    fetchAnalytics();
  }, []);

  const handleVerifyBook = async (bookId, action) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(`/api/books/${bookId}/verify`, { action }, config);
      setPendingBooks(pendingBooks.filter(book => book._id !== bookId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error verifying book');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(`/api/users/${userId}/role`, { role: newRole }, config);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user role');
    }
  };

  const handleModerateContent = async (contentId, action) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(`/api/moderation/${contentId}`, { action }, config);
      setReportedContent(reportedContent.filter(content => content._id !== contentId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error moderating content');
    }
  };

  const handleBanUser = async (userId, reason) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(`/api/users/${userId}/ban`, { reason }, config);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isBanned: reason } : user
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Error banning user');
    }
  };

  const handleViewWarnings = async (userId) => {
    // Implementation of handleViewWarnings function
  };

  if (!userInfo || userInfo.role !== 'admin') {
    return (
      <Container className="py-4">
        <Alert variant="danger">Access denied. Admin privileges required.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="admin-dashboard">
      <Row className="mb-4">
        <Col>
          <h2>Admin Dashboard</h2>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3>{stats.totalUsers}</h3>
              <p className="text-muted">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3>{stats.totalBooks}</h3>
              <p className="text-muted">Total Books</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3>{stats.pendingVerifications}</h3>
              <p className="text-muted">Pending Verifications</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3>{stats.totalDownloads}</h3>
              <p className="text-muted">Total Downloads</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Nav variant="tabs" className="mb-4">
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === 'users'}
                    onClick={() => setActiveTab('users')}
                  >
                    User Management
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === 'books'}
                    onClick={() => setActiveTab('books')}
                  >
                    Book Verification
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === 'moderation'}
                    onClick={() => setActiveTab('moderation')}
                  >
                    Content Moderation
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                  >
                    Moderation Settings
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {activeTab === 'overview' && (
                <div>
                  <h4>Recent Activity</h4>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>Details</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userActivity.map((activity, index) => (
                        <tr key={index}>
                          <td>{activity.user.name}</td>
                          <td>{activity.action}</td>
                          <td>{activity.details}</td>
                          <td>{new Date(activity.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <h4>User Management</h4>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>
                            <Badge bg={user.isBanned ? 'danger' : 'success'}>
                              {user.isBanned ? 'Banned' : 'Active'}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant={user.isBanned ? 'success' : 'danger'}
                              size="sm"
                              className="me-2"
                              onClick={() => handleBanUser(user._id, !user.isBanned)}
                            >
                              {user.isBanned ? 'Unban' : 'Ban'}
                            </Button>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleViewWarnings(user._id)}
                            >
                              Warnings
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {activeTab === 'books' && (
                <div>
                  <h4>Book Verification</h4>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Uploaded By</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingBooks.map((book) => (
                        <tr key={book._id}>
                          <td>{book.title}</td>
                          <td>{book.author}</td>
                          <td>{book.uploadedBy.name}</td>
                          <td>{new Date(book.createdAt).toLocaleString()}</td>
                          <td>
                            <Button
                              variant="success"
                              size="sm"
                              className="me-2"
                              onClick={() => handleVerifyBook(book._id, true)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleVerifyBook(book._id, false)}
                            >
                              Reject
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {activeTab === 'moderation' && (
                <div>
                  <h4>Content Moderation</h4>
                  <Row className="mb-4">
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <h3>{moderationStats.totalReports}</h3>
                          <p className="text-muted">Total Reports</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <h3>{moderationStats.pendingReports}</h3>
                          <p className="text-muted">Pending Reports</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <h3>{moderationStats.resolvedReports}</h3>
                          <p className="text-muted">Resolved Reports</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <h3>{moderationStats.bannedUsers}</h3>
                          <p className="text-muted">Banned Users</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Reported By</th>
                        <th>Content Type</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportedContent.map((report) => (
                        <tr key={report._id}>
                          <td>{report.reportedBy.name}</td>
                          <td>{report.contentType}</td>
                          <td>{report.reason}</td>
                          <td>
                            <Badge bg={report.status === 'pending' ? 'warning' : 'success'}>
                              {report.status}
                            </Badge>
                          </td>
                          <td>
                            {report.status === 'pending' && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleModerateContent(report._id, 'approve')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleModerateContent(report._id, 'remove')}
                                >
                                  Remove
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {activeTab === 'settings' && (
                <ModerationSettings userInfo={userInfo} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Books</Card.Title>
              <h2>{overview.totalBooks}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Users</Card.Title>
              <h2>{overview.totalUsers}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Reviews</Card.Title>
              <h2>{overview.totalReviews}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Reads</Card.Title>
              <h2>{overview.totalReads}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Genre Statistics */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Genre Distribution</Card.Title>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={genreStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Number of Books" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Reading Trends</Card.Title>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={readingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#82ca9d"
                    name="Books Read"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Activity */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Top Active Users</Card.Title>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Books Read</th>
                    <th>Reviews</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td>{user.totalBooksRead}</td>
                      <td>{user.totalReviews}</td>
                      <td>
                        {new Date(user.lastActive).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Verification Statistics */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Book Verification Status</Card.Title>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Avg. Processing Time</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationStats.stats.map((stat) => (
                    <tr key={stat._id}>
                      <td>
                        <Badge
                          bg={
                            stat._id === 'approved'
                              ? 'success'
                              : stat._id === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {stat._id}
                        </Badge>
                      </td>
                      <td>{stat.count}</td>
                      <td>
                        {Math.round(stat.avgProcessingTime / (1000 * 60 * 60))}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Recent Verifications</Card.Title>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Uploader</th>
                    <th>Verified By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationStats.recentVerifications.map((book) => (
                    <tr key={book._id}>
                      <td>{book.title}</td>
                      <td>{book.user.name}</td>
                      <td>{book.verifiedBy.name}</td>
                      <td>
                        {new Date(book.verifiedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboardPage; 