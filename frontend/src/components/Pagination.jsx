import React from 'react';
import '../styles/pagination.css';
export default function Pagination({ page, pages, onChange }) { if (pages <= 1) return null; return <nav className="pagination"><button disabled={page === 1} onClick={() => onChange(page - 1)}>← Previous</button><span>Page {page} of {pages}</span><button disabled={page === pages} onClick={() => onChange(page + 1)}>Next →</button></nav>; }
