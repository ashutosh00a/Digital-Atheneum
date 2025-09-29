import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col, Tab, Nav } from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import api from '../utils/api';

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const navigate = useNavigate();
  
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;
  
  useEffect(() => {
    // Check if user is admin
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, we would fetch from API
        // const { data: booksData } = await api.get('/api/books');
        // const { data: usersData } = await api.get('/api/users');
        
        // Mock books data
        const mockBooks = [
          {
            _id: '1',
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            category: 'Classic',
            available: true,
            createdAt: '2023-04-01'
          },
          {
            _id: '2',
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            category: 'Fiction',
            available: true,
            createdAt: '2023-04-02'
          },
          {
            _id: '3',
            title: '1984',
            author: 'George Orwell',
            category: 'Science Fiction',
            available: false,
            createdAt: '2023-04-03'
          }
        ];
        
        // Mock users data
        const mockUsers = [
          {
            _id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            createdAt: '2023-03-20'
          },
          {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'user',
            createdAt: '2023-03-25'
          },
          {
            _id: '3',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            role: 'user',
            createdAt: '2023-03-30'
          }
        ];
        
        setBooks(mockBooks);
        setUsers(mockUsers);
        setLoading(false);
      } catch (error) {
        setError('Failed to load data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, userInfo]);
  
  const deleteBookHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        setDeleteLoading(true);
        
        // In a real app, we would call the API
        // await api.delete(`/api/books/${id}`);
        
        // Update UI by filtering out the deleted book
        setBooks(books.filter(book => book._id !== id));
        setSuccessMessage('Book deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
        
        setDeleteLoading(false);
      } catch (error) {
        setError('Failed to delete book');
        setDeleteLoading(false);
      }
    }
  };
  
  const deleteUserHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setDeleteLoading(true);
        
        // In a real app, we would call the API
        // await api.delete(`/api/users/${id}`);
        
        // Update UI by filtering out the deleted user
        setUsers(users.filter(user => user._id !== id));
        setSuccessMessage('User deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
        
        setDeleteLoading(false);
      } catch (error) {
        setError('Failed to delete user');
        setDeleteLoading(false);
      }
    }
  };
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {error && <Message variant="danger">{error}</Message>}
      {successMessage && <Message variant="success">{successMessage}</Message>}
      {loading ? (
        <Loader />
      ) : (
        <Tab.Container id="admin-tabs" defaultActiveKey="books">
          <Row>
            <Col md={3}>
              <Nav variant="pills" className="flex-column mb-4">
                <Nav.Item>
                  <Nav.Link eventKey="books">Manage Books</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="users">Manage Users</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col md={9}>
              <Tab.Content>
                <Tab.Pane eventKey="books">
                  <Row className="align-items-center mb-3">
                    <Col>
                      <h2>Books</h2>
                    </Col>
                    <Col className="text-end">
                      <Link to="/admin/book/create" className="btn btn-primary">
                        <i className="fas fa-plus"></i> Add Book
                      </Link>
                    </Col>
                  </Row>
                  
                  {books.length === 0 ? (
                    <Message>No books found</Message>
                  ) : (
                    <Table striped bordered hover responsive className="table-sm">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>TITLE</th>
                          <th>AUTHOR</th>
                          <th>CATEGORY</th>
                          <th>AVAILABLE</th>
                          <th>DATE ADDED</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map((book) => (
                          <tr key={book._id}>
                            <td>{book._id}</td>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.category}</td>
                            <td>
                              {book.available ? (
                                <i className="fas fa-check text-success"></i>
                              ) : (
                                <i className="fas fa-times text-danger"></i>
                              )}
                            </td>
                            <td>{book.createdAt.substring(0, 10)}</td>
                            <td>
                              <Link to={`/admin/book/${book._id}/edit`} className="btn btn-sm btn-primary me-2">
                                <i className="fas fa-edit"></i>
                              </Link>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => deleteBookHandler(book._id)}
                                disabled={deleteLoading}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Tab.Pane>
                
                <Tab.Pane eventKey="users">
                  <h2>Users</h2>
                  
                  {users.length === 0 ? (
                    <Message>No users found</Message>
                  ) : (
                    <Table striped bordered hover responsive className="table-sm">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>NAME</th>
                          <th>EMAIL</th>
                          <th>ROLE</th>
                          <th>REGISTERED ON</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td>{user._id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              {user.role === 'admin' ? (
                                <span className="badge bg-success">Admin</span>
                              ) : (
                                <span className="badge bg-primary">User</span>
                              )}
                            </td>
                            <td>{user.createdAt.substring(0, 10)}</td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => deleteUserHandler(user._id)}
                                disabled={deleteLoading || user._id === userInfo._id}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      )}
    </div>
  );
};

export default AdminDashboard; 