import { sitemapXml } from '../services/sitemapService.js';
export async function sitemap(req, res) { res.type('application/xml').send(await sitemapXml(process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`)); }
