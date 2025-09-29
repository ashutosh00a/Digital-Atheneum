import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import axios from 'axios';

const BookFormPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    genre: [],
    coverImage: '',
    pdfUrl: '',
    totalPages: '',
    isbn: '',
    publishedDate: '',
    publisher: '',
    bookLanguage: 'English',
    isFree: false,
    price: '0.00',
    tags: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [availableGenres, setAvailableGenres] = useState([]);
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch available genres
        const { data: genresData } = await axios.get('/api/books/genres');
        setAvailableGenres(genresData);

        // If in edit mode, fetch book details
        if (isEditMode) {
          const { data: bookData } = await axios.get(`/api/books/${id}`);
          setFormData({
            ...bookData,
            publishedDate: new Date(bookData.publishedDate).toISOString().split('T')[0],
            price: bookData.price.toFixed(2)
          });
        }
        
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, navigate, userInfo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGenreChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      genre: selectedOptions
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const uploadFileHandler = async (e, type) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append(type, file);

    try {
      setUploading(true);
      setUploadProgress({ ...uploadProgress, [type]: 0 });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
        onUploadProgress: (progressEvent) => {
          setUploadProgress({
            ...uploadProgress,
            [type]: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          });
        },
      };

      const { data } = await axios.post('/api/books/upload', formData, config);

      setFormData(prev => ({
        ...prev,
        [type === 'pdf' ? 'pdfUrl' : 'coverImage']: data[type === 'pdf' ? 'pdfUrl' : 'coverImage']
      }));

      setUploading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      const requiredFields = {
        title: 'Title',
        author: 'Author',
        description: 'Description',
        genre: 'Genre',
        pdfUrl: 'PDF URL',
        totalPages: 'Total Pages',
        isbn: 'ISBN',
        publishedDate: 'Published Date',
        publisher: 'Publisher'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([field]) => !formData[field])
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Validate genre is an array and not empty
      if (!Array.isArray(formData.genre) || formData.genre.length === 0) {
        setError('Please select at least one genre');
        return;
      }

      // Validate totalPages is a positive number
      const totalPagesNum = parseInt(formData.totalPages);
      if (isNaN(totalPagesNum) || totalPagesNum < 1) {
        setError('Total pages must be a positive number');
        return;
      }

      // Validate ISBN format (13 digits)
      if (!/^\d{13}$/.test(formData.isbn)) {
        setError('ISBN must be exactly 13 digits');
        return;
      }

      // Validate publishedDate is a valid date
      const publishedDateObj = new Date(formData.publishedDate);
      if (isNaN(publishedDateObj.getTime())) {
        setError('Please enter a valid published date');
        return;
      }

      // Format the data according to the schema
      const bookData = {
        ...formData,
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        pdfUrl: formData.pdfUrl.trim(),
        isbn: formData.isbn.trim(),
        publisher: formData.publisher.trim(),
        totalPages: totalPagesNum,
        publishedDate: publishedDateObj.toISOString(),
        price: Number(formData.price).toFixed(2),
        coverImage: formData.coverImage || 'https://via.placeholder.com/300x450',
        bookLanguage: formData.bookLanguage || 'English',
        isFree: formData.isFree || false,
        tags: formData.tags || [],
        relatedBooks: [],
        verificationStatus: 'pending'
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      if (isEditMode) {
        const { data } = await axios.put(`/api/books/${id}`, bookData, config);
        setSuccess('Book updated successfully');
      } else {
        const { data } = await axios.post('/api/books', bookData, config);
        setSuccess('Book created successfully');
      }

      // Reset form after successful submission
      setFormData({
        title: '',
        author: '',
        description: '',
        genre: [],
        coverImage: '',
        pdfUrl: '',
        totalPages: '',
        isbn: '',
        publishedDate: '',
        publisher: '',
        bookLanguage: 'English',
        isFree: false,
        price: '0.00',
        tags: []
      });

      // Redirect to books list after a short delay
      setTimeout(() => {
        navigate('/admin/books');
      }, 2000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.message ||
        'An error occurred while saving the book'
      );
    }
  };

  return (
    <div>
      <Link to="/admin/dashboard" className="btn btn-light my-3">
        <i className="fas fa-arrow-left"></i> Back to Dashboard
      </Link>
      
      <h1>{isEditMode ? 'Edit Book' : 'Add New Book'}</h1>
      
      {loading ? (
        <Loader />
      ) : (
        <>
          {error && <Message variant="danger">{error}</Message>}
          {success && (
            <Alert variant="success">
              Book {isEditMode ? 'updated' : 'added'} successfully!
            </Alert>
          )}
          
          <Form onSubmit={submitHandler}>
            <Row>
              <Col md={8}>
                <Card className="mb-3">
                  <Card.Body>
                    <Form.Group controlId="title" className="mb-3">
                      <Form.Label>Title *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        placeholder="Enter title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group controlId="author" className="mb-3">
                      <Form.Label>Author *</Form.Label>
                      <Form.Control
                        type="text"
                        name="author"
                        placeholder="Enter author"
                        value={formData.author}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group controlId="description" className="mb-3">
                      <Form.Label>Description *</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        rows={4}
                        placeholder="Enter book description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="genre" className="mb-3">
                      <Form.Label>Genres *</Form.Label>
                      <Form.Select
                        multiple
                        value={formData.genre}
                        onChange={handleGenreChange}
                        required
                      >
                        {availableGenres.map((genre) => (
                          <option key={genre} value={genre}>
                            {genre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group controlId="tags" className="mb-3">
                      <Form.Label>Tags (comma-separated)</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.tags.join(', ')}
                        onChange={handleTagsChange}
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4}>
                <Card className="mb-3">
                  <Card.Body>
                    <Form.Group controlId="coverImage" className="mb-3">
                      <Form.Label>Cover Image</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadFileHandler(e, 'coverImage')}
                      />
                      {uploadProgress.coverImage > 0 && (
                        <div className="progress mt-2">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${uploadProgress.coverImage}%` }}
                          >
                            {uploadProgress.coverImage}%
                          </div>
                        </div>
                      )}
                      {formData.coverImage.url && (
                        <img
                          src={formData.coverImage}
                          alt="Cover Preview"
                          className="mt-2"
                          style={{ maxWidth: '100%', maxHeight: '200px' }}
                        />
                      )}
                    </Form.Group>

                    <Form.Group controlId="pdf" className="mb-3">
                      <Form.Label>PDF File *</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".pdf"
                        onChange={(e) => uploadFileHandler(e, 'pdf')}
                        required={!isEditMode}
                      />
                      {uploadProgress.pdf > 0 && (
                        <div className="progress mt-2">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${uploadProgress.pdf}%` }}
                          >
                            {uploadProgress.pdf}%
                          </div>
                        </div>
                      )}
                      {formData.pdfUrl && (
                        <div className="mt-2">
                          <a href={formData.pdfUrl} target="_blank" rel="noopener noreferrer">
                            View PDF
                          </a>
                        </div>
                      )}
                    </Form.Group>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Body>
                    <Form.Group controlId="isbn" className="mb-3">
                      <Form.Label>ISBN *</Form.Label>
                      <Form.Control
                        type="text"
                        name="isbn"
                        placeholder="Enter ISBN"
                        value={formData.isbn}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group controlId="publishedDate" className="mb-3">
                      <Form.Label>Published Date *</Form.Label>
                      <Form.Control
                        type="date"
                        name="publishedDate"
                        value={formData.publishedDate}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group controlId="publisher" className="mb-3">
                      <Form.Label>Publisher *</Form.Label>
                      <Form.Control
                        type="text"
                        name="publisher"
                        placeholder="Enter publisher"
                        value={formData.publisher}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group controlId="bookLanguage" className="mb-3">
                      <Form.Label>Language *</Form.Label>
                      <Form.Control
                        type="text"
                        name="bookLanguage"
                        placeholder="Enter language"
                        value={formData.bookLanguage}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group controlId="totalPages" className="mb-3">
                      <Form.Label>Total Pages *</Form.Label>
                      <Form.Control
                        type="number"
                        name="totalPages"
                        placeholder="Enter total pages"
                        value={formData.totalPages}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="isFree" className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="isFree"
                        label="Free Book"
                        checked={formData.isFree}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    {!formData.isFree && (
                      <Form.Group controlId="price" className="mb-3">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                          type="number"
                          name="price"
                          step="0.01"
                          min="0"
                          placeholder="Enter price"
                          value={formData.price}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={loading || uploading}
            >
              {loading
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                ? 'Update Book'
                : 'Create Book'}
            </Button>
          </Form>
        </>
      )}
    </div>
  );
};

export default BookFormPage; 