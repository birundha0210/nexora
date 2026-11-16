import Category from "../models/Category.js";
import { slugify } from "../utils/slugGenerator.js";
export async function listCategories(req, res) {
  res.json({ categories: await Category.find().sort("name") });
}
export async function listAvailableCategories(req, res) {
  const filter =
    req.user.role === "admin" ? {} : { _id: { $in: req.user.categories } };
  res.json({ categories: await Category.find(filter).sort("name") });
}
export async function createCategory(req, res) {
  const category = await Category.create({
    ...req.body,
    slug: slugify(req.body.name),
  });
  res.status(201).json({ category });
}
export async function updateCategory(req, res) {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { ...req.body, slug: req.body.name ? slugify(req.body.name) : undefined },
    { new: true, runValidators: true },
  );
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json({ category });
}
export async function deleteCategory(req, res) {
  await Category.findByIdAndDelete(req.params.id);
  res.status(204).end();
}
