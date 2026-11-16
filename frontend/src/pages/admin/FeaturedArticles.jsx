import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/featured-articles.css";

export default function FeaturedArticles() {
  const [posts, setPosts] = useState([]);

  const load = async () => {
    try {
      const response = await api.get("/blogs");
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error("Failed to load blogs:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (post) => {
    try {
      await api.put(`/blogs/${post._id}`, {
        featured: !post.featured,
      });

      await load();
    } catch (error) {
      console.error("Failed to update featured article:", error);
    }
  };

  return (
    <section className="management">
      <p className="eyebrow">EDITORIAL CURATION</p>
      <h1>Featured articles</h1>
      <p className="feature-note">
        Choose the stories to spotlight on the NEXORA homepage.
      </p>

      <div className="feature-list">
        {posts.map((post) => (
          <div key={post._id}>
            <span>
              <b>{post.title}</b>
              <small>
                {post.featured ? "Featured on homepage" : "Not featured"}
              </small>
            </span>

            <button
              className={post.featured ? "selected" : ""}
              onClick={() => toggle(post)}
            >
              {post.featured ? "Remove feature" : "Feature article"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
