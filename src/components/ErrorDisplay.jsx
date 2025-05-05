import React from 'react';

function ErrorDisplay({ message }) {
  return (
    <div className="error-display">
      <p><strong>Error:</strong> {message || 'Something went wrong.'}</p>
    </div>
  );
}

export default ErrorDisplay;