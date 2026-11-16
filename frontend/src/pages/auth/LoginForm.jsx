import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
export default function LoginForm({ role, title, label }) {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { ...form, role });
      localStorage.setItem("nexora_token", data.token);
      localStorage.setItem("nexora_user", JSON.stringify(data.user));
      nav(data.user.role === "admin" ? "/admin" : "/author");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to sign in.");
    }
  };
  return (
    <section className="login-page">
      <Link className="back" to="/login">
        ← Choose role
      </Link>
      <form onSubmit={submit}>
        <p className="eyebrow">NEXORA CMS</p>
        <h1>{title}</h1>
        <label>
          {label}
          <input
            required
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button">Sign in</button>
      </form>
    </section>
  );
}
