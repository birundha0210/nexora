import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/public-layout.css";
export default function PublicLayout() {
  return (
    <>
      <Header />
      <main className="public-main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
