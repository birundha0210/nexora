import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import BlogCard from "../../components/BlogCard";
import { createVideoEmbedNode, getVideoEmbed } from "../../utils/videoEmbed";
import "../../styles/blog-details.css";

const hasBlockMarkup =
  /<(h[1-6]|p|ul|ol|li|table|pre|figure|img|iframe|video|blockquote)\b/i;
const allowedTags = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);
const removedTags = new Set([
  "base",
  "embed",
  "form",
  "input",
  "link",
  "meta",
  "object",
  "script",
  "style",
  "svg",
]);

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );
}

function safeUrl(value, allowRelative = false) {
  try {
    const url = new URL(value, window.location.origin);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (!allowRelative || /^(https?:)?\/\//i.test(value)) return url.href;
    return value;
  } catch {
    return null;
  }
}

function articleHtml(content = "") {
  const trimmedContent = content
    .replace(
      /(^|[^<])\/(h[1-6]|p|ul|ol|li|blockquote|table|thead|tbody|tr|th|td|pre|code|figure|figcaption|a|strong|em|u)>/gi,
      "$1</$2>",
    )
    .trim();
  if (hasBlockMarkup.test(trimmedContent)) return trimmedContent;
  return trimmedContent
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map(
      (paragraph) =>
        "<p>" + escapeHtml(paragraph).replace(/\n/g, "<br />") + "</p>",
    )
    .join("");
}

function sanitizeArticleHtml(content) {
  const document = new DOMParser().parseFromString(
    articleHtml(content),
    "text/html",
  );

  Array.from(document.body.querySelectorAll("*")).forEach((element) => {
    const tag = element.tagName.toLowerCase();
    if (removedTags.has(tag)) {
      element.remove();
      return;
    }

    if (tag === "iframe") {
      const embed = getVideoEmbed(element.getAttribute("src") || "");
      if (!embed) {
        element.remove();
        return;
      }
      const replacement = createVideoEmbedNode(document, embed);
      if (element.parentElement?.tagName.toLowerCase() === "figure")
        element.parentElement.replaceWith(replacement);
      else element.replaceWith(replacement);
      return;
    }

    if (tag === "video") {
      const embed = getVideoEmbed(element.getAttribute("src") || "");
      if (!embed || embed.type !== "video") {
        element.remove();
        return;
      }
      const replacement = createVideoEmbedNode(document, embed);
      if (element.parentElement?.tagName.toLowerCase() === "figure")
        element.parentElement.replaceWith(replacement);
      else element.replaceWith(replacement);
      return;
    }

    if (!allowedTags.has(tag)) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const attributes = Array.from(element.attributes).map((attribute) => [
      attribute.name,
      attribute.value,
    ]);
    Array.from(element.attributes).forEach((attribute) =>
      element.removeAttribute(attribute.name),
    );

    if (tag === "div") {
      const className = attributes.find(([name]) => name === "class")?.[1];
      if (className === "embed-fallback")
        element.setAttribute("class", className);
      else element.replaceWith(...element.childNodes);
    }

    if (tag === "a") {
      const href = safeUrl(
        attributes.find(([name]) => name === "href")?.[1] || "",
        true,
      );
      if (!href) element.replaceWith(...element.childNodes);
      else {
        element.setAttribute("href", href);
        element.setAttribute("target", "_blank");
        element.setAttribute("rel", "noopener noreferrer");
      }
    }

    if (tag === "img") {
      const src = safeUrl(
        attributes.find(([name]) => name === "src")?.[1] || "",
        true,
      );
      if (!src) element.remove();
      else {
        element.setAttribute("src", src);
        element.setAttribute(
          "alt",
          attributes.find(([name]) => name === "alt")?.[1] || "",
        );
      }
    }
  });

  document.body
    .querySelectorAll(
      ".embed-fallback h1, .embed-fallback h2, .embed-fallback h3, .embed-fallback h4, .embed-fallback h5, .embed-fallback h6",
    )
    .forEach((heading) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = heading.textContent;
      heading.replaceWith(paragraph);
    });

  return document.body.innerHTML;
}

function addHeadingAnchors(content) {
  const headings = [];
  let index = 0;
  const html = content.replace(
    /<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, level, attributes, headingContent) => {
      const label = headingContent.replace(/<[^>]*>/g, "").trim();
      const id = "section-" + index++;
      headings.push({ id, label });
      return (
        "<h" +
        level +
        attributes +
        ' id="' +
        id +
        '">' +
        headingContent +
        "</h" +
        level +
        ">"
      );
    },
  );
  return { html, headings };
}

export default function BlogDetails() {
  const { slug } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/blogs/public/" + slug)
      .then((response) => setData(response.data))
      .catch(() => setData({ error: true }));
  }, [slug]);

  if (!data) return <p className="loading">Loading article…</p>;
  if (data.error)
    return (
      <section className="not-found">
        <h1>Article not found</h1>
        <Link to="/blogs">Return to articles</Link>
      </section>
    );

  const { post, related } = data;
  const { html, headings } = addHeadingAnchors(
    sanitizeArticleHtml(post.content),
  );
  const wordCount = html
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post.title);

  return (
    <article className="article">
      <header>
        <p className="eyebrow">{post.category?.name}</p>
        <h1>{post.title}</h1>
        <p className="article-dek">{post.shortDescription}</p>
        <div className="byline">
          By {post.author?.name || post.author?.username}
          <i>·</i>
          {new Date(post.publishedAt).toLocaleDateString()}
          <i>·</i>
          {Math.max(1, Math.ceil(wordCount / 220))} min read
        </div>
      </header>
      {post.featuredImage?.url && (
        <img
          className="article-image"
          src={post.featuredImage.url}
          alt={post.featuredImage.alt || post.title}
        />
      )}
      <div className="article-layout">
        {headings.length > 1 && (
          <aside className="toc">
            <b>On this page</b>
            <div>
              {headings.map((heading) => (
                <a href={"#" + heading.id} key={heading.id}>
                  {heading.label}
                </a>
              ))}
            </div>
          </aside>
        )}
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <section className="article-share" aria-label="Share this article">
        <span>Share this article</span>
        <div>
          <a
            href={
              "https://twitter.com/intent/tweet?text=" +
              shareTitle +
              "&url=" +
              shareUrl
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            X / Twitter
          </a>
          <a
            href={
              "https://www.linkedin.com/sharing/share-offsite/?url=" + shareUrl
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </section>
      {related.length > 0 && (
        <section className="related">
          <p className="eyebrow">KEEP READING</p>
          <h2>Related articles</h2>
          <div className="card-grid">
            {related.map((relatedPost) => (
              <BlogCard key={relatedPost._id} post={relatedPost} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
