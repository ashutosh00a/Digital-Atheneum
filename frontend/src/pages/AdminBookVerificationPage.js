import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';

const AdminBookVerificationPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [success, setSuccess] = useState(false);

  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      window.location.href = '/login';
    }

    const fetchPendingBooks = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get('/api/books/pending', config);
        setBooks(data.books);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch pending books');
        setLoading(false);
      }
    };

    fetchPendingBooks();
  }, [userInfo]);

  const handleVerify = async (bookId, status) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const data = {
        status,
        ...(status === 'rejected' && { rejectionReason }),
      };

      await axios.put(`/api/books/${bookId}/verify`, data, config);

      // Remove the verified book from the list
      setBooks(books.filter((book) => book._id !== bookId));
      setShowModal(false);
      setSelectedBook(null);
      setRejectionReason('');
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify book');
    }
  };

  const openRejectModal = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  return (
    <div>
      <h1>Book Verification</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          {success && (
            <Message variant="success">Book verification status updated successfully</Message>
          )}
          {books.length === 0 ? (
            <Message>No pending books to verify</Message>
          ) : (
            <Table striped bordered hover responsive className="table-sm">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Uploaded By</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>
                      <Link to={`/book/${book._id}`}>{book.title}</Link>
                    </td>
                    <td>{book.author}</td>
                    <td>{book.user.name}</td>
                    <td>{new Date(book.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="success"
                        className="btn-sm"
                        onClick={() => handleVerify(book._id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        className="btn-sm ms-2"
                        onClick={() => openRejectModal(book)}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBook && (
            <Card className="mb-3">
              <Card.Body>
                <h5>{selectedBook.title}</h5>
                <p className="text-muted">by {selectedBook.author}</p>
              </Card.Body>
            </Card>
          )}
          <Form>
            <Form.Group controlId="rejectionReason">
              <Form.Label>Rejection Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleVerify(selectedBook._id, 'rejected')}
            disabled={!rejectionReason}
          >
            Reject Book
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminBookVerificationPage; 