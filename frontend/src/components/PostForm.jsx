
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import RichTextEditor from './RichTextEditor';
import '../styles/create-new-post.css';

const initialForm = {
  title: '',
  slug: '',
  content: '',
  author: '',
  category: '',
  tags: [],
  status: 'draft',
  seoTitle: '',
  metaDescription: '',
  scheduledAt: '',
  featured: false,
  featuredImage: {
    url: '',
    publicId: '',
    alt: ''
  }
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function PostForm({ role, postId }) {
  const navigate = useNavigate();
  const isAuthor = role === 'author';
  const isEditing = Boolean(postId);

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPostLoading, setIsPostLoading] = useState(isEditing);
  const [referenceDataLoading, setReferenceDataLoading] = useState({
    authors: !isAuthor && !isEditing,
    categories: true,
    tags: true
  });
  const [referenceDataError, setReferenceDataError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    const loadData = async () => {
      const needsAuthors = !isAuthor && !isEditing;
      const categoryUrl = isAuthor
        ? '/categories/available'
        : '/categories';

      setReferenceDataError('');
      setReferenceDataLoading({
        authors: needsAuthors,
        categories: true,
        tags: true
      });

      // These lists are independent. In particular, a failed protected tags
      // request must not prevent the available authors and categories from
      // being rendered in the post form.
      const [categoryResult, tagResult, authorResult] = await Promise.allSettled([
        api.get(categoryUrl),
        api.get('/tags'),
        needsAuthors ? api.get('/authors/available') : Promise.resolve(null)
      ]);

      if (!isCurrent) return;

      const errors = [];

      if (categoryResult.status === 'fulfilled') {
        setCategories(categoryResult.value.data.categories || []);
      } else {
        setCategories([]);
        errors.push(
          `Could not load categories: ${
            categoryResult.reason.response?.data?.message ||
            'please refresh the page and try again.'
          }`
        );
      }

      if (tagResult.status === 'fulfilled') {
        setTags(tagResult.value.data.tags || []);
      } else {
        setTags([]);
        errors.push(
          `Could not load tags: ${
            tagResult.reason.response?.data?.message ||
            'please refresh the page and try again.'
          }`
        );
      }

      if (needsAuthors) {
        if (authorResult.status === 'fulfilled') {
          setAuthors(authorResult.value.data.authors || []);
        } else {
          setAuthors([]);
          errors.push(
            `Could not load authors: ${
              authorResult.reason.response?.data?.message ||
              'please refresh the page and try again.'
            }`
          );
        }
      }

      setReferenceDataLoading({
        authors: false,
        categories: false,
        tags: false
      });
      setReferenceDataError(errors.join(' '));
    };

    loadData();

    return () => {
      isCurrent = false;
    };
  }, [isAuthor, isEditing]);

  useEffect(() => {
    if (!isEditing) return;

    api.get(`/blogs/${postId}`)
      .then((response) => {
        const post = response.data.post;
        setForm({
          ...initialForm,
          title: post.title,
          slug: post.slug,
          content: post.content,
          author: '',
          category: post.category?._id || post.category,
          tags: (post.tags || []).map((tag) => tag._id || tag),
          status: post.status,
          seoTitle: post.seoTitle || '',
          metaDescription: post.metaDescription || '',
          scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
          featured: Boolean(post.featured),
          featuredImage: { ...initialForm.featuredImage, ...post.featuredImage }
        });
        setIsSlugEdited(true);
      })
      .catch((error) => setMessage(error.response?.data?.message || 'Could not load this post.'))
      .finally(() => setIsPostLoading(false));
  }, [isEditing, postId]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const setTitle = (title) => {
    setForm((current) => ({
      ...current,
      title,
      slug: isSlugEdited ? current.slug : slugify(title)
    }));
  };

  const uploadFeaturedImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage('Only JPG, PNG and WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5 MB.');
      return;
    }

    setMessage('');
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/media/upload', formData);

      setForm((current) => ({
        ...current,
        featuredImage: {
          ...current.featuredImage,
          ...response.data.image
        }
      }));
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        'Featured image upload failed. Check backend connection.'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!form.featuredImage.url) {
      setMessage('Please upload a featured image.');
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/blogs/${postId}`, form);
      } else {
        // The existing Blog model requires this field, but it is intentionally not exposed in this form.
        await api.post('/blogs', { ...form, shortDescription: form.title });
      }
      navigate(isAuthor ? '/author/posts' : '/admin/posts', {
        state: isEditing ? { message: 'Post updated successfully.' } : undefined
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        'Could not save post. Please check the backend.'
      );
    }
  };

  return (
    <section className="post-editor">
      <p className="eyebrow">
        {isAuthor ? 'MY WRITING' : 'POST MANAGEMENT'}
      </p>

      <h1>{isEditing ? 'Edit post' : 'Create new post'}</h1>

      {isPostLoading ? <p className="loading">Loading post…</p> : <form onSubmit={save}>
        <label>
          Article title
          <input
            required
            value={form.title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label>
          Slug
          <input
            required
            value={form.slug}
            onChange={(event) => {
              setIsSlugEdited(true);
              updateField('slug', event.target.value);
            }}
          />
        </label>

        <div className="featured-image-field post-form-wide">
          <label htmlFor={`featured-image-${role}`}>
            Featured / thumbnail image
            <small>
              JPG, PNG, or WebP up to 5 MB. This image is used on blog cards.
            </small>
          </label>

          <div className="featured-image-upload">
            <input
              id={`featured-image-${role}`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={uploadFeaturedImage}
              disabled={isUploadingImage}
            />

            <span>
              {isUploadingImage ? 'Uploading image...' : 'Upload image'}
            </span>
          </div>

          {form.featuredImage.url && (
            <img
              className="featured-image-preview"
              src={form.featuredImage.url}
              alt="Featured image preview"
            />
          )}
        </div>

        {!isAuthor && !isEditing && (
          <label>
            Author
            <select
              required
              value={form.author}
              onChange={(event) => updateField('author', event.target.value)}
              disabled={referenceDataLoading.authors}
            >
              <option value="">
                {referenceDataLoading.authors ? 'Loading authors...' : 'Select author'}
              </option>
              {authors.map((author) => (
                <option key={author._id} value={author._id}>
                  {author.name || author.username}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Category
          <select
            required
            value={form.category}
            onChange={(event) => updateField('category', event.target.value)}
            disabled={referenceDataLoading.categories}
          >
            <option value="">
              {referenceDataLoading.categories ? 'Loading categories...' : 'Select category'}
            </option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tags
          <select
            multiple
            value={form.tags}
            onChange={(event) =>
              updateField(
                'tags',
                Array.from(
                  event.target.selectedOptions,
                  (option) => option.value
                )
              )
            }
            disabled={referenceDataLoading.tags}
          >
            {tags.map((tag) => (
              <option key={tag._id} value={tag._id}>
                {tag.name}
              </option>
            ))}
          </select>
        </label>

        <RichTextEditor
          value={form.content}
          onChange={(content) => updateField('content', content)}
        />

        <fieldset>
          <legend>Publishing</legend>

          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </label>

          <label className="check">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                updateField('featured', event.target.checked)
              }
            />
            Mark as featured article
          </label>

          {form.status === 'scheduled' && (
            <label>
              Publish on
              <input
                type="datetime-local"
                required
                value={form.scheduledAt}
                onChange={(event) =>
                  updateField('scheduledAt', event.target.value)
                }
              />
            </label>
          )}
        </fieldset>

        <fieldset>
          <legend>SEO</legend>

          <label>
            SEO title
            <input
              value={form.seoTitle}
              onChange={(event) => updateField('seoTitle', event.target.value)}
            />
          </label>

          <label>
            Meta description
            <textarea
              value={form.metaDescription}
              onChange={(event) =>
                updateField('metaDescription', event.target.value)
              }
            />
          </label>
        </fieldset>

        {(message || referenceDataError) && <p className="form-error">{message || referenceDataError}</p>}

        <button className="button" type="submit" disabled={isUploadingImage}>
          {isUploadingImage ? 'Please wait...' : 'Save post'}
        </button>
      </form>}
    </section>
  );
}
