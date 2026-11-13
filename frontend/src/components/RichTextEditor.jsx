import React, { useRef, useState } from 'react';
import api from '../services/api';
import { createVideoEmbedNode, getVideoEmbed } from '../utils/videoEmbed';
import '../styles/rich-text-editor.css';

export default function RichTextEditor({ value, onChange }) {
  const textareaRef = useRef(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const insertHtml = (html, selectText = false) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end) || 'Text';
    const snippet = selectText ? html.replace('Text', selectedText) : html;
    const nextValue = value.slice(0, start) + snippet + value.slice(end);
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea?.focus();
      const cursor = start + snippet.length;
      textarea?.setSelectionRange(cursor, cursor);
    });
  };

  const insertLink = () => {
    const url = window.prompt('Enter the link URL');
    if (url) insertHtml('<a href="' + url + '" target="_blank" rel="noopener noreferrer">Text</a>', true);
  };

  const insertVideo = () => {
    const url = window.prompt('Paste a YouTube URL, direct MP4 URL, or valid embed URL');
    if (!url) return;
    const embed = getVideoEmbed(url);
    if (!embed) {
      setUploadError('Use a YouTube URL, direct MP4 URL, or a valid provider embed URL. Ordinary webpages cannot be embedded.');
      return;
    }

    const container = document.createElement('div');
    container.append(createVideoEmbedNode(document, embed));
    insertHtml(container.innerHTML);
  };

  const uploadInlineImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setUploadError('Use a JPG, PNG, or WebP image smaller than 5 MB.');
      return;
    }

    setUploadError('');
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('alt', file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
      const response = await api.post('/media/upload', formData);
      const image = response.data.image;
      insertHtml('<figure><img src="' + image.url + '" alt="' + (image.alt || '') + '"></figure>');
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="editor">
      <label htmlFor="article-content">Article content</label>
      <p>Use the tools below or edit the HTML directly for headings, links, tables, videos, and code.</p>
      <div className="editor-toolbar" aria-label="Content tools">
        <button type="button" onClick={() => insertHtml('<h2>Text</h2>', true)}>Heading</button>
        <button type="button" onClick={() => insertHtml('<p>Text</p>', true)}>Paragraph</button>
        <button type="button" onClick={() => insertHtml('<strong>Text</strong>', true)}>Bold</button>
        <button type="button" onClick={() => insertHtml('<em>Text</em>', true)}>Italic</button>
        <button type="button" onClick={() => insertHtml('<u>Text</u>', true)}>Underline</button>
        <button type="button" onClick={insertLink}>Link</button>
        <button type="button" onClick={() => insertHtml('<ul><li>List item</li><li>List item</li></ul>')}>List</button>
        <button type="button" onClick={() => insertHtml('<table><thead><tr><th>Heading</th><th>Heading</th></tr></thead><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table>')}>Table</button>
        <button type="button" onClick={() => insertHtml('<pre><code>// Code snippet</code></pre>')}>Code</button>
        <button type="button" onClick={insertVideo}>Video</button>
        <label className="editor-image-upload">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadInlineImage} disabled={isUploading} />
          {isUploading ? 'Uploading image…' : 'Add image'}
        </label>
      </div>
      {uploadError && <p className="editor-error" role="alert">{uploadError}</p>}
      <textarea ref={textareaRef} id="article-content" required value={value} onChange={(event) => onChange(event.target.value)} placeholder="<h2>Start writing</h2><p>Your article content…</p>" />
    </div>
  );
}
