import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';
import Rating from './Rating';

const BookCard = ({ book }) => {
  return (
    <Card className='my-3 p-3 rounded'>
      <Link to={`/book/${book.id}`}>
        <Card.Img 
          variant='top' 
          src={typeof book.coverImage === 'object' ? book.coverImage.url : book.coverImage || '/images/default-book-cover.jpg'} 
          alt={book.title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      </Link>

      <Card.Body>
        <Link to={`/book/${book.id}`}>
          <Card.Title as='div'>
            <strong>{book.title}</strong>
          </Card.Title>
        </Link>

        <Card.Text as='div'>
          <div className='my-3'>
            <Rating
              value={book.ratings?.average || 0}
              text={`${book.ratings?.count || 0} reviews`}
            />
          </div>
        </Card.Text>

        <div className='mt-2'>
          {book.genre?.map((genre, index) => (
            <Badge 
              key={index} 
              bg='secondary' 
              className='me-1'
            >
              {genre}
            </Badge>
          ))}
        </div>

        {book.featured && (
          <Badge bg='warning' className='mt-2 ms-1'>Bestseller</Badge>
        )}
      </Card.Body>
    </Card>
  );
};

export default BookCard; 