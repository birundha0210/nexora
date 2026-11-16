import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import AuthorLayout from "./layouts/AuthorLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/public/Home";
import BlogListing from "./pages/public/BlogListing";
import Categories from "./pages/public/Categories";
import BlogDetails from "./pages/public/BlogDetails";
import RoleSelection from "./pages/auth/RoleSelection";
import AdminLogin from "./pages/auth/AdminLogin";
import AuthorLogin from "./pages/auth/AuthorLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AllPosts";
import AdminCreate from "./pages/admin/CreateNewPost";
import AdminEdit from "./pages/admin/EditPost";
import AdminDrafts from "./pages/admin/Drafts";
import AdminPublished from "./pages/admin/Published";
import AdminUnpublished from "./pages/admin/Unpublished";
import AdminScheduled from "./pages/admin/Scheduled";
import AdminCategories from "./pages/admin/Categories";
import Tags from "./pages/admin/Tags";
import Authors from "./pages/admin/Authors";
import Media from "./pages/admin/Media";
import SEO from "./pages/admin/SEOSettings";
import Featured from "./pages/admin/FeaturedArticles";
import AuthorDashboard from "./pages/author/AuthorDashboard";
import MyPosts from "./pages/author/MyPosts";
import AuthorPosts from "./pages/author/AllPosts";
import AuthorCreate from "./pages/author/CreateNewPost";
import AuthorEdit from "./pages/author/EditPost";
import AuthorDrafts from "./pages/author/Drafts";
import AuthorPublished from "./pages/author/Published";
import AuthorUnpublished from "./pages/author/Unpublished";
import AuthorScheduled from "./pages/author/Scheduled";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<BlogListing />} />
        <Route path="/blogs/:slug" element={<BlogDetails />} />
        <Route path="/categories" element={<Categories />} />
      </Route>
      <Route path="/login" element={<RoleSelection />} />
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/login/author" element={<AuthorLogin />} />
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="posts/:id/edit" element={<AdminEdit />} />
          <Route path="create-post" element={<AdminCreate />} />
          <Route path="drafts" element={<AdminDrafts />} />
          <Route path="published" element={<AdminPublished />} />
          <Route path="unpublished" element={<AdminUnpublished />} />
          <Route path="scheduled" element={<AdminScheduled />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="tags" element={<Tags />} />
          <Route path="authors" element={<Authors />} />
          <Route path="media" element={<Media />} />
          <Route path="seo" element={<SEO />} />
          <Route path="featured" element={<Featured />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute role="author" />}>
        <Route path="/author" element={<AuthorLayout />}>
          <Route index element={<AuthorDashboard />} />
          <Route path="posts" element={<AuthorPosts />} />
          <Route path="posts/:id/edit" element={<AuthorEdit />} />
          <Route path="my-posts" element={<MyPosts />} />
          <Route path="create-post" element={<AuthorCreate />} />
          <Route path="drafts" element={<AuthorDrafts />} />
          <Route path="published" element={<AuthorPublished />} />
          <Route path="unpublished" element={<AuthorUnpublished />} />
          <Route path="scheduled" element={<AuthorScheduled />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
