import React from "react";
import { Link } from "react-router-dom";
import "../styles/blog-card.css";
const fallback =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80";
export default function BlogCard({ post }) {
  return (
    <article className="blog-card">
      <img
        src={post.featuredImage?.url || fallback}
        alt={post.featuredImage?.alt || post.title}
      />
      <div>
        <span>{post.category?.name || "Technology"}</span>
        <h3>
          <Link to={`/blogs/${post.slug}`}>{post.title}</Link>
        </h3>
        <p>{post.shortDescription}</p>
        <footer>
          {post.author?.name || post.author?.username || "NEXORA Editorial"}
          <i>·</i>{" "}
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString()
            : "New insight"}
        </footer>
      </div>
    </article>
  );
}
