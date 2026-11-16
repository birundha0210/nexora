import Blog from "../models/Blog.js";

const escapeXml = (value) =>
  String(value).replace(
    /[<>&'"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character],
  );

export async function sitemapXml(baseUrl) {
  const posts = await Blog.find({
    status: "published",
    publishedAt: { $lte: new Date() },
  }).select("slug updatedAt publishedAt");

  const urls = posts.map((post) => {
    const lastModified = post.updatedAt ?? post.publishedAt;
    const lastModifiedDate = lastModified ? new Date(lastModified) : null;
    const lastmod =
      lastModifiedDate && Number.isFinite(lastModifiedDate.getTime())
        ? `<lastmod>${lastModifiedDate.toISOString()}</lastmod>`
        : "";

    return `<url><loc>${escapeXml(`${baseUrl}/blogs/${encodeURIComponent(post.slug)}`)}</loc>${lastmod}</url>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `<url><loc>${escapeXml(`${baseUrl}/`)}</loc></url>`,
    ...urls,
    "</urlset>",
  ].join("");
}
