import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/all-posts.css';

export default function AllPosts({ status, title = 'All posts' }) {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  const loadPosts = async () => {
    setError('');
    try {
      const response = await api.get('/blogs' + (status ? '?status=' + status : ''));
      setPosts(response.data.posts);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load posts.');
    }
  };

  useEffect(() => {
    loadPosts();
  }, [status]);

  const removePost = async (post) => {
    if (!window.confirm('Delete “‘' + post.title + '”? This cannot be undone.')) return;
    setError('');
    try {
      await api.delete('/blogs/' + post._id);
      await loadPosts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete this post.');
    }
  };

  return (
    <section className="management">
      <div className="page-top">
        <div><p className="eyebrow">POST MANAGEMENT</p><h1>{title}</h1></div>
        <Link className="button" to="/admin/create-post">Create new post</Link>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="post-table">
        <div className="post-head"><span>Article</span><span>Author</span><span>Status</span><span>Updated</span><span>Actions</span></div>
        {posts.map((post) => (
          <div className="post-row" key={post._id}>
            <span><b>{post.title}</b><small>{post.category?.name}</small></span>
            <span>{post.author?.name || post.author?.username}</span>
            <span className={'status ' + post.status}>{post.status}</span>
            <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
            <span className="post-actions">
              <Link className="post-edit-action" to={'/admin/posts/' + post._id + '/edit'}>Edit</Link>
              <button className="post-delete-action" type="button" onClick={() => removePost(post)}>Delete</button>
            </span>
          </div>
        ))}
        {!posts.length && <p className="empty-note">No posts in this view.</p>}
      </div>
    </section>
  );
}
