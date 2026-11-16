import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../services/api";
import "../../styles/all-posts.css";

export default function AllPosts({ status, title = "All posts" }) {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState(location.state?.message || "");
  const [error, setError] = useState("");

  const loadPosts = async () => {
    setError("");
    try {
      const response = await api.get(
        "/blogs" + (status ? "?status=" + status : ""),
      );
      setPosts(response.data.posts || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load posts.");
    }
  };

  useEffect(() => {
    loadPosts();
  }, [status]);

  const removePost = async (post) => {
    if (!window.confirm('Delete "' + post.title + '"? This cannot be undone.'))
      return;
    setError("");
    setMessage("");
    try {
      await api.delete("/blogs/" + post._id);
      await loadPosts();
      setMessage("Post deleted successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not delete this post.",
      );
    }
  };

  return (
    <section className="management">
      <div className="page-top">
        <div>
          <p className="eyebrow">MY WRITING</p>
          <h1>{title}</h1>
        </div>
        <Link className="button" to="/author/create-post">
          Create new post
        </Link>
      </div>
      {message && (
        <p className="form-success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="post-table">
        <div className="post-head">
          <span>Article</span>
          <span>Category</span>
          <span>Status</span>
          <span>Updated</span>
          <span>Actions</span>
        </div>
        {posts.map((post) => (
          <div className="post-row" key={post._id}>
            <span>
              <b>{post.title}</b>
              <small>{post.shortDescription}</small>
            </span>
            <span>{post.category?.name}</span>
            <span className={"status " + post.status}>{post.status}</span>
            <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
            <span className="post-actions">
              <Link
                className="post-edit-action"
                to={"/author/posts/" + post._id + "/edit"}
              >
                Edit
              </Link>
              <button
                className="post-delete-action"
                type="button"
                onClick={() => removePost(post)}
              >
                Delete
              </button>
            </span>
          </div>
        ))}
        {!posts.length && <p className="empty-note">No posts in this view.</p>}
      </div>
    </section>
  );
}
