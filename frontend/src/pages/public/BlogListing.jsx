import React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import BlogCard from "../../components/BlogCard";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import "../../styles/blog-listing.css";
export default function BlogListing() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ posts: [], page: 1, pages: 1 });
  const [categories, setCategories] = useState([]);
  const page = Number(params.get("page") || 1);
  useEffect(() => {
    api
      .get(`/blogs/public?${params.toString()}`)
      .then((r) => setData(r.data))
      .catch(() => setData({ posts: [], page: 1, pages: 1 }));
    api
      .get("/categories")
      .then((r) => setCategories(r.data.categories))
      .catch(() => {});
  }, [params]);
  const category = params.get("category");
  return (
    <section className="listing">
      <p className="eyebrow">NEXORA LIBRARY</p>
      <h1>Technology, clearly considered.</h1>
      <SearchBar initial={params.get("search") || ""} />
      <div className="filter-row">
        <button
          className={!category ? "active" : ""}
          onClick={() => setParams({})}
        >
          All articles
        </button>
        {categories.map((c) => (
          <button
            className={category === c._id ? "active" : ""}
            key={c._id}
            onClick={() => setParams({ category: c._id })}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="card-grid">
        {data.posts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
      {!data.posts.length && (
        <p className="empty-note">No published articles match this view.</p>
      )}
      <Pagination
        page={data.page}
        pages={data.pages}
        onChange={(next) => {
          const p = Object.fromEntries(params);
          p.page = next;
          setParams(p);
        }}
      />
    </section>
  );
}
