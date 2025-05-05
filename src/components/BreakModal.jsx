import React from 'react';

function BreakModal({ show, onClose }) {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay break-modal-overlay" >
      <div className="modal-content break-modal-content" onClick={(e) => e.stopPropagation()}>
         <button className="modal-close-button" onClick={onClose}>×</button>
        <h3>Хватит прокрастинировать!</h3>
        <p className="break-message">
            Пора за работу!
        </p>
         <button className="modal-action-button" onClick={onClose}>
            Ладно...
         </button>
      </div>
    </div>
  );
}

export default BreakModal;