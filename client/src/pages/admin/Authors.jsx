import React, { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import '../../styles/authors.css';

function EyeIcon({ visible }) {
  return visible ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.8 10.8 0 0 1 12 4c5.2 0 8.8 4.6 9.7 7.1a1.7 1.7 0 0 1 0 1.8 14.7 14.7 0 0 1-3.1 4.4M6.2 6.2A14.8 14.8 0 0 0 2.3 11a1.7 1.7 0 0 0 0 1.8C3.2 15.4 6.8 20 12 20c1.1 0 2.2-.2 3.2-.7" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.3 11.1a1.7 1.7 0 0 0 0 1.8C3.2 15.4 6.8 20 12 20s8.8-4.6 9.7-7.1a1.7 1.7 0 0 0 0-1.8C20.8 8.6 17.2 4 12 4S3.2 8.6 2.3 11.1Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

function CategorySelector({ categories, selectedIds, onChange, loading, labelId, placeholder = 'Choose one or more categories' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectorRef = useRef(null);
  const selectedCategories = categories.filter((category) => selectedIds.includes(category._id));
  const matchingCategories = categories.filter((category) => category.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const closeMenu = (event) => {
      if (!selectorRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const toggleCategory = (categoryId) => {
    onChange(selectedIds.includes(categoryId) ? selectedIds.filter((id) => id !== categoryId) : [...selectedIds, categoryId]);
  };

  return (
    <div className="author-category-selector" ref={selectorRef}>
      <div className={'category-selector' + (isOpen ? ' is-open' : '')} role="combobox" aria-expanded={isOpen} aria-haspopup="listbox" aria-labelledby={labelId}>
        <button className="category-selector-trigger" type="button" onClick={() => setIsOpen((open) => !open)} disabled={loading}>
          <span className="selected-category-chips">
            {selectedCategories.length ? selectedCategories.map((category) => (
              <span className="selected-category-chip" key={category._id}>
                {category.name}
                <span className="remove-category-chip" role="button" tabIndex={0} aria-label={'Remove ' + category.name} onClick={(event) => { event.stopPropagation(); toggleCategory(category._id); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); toggleCategory(category._id); } }}>×</span>
              </span>
            )) : <span className="category-selector-placeholder">{loading ? 'Loading categories…' : placeholder}</span>}
          </span>
          <span className="category-selector-chevron" aria-hidden="true">⌄</span>
        </button>
        {isOpen && (
          <div className="category-selector-menu">
            <div className="category-search-wrap"><input autoFocus type="search" aria-label="Search categories" placeholder="Search categories" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
            <div className="category-options" role="listbox" aria-multiselectable="true">
              {matchingCategories.length ? matchingCategories.map((category) => {
                const isSelected = selectedIds.includes(category._id);
                return <button className={'category-option' + (isSelected ? ' is-selected' : '')} type="button" role="option" aria-selected={isSelected} key={category._id} onClick={() => toggleCategory(category._id)}><span className="category-option-check" aria-hidden="true">{isSelected ? '✓' : ''}</span>{category.name}</button>;
              }) : <p className="category-no-results">No categories match “{query}”.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, required = false, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="author-field">
      <label htmlFor={id}>{label}</label>
      <div className="author-password-wrap">
        <input id={id} required={required} type={visible ? 'text' : 'password'} autoComplete={required ? 'new-password' : 'off'} placeholder={placeholder} value={value} onChange={onChange} />
        <button className="password-visibility-toggle" type="button" onClick={() => setVisible((isVisible) => !isVisible)} aria-label={visible ? 'Hide password' : 'Show password'} title={visible ? 'Hide password' : 'Show password'}><EyeIcon visible={visible} /></button>
      </div>
    </div>
  );
}

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', categories: [] });
  const [editForm, setEditForm] = useState(null);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [authorsError, setAuthorsError] = useState('');
  const [formError, setFormError] = useState('');
  const [editError, setEditError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadAuthors = async () => {
    setAuthorsLoading(true);
    setAuthorsError('');
    try {
      const response = await api.get('/authors');
      setAuthors(response.data.authors || []);
    } catch (error) {
      console.error('Failed to load authors:', error);
      setAuthorsError('We could not load authors. Please try again.');
    } finally {
      setAuthorsLoading(false);
    }
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setFormError('Categories could not be loaded. Refresh the page and try again.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
    loadCategories();
  }, []);

  const add = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!form.categories.length) return setFormError('Assign at least one category to this author.');
    setIsSubmitting(true);
    try {
      await api.post('/authors', form);
      setForm({ username: '', password: '', categories: [] });
      await loadAuthors();
    } catch (error) {
      console.error('Failed to create author:', error);
      setFormError(error.response?.data?.message || 'Could not create author.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (author) => {
    setEditError('');
    setEditForm({ id: author._id, username: author.username, password: '', categories: (author.categories || []).map((category) => category._id) });
  };

  const closeEdit = () => {
    if (!isSavingEdit) {
      setEditForm(null);
      setEditError('');
    }
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setEditError('');
    if (!editForm.categories.length) return setEditError('Assign at least one category to this author.');
    setIsSavingEdit(true);
    try {
      const payload = { username: editForm.username, categories: editForm.categories };
      if (editForm.password) payload.password = editForm.password;
      await api.put('/authors/' + editForm.id, payload);
      setEditForm(null);
      await loadAuthors();
    } catch (error) {
      console.error('Failed to update author:', error);
      setEditError(error.response?.data?.message || 'Could not update author.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <section className="author-management">
      <header className="author-page-heading"><p className="eyebrow">PEOPLE</p><h1>Author Management</h1><p>Create author accounts and assign the categories they can write about.</p></header>
      <section className="author-card" aria-labelledby="create-author-heading">
        <div className="author-card-heading"><div><h2 id="create-author-heading">Create author</h2><p>Set up secure credentials and content access for a new contributor.</p></div></div>
        <form className="author-form" onSubmit={add}>
          <div className="author-field"><label htmlFor="author-username">Username</label><input id="author-username" required autoComplete="username" placeholder="e.g. alex.writer" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></div>
          <PasswordField id="author-password" label="Password" required placeholder="Create a secure password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <div className="author-field author-category-field"><label id="assigned-categories-label">Assigned categories</label><CategorySelector categories={categories} selectedIds={form.categories} onChange={(selectedCategories) => { setForm({ ...form, categories: selectedCategories }); setFormError(''); }} loading={categoriesLoading} labelId="assigned-categories-label" /></div>
          {formError && <p className="author-form-error" role="alert">{formError}</p>}
          <button className="button create-author-button" type="submit" disabled={isSubmitting || categoriesLoading}>{isSubmitting ? 'Creating author…' : 'Create author'}</button>
        </form>
      </section>
      <section className="author-list-section" aria-labelledby="existing-authors-heading">
        <div className="author-list-heading"><div><p className="eyebrow">TEAM</p><h2 id="existing-authors-heading">Existing authors</h2></div>{!authorsLoading && !authorsError && <span className="author-count">{authors.length} {authors.length === 1 ? 'author' : 'authors'}</span>}</div>
        {authorsLoading && <div className="author-state" role="status">Loading authors…</div>}
        {authorsError && <div className="author-state author-state-error" role="alert"><span>{authorsError}</span><button type="button" onClick={loadAuthors}>Try again</button></div>}
        {!authorsLoading && !authorsError && !authors.length && <div className="author-state">No authors yet. Create your first contributor above.</div>}
        {!authorsLoading && !authorsError && authors.length > 0 && <div className="author-list">{authors.map((author) => (
          <article className="author-row" key={author._id}>
            <div className="author-identity"><span className="author-avatar" aria-hidden="true">{author.username?.slice(0, 1).toUpperCase()}</span><div><h3>@{author.username}</h3><p>Contributor account</p></div></div>
            <div className="author-assigned-categories"><span className="author-row-label">Assigned categories</span><div className="author-category-badges">{author.categories?.length ? author.categories.map((category) => <span className="author-category-badge" key={category._id}>{category.name}</span>) : <span className="author-no-categories">No categories assigned</span>}</div></div>
            <div className="author-row-actions"><span className={'author-status author-status-' + (author.accountStatus || 'active')}>{author.accountStatus || 'active'}</span><button className="author-edit-button" type="button" onClick={() => openEdit(author)} aria-label={'Edit ' + author.username}>Edit</button></div>
          </article>
        ))}</div>}
      </section>
      {editForm && (
        <div className="author-modal-backdrop" role="presentation" onMouseDown={closeEdit}>
          <section className="author-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-author-heading" onMouseDown={(event) => event.stopPropagation()}>
            <div className="author-modal-heading"><div><p className="eyebrow">AUTHOR ACCOUNT</p><h2 id="edit-author-heading">Edit @{editForm.username}</h2></div><button className="author-modal-close" type="button" onClick={closeEdit} aria-label="Close edit author form">×</button></div>
            <p className="author-modal-description">Update the author’s username, category access, or set a new password. Their existing password is never shown.</p>
            <form className="author-edit-form" onSubmit={saveEdit}>
              <div className="author-field"><label htmlFor="edit-author-username">Username</label><input id="edit-author-username" required autoComplete="username" value={editForm.username} onChange={(event) => setEditForm({ ...editForm, username: event.target.value })} /></div>
              <PasswordField id="edit-author-password" label="Set new password (optional)" placeholder="Leave blank to keep the current password" value={editForm.password} onChange={(event) => setEditForm({ ...editForm, password: event.target.value })} />
              <div className="author-field author-category-field"><label id="edit-assigned-categories-label">Assigned categories</label><CategorySelector categories={categories} selectedIds={editForm.categories} onChange={(selectedCategories) => { setEditForm({ ...editForm, categories: selectedCategories }); setEditError(''); }} loading={categoriesLoading} labelId="edit-assigned-categories-label" /></div>
              {editError && <p className="author-form-error" role="alert">{editError}</p>}
              <div className="author-modal-actions"><button className="author-cancel-button" type="button" onClick={closeEdit} disabled={isSavingEdit}>Cancel</button><button className="button" type="submit" disabled={isSavingEdit || categoriesLoading}>{isSavingEdit ? 'Saving changes…' : 'Save changes'}</button></div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
