import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const BookPreview = ({ book, show, onHide }) => {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewPages, setPreviewPages] = useState([1, 2, 3]); // Show first 3 pages

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    setError('Error loading preview');
    setLoading(false);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="book-preview-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{book?.title} - Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="preview-pages">
            <Document
              file={book?.pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              }
            >
              {previewPages.map((pageNumber) => (
                <Page
                  key={pageNumber}
                  pageNumber={pageNumber}
                  scale={0.8}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="preview-page"
                />
              ))}
            </Document>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-between w-100">
          <div>
            <small className="text-muted">
              Showing preview of first {previewPages.length} pages
            </small>
          </div>
          <div>
            <Button variant="secondary" onClick={onHide} className="me-2">
              Close
            </Button>
            <Button variant="primary" href={`/reader/${book?._id}`}>
              Read Full Book
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default BookPreview; 