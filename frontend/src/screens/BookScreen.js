import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Image, ListGroup, Card, Button, Form, Badge } from 'react-bootstrap';
import Rating from '../components/Rating';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listBookDetails } from '../actions/bookActions';

const BookScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const bookDetails = useSelector((state) => state.bookDetails);
  const { loading, error, book } = bookDetails;

  useEffect(() => {
    dispatch(listBookDetails(id));
  }, [dispatch, id]);

  const addToCartHandler = () => {
    navigate(`/cart/${id}`);
  };

  return (
    <>
      <Link className='btn btn-light my-3' to='/'>
        Go Back
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <Row>
          <Col md={6}>
            <Image 
              src={book.coverImage?.url || '/images/default-book-cover.jpg'} 
              alt={book.title} 
              fluid 
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
          </Col>
          <Col md={3}>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h3>{book.title}</h3>
              </ListGroup.Item>
              <ListGroup.Item>
                <Rating
                  value={book.ratings?.average || 0}
                  text={`${book.ratings?.count || 0} reviews`}
                />
              </ListGroup.Item>
              <ListGroup.Item>Author: {book.author}</ListGroup.Item>
              <ListGroup.Item>
                Published: {book.publicationYear}
              </ListGroup.Item>
              <ListGroup.Item>
                <div className='d-flex flex-wrap gap-1'>
                  {book.genre?.map((genre, index) => (
                    <Badge key={index} bg='secondary'>
                      {genre}
                    </Badge>
                  ))}
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className='d-flex flex-wrap gap-1'>
                  {book.features?.isNewRelease && (
                    <Badge bg='success'>New Release</Badge>
                  )}
                  {book.features?.isBestseller && (
                    <Badge bg='warning'>Bestseller</Badge>
                  )}
                  {book.features?.hasIllustrations && (
                    <Badge bg='info'>Illustrated</Badge>
                  )}
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3}>
            <Card>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col>
                      <strong>${book.price}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {book.availability ? 'In Stock' : 'Out Of Stock'}
                    </Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Button
                    onClick={addToCartHandler}
                    className='btn-block'
                    type='button'
                    disabled={!book.availability}
                  >
                    Add To Cart
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default BookScreen; 