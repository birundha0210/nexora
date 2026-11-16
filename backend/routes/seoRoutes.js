import { Router } from "express";
import { sitemap } from "../controllers/seoController.js";
const router = Router();
router.get("/sitemap.xml", sitemap);
export default router;
