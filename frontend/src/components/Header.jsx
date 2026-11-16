import React from "react";
import { NavLink, Link } from "react-router-dom";
import "../styles/header.css";
export default function Header() {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="NEXORA home">
        <span className="brand-copy">
          NEXORA<small>Technology Blog & Insights</small>
        </span>
      </Link>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/blogs">Blogs</NavLink>
        <NavLink to="/categories">Categories</NavLink>
        <NavLink to="/blogs?search=">Search</NavLink>
        <NavLink className="login-link" to="/login">
          Login
        </NavLink>
      </nav>
    </header>
  );
}
