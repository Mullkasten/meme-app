import React from 'react';

function AboutModal({ show, onClose }) {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>×</button>
        <h3>Мемы это здорово!</h3>
        <p>
          Мемы — это универсальный язык интернета, который смешит, объединяет и помогает пережить даже самый тяжелый день.
        </p>
        <p>
          Они превращают сложное в простое, а обычное — в гениальное, давая нам повод улыбнуться даже в самом серьезном контексте.
        </p>
      </div>
    </div>
  );
}

export default AboutModal;