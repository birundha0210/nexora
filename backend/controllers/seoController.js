import { sitemapXml } from "../services/sitemapService.js";

const FRONTEND_URL = "https://nexora-frontend-j8a4.onrender.com";

export async function sitemap(req, res) {
  res.type("application/xml").send(await sitemapXml(FRONTEND_URL));
}
