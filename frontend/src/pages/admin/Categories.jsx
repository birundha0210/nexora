import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/admin-categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  const load = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();

    try {
      await api.post("/categories", { name });
      setName("");
      await load();
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      await load();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  return (
    <section className="simple-manager">
      <p className="eyebrow">TAXONOMY</p>
      <h1>Categories</h1>

      <form onSubmit={add}>
        <input
          required
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className="button" type="submit">
          Add category
        </button>
      </form>

      {categories.map((category) => (
        <div className="manager-row" key={category._id}>
          <span>
            <b>{category.name}</b>
            <small>{category.slug}</small>
          </span>

          <button type="button" onClick={() => remove(category._id)}>
            Delete
          </button>
        </div>
      ))}
    </section>
  );
}
