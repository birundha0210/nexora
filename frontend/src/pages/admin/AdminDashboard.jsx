import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "../../styles/admin-dashboard.css";
export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    api
      .get("/blogs")
      .then((r) => setPosts(r.data.posts))
      .catch(() => {});
  }, []);
  const count = (s) => posts.filter((p) => p.status === s).length;
  return (
    <section className="dashboard">
      <p className="eyebrow">ADMIN OVERVIEW</p>
      <h1>Good to see you.</h1>
      <div className="stat-grid">
        {[
          ["All posts", posts.length],
          ["Published", count("published")],
          ["Drafts", count("draft")],
          ["Scheduled", count("scheduled")],
        ].map(([l, n]) => (
          <div className="stat" key={l}>
            <span>{l}</span>
            <b>{n}</b>
          </div>
        ))}
      </div>
      <div className="dashboard-actions">
        <Link className="button" to="/admin/create-post">
          Create new post
        </Link>
        <Link to="/admin/posts">Manage all posts →</Link>
      </div>
      <h2>Recently updated</h2>
      <div className="mini-list">
        {posts.slice(0, 5).map((p) => (
          <Link key={p._id} to="/admin/posts">
            <span>{p.title}</span>
            <small>{p.status}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
