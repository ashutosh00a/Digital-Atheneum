import React, { useState } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';

const KeyboardShortcuts = ({ theme }) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="link" onClick={handleShow} className="keyboard-help-btn text-decoration-none">
        <i className="fas fa-keyboard me-1"></i> Keyboard Shortcuts
      </Button>

      <Modal show={show} onHide={handleClose} centered className={theme === 'dark' ? 'dark-modal' : ''}>
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light' : ''}>
          <Modal.Title>Keyboard Shortcuts</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
          <Table striped bordered hover className={theme === 'dark' ? 'table-dark' : ''}>
            <thead>
              <tr>
                <th>Action</th>
                <th>Shortcut</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Next Page</td>
                <td><span className="key-hint">→</span> or <span className="key-hint">Space</span></td>
              </tr>
              <tr>
                <td>Previous Page</td>
                <td><span className="key-hint">←</span> or <span className="key-hint">Backspace</span></td>
              </tr>
              <tr>
                <td>Zoom In</td>
                <td><span className="key-hint">Ctrl</span> + <span className="key-hint">+</span></td>
              </tr>
              <tr>
                <td>Zoom Out</td>
                <td><span className="key-hint">Ctrl</span> + <span className="key-hint">-</span></td>
              </tr>
              <tr>
                <td>Add Bookmark</td>
                <td><span className="key-hint">Ctrl</span> + <span className="key-hint">B</span></td>
              </tr>
              <tr>
                <td>Open Reading Tools</td>
                <td><span className="key-hint">Ctrl</span> + <span className="key-hint">T</span></td>
              </tr>
              <tr>
                <td>First Page</td>
                <td><span className="key-hint">Home</span></td>
              </tr>
              <tr>
                <td>Last Page</td>
                <td><span className="key-hint">End</span></td>
              </tr>
            </tbody>
          </Table>
          
          <div className="mt-3">
            <h5>Text Selection</h5>
            <p>
              To highlight text, select any text with your mouse or trackpad. 
              A floating menu will appear allowing you to choose a highlight color.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className={theme === 'dark' ? 'bg-dark text-light' : ''}>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default KeyboardShortcuts; 