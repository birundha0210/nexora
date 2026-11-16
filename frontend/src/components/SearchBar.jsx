import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/search-bar.css";
export default function SearchBar({ initial = "" }) {
  const [value, setValue] = useState(initial);
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    navigate(`/blogs?search=${encodeURIComponent(value)}`);
  };
  return (
    <form className="search-bar" onSubmit={submit}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles, topics, and ideas"
      />
      <button>Search</button>
    </form>
  );
}
