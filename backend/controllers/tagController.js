import Tag from "../models/Tag.js";
import { slugify } from "../utils/slugGenerator.js";
export async function listTags(req, res) {
  res.json({ tags: await Tag.find().sort("name") });
}
export async function createTag(req, res) {
  const tag = await Tag.create({
    name: req.body.name,
    slug: slugify(req.body.name),
  });
  res.status(201).json({ tag });
}
export async function updateTag(req, res) {
  const tag = await Tag.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, slug: slugify(req.body.name) },
    { new: true },
  );
  res.json({ tag });
}
export async function deleteTag(req, res) {
  await Tag.findByIdAndDelete(req.params.id);
  res.status(204).end();
}
