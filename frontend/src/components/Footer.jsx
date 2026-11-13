import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';
export default function Footer() { return <footer className="site-footer"><div><strong>NEXORA</strong><p>Clear ideas for a changing technology landscape.</p></div><div><b>Explore</b><Link to="/blogs">All Articles</Link><Link to="/categories">Categories</Link></div><div><b>Connect</b><a href="#linkedin">LinkedIn</a><a href="#x">X / Twitter</a></div><small>© {new Date().getFullYear()} NEXORA. Technology Blog & Insights.</small></footer>; }
