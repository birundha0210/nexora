import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/tags.css";

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");

  const load = async () => {
    try {
      const response = await api.get("/tags");
      setTags(response.data.tags || []);
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();

    try {
      await api.post("/tags", { name });
      setName("");
      await load();
    } catch (error) {
      console.error("Failed to add tag:", error);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/tags/${id}`);
      await load();
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  return (
    <section className="simple-manager">
      <p className="eyebrow">TAXONOMY</p>
      <h1>Tags</h1>

      <form onSubmit={add}>
        <input
          required
          placeholder="New tag name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="button" type="submit">
          Add tag
        </button>
      </form>

      {tags.map((tag) => (
        <div className="manager-row" key={tag._id}>
          <span>
            <b>{tag.name}</b>
            <small>{tag.slug}</small>
          </span>
          <button type="button" onClick={() => remove(tag._id)}>
            Delete
          </button>
        </div>
      ))}
    </section>
  );
}
