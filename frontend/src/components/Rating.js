import React from 'react';

const Rating = ({ value, text, color = '#f8e825' }) => {
  // Convert value to a number between 0 and 10
  const rating = Math.min(Math.max(Number(value) || 0, 0), 10);
  
  return (
    <div className="rating d-flex align-items-center">
      {/* Stars (5 stars total, each representing 2 points) */}
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            <i
              style={{ color }}
              className={
                rating >= star * 2
                  ? 'fas fa-star'
                  : rating >= (star * 2) - 1
                  ? 'fas fa-star-half-alt'
                  : 'far fa-star'
              }
            ></i>
          </span>
        ))}
      </div>
      
      {/* Numerical rating */}
      <span className="ms-2 fw-bold">{rating.toFixed(1)}</span>
      <span className="text-muted ms-1">/10</span>
      
      {/* Additional text (e.g., number of reviews) */}
      {text && <span className="ms-2 text-muted">({text})</span>}
    </div>
  );
};

export default Rating; 