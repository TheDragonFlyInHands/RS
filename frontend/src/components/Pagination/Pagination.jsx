import React from 'react';
import './Pagination.scss';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button 
        className={`pagination__btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >❮</button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          className={`pagination__btn ${currentPage === page ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >{page}</button>
      ))}

      {totalPages > 5 && <span className="pagination__dots">...</span>}

      <button 
        className={`pagination__btn ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >❯</button>
    </div>
  );
};

export default Pagination;