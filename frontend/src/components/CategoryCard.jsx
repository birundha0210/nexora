import React from "react";
import { Link } from "react-router-dom";
import "../styles/category-card.css";
export default function CategoryCard({ category }) {
  return (
    <Link
      className="category-card"
      to={category._id ? `/blogs?category=${category._id}` : "/blogs"}
    >
      <span>↗</span>
      <h3>{category.name}</h3>
      <p>
        {category.description ||
          "Explore practical perspectives and current thinking."}
      </p>
    </Link>
  );
}
