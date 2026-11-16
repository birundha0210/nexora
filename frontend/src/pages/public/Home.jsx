import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import BlogCard from "../../components/BlogCard";
import CategoryCard from "../../components/CategoryCard";
import SearchBar from "../../components/SearchBar";
import "../../styles/home.css";
const topics = [
  {
    name: "Software Development",
    description: "Engineering practices that move products forward.",
  },
  {
    name: "Artificial Intelligence & Machine Learning",
    description: "Useful, human-centered views on intelligent systems.",
  },
  {
    name: "Web and Mobile App Development",
    description: "The tools and patterns shaping digital products.",
  },
];
export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState(topics);
  useEffect(() => {
    api
      .get("/blogs/public?limit=6")
      .then(({ data }) => setPosts(data.posts))
      .catch(() => {});
    api
      .get("/categories")
      .then(
        ({ data }) => data.categories.length && setCategories(data.categories),
      )
      .catch(() => {});
  }, []);
  const featured = posts.filter((p) => p.featured)[0] || posts[0];
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">NEXORA / TECHNOLOGY BLOG & INSIGHTS</p>
          <h1>
            Ideas for what
            <br />
            <em>comes next.</em>
          </h1>
          <p className="hero-copy">
            Practical analysis, considered opinions, and technical knowledge for
            people building the future.
          </p>
          <SearchBar />
          <Link className="text-link" to="/blogs">
            Explore the latest articles →
          </Link>
        </div>
        <div className="hero-art">
          <span>01</span>
          <div>
            TECH
            <br />
            WITH
            <br />
            <b>PURPOSE</b>
          </div>
        </div>
      </section>
      {featured && (
        <section className="feature-band">
          <div>
            <p className="eyebrow">FEATURED ARTICLE</p>
            <h2>{featured.title}</h2>
            <p>{featured.shortDescription}</p>
            <Link className="button" to={`/blogs/${featured.slug}`}>
              Read article
            </Link>
          </div>
        </section>
      )}
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">RECENT THINKING</p>
            <h2>Latest articles</h2>
          </div>
          <Link to="/blogs">View all →</Link>
        </div>
        <div className="card-grid">
          {posts.slice(0, 3).map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
          {!posts.length && (
            <p className="empty-note">
              Articles will appear here once published from the NEXORA CMS.
            </p>
          )}
        </div>
      </section>
      <section className="topics section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR FOCUS</p>
            <h2>Explore by category</h2>
          </div>
          <Link to="/categories">All categories →</Link>
        </div>
        <div className="category-grid">
          {categories.slice(0, 3).map((category, i) => (
            <CategoryCard key={category._id || i} category={category} />
          ))}
        </div>
      </section>
      <section className="newsletter">
        <p className="eyebrow">STAY IN THE LOOP</p>
        <h2>
          Technology moves fast.
          <br />
          Keep your perspective.
        </h2>
        <Link className="button light" to="/blogs">
          Browse insights
        </Link>
      </section>
    </>
  );
}
