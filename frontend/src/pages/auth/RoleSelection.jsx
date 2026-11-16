import React from "react";
import { Link } from "react-router-dom";
import "../../styles/role-selection.css";
export default function RoleSelection() {
  return (
    <section className="auth-shell">
      <p className="eyebrow">NEXORA CMS</p>
      <h1>Welcome back.</h1>
      <p>Choose the workspace you need to access.</p>
      <div className="role-options">
        <Link to="/login/admin">
          <span>01</span>
          <h2>Administrator</h2>
          <p>
            Manage publishing, people, content strategy and platform settings.
          </p>
          <b>Continue →</b>
        </Link>
        <Link to="/login/author">
          <span>02</span>
          <h2>Author</h2>
          <p>Write, edit and manage your own articles.</p>
          <b>Continue →</b>
        </Link>
      </div>
    </section>
  );
}
