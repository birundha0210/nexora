import { Router } from "express";
import * as c from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();
router.get("/", c.listCategories);
router.get(
  "/available",
  protect,
  allowRoles("admin", "author"),
  c.listAvailableCategories,
);
router.post("/", protect, allowRoles("admin"), c.createCategory);
router.put("/:id", protect, allowRoles("admin"), c.updateCategory);
router.delete("/:id", protect, allowRoles("admin"), c.deleteCategory);

export default router;
