import User from "../models/User.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";

async function validCategoryIds(categoryIds) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) return null;

  const ids = [...new Set(categoryIds.map(String))];
  if (ids.some((id) => !mongoose.isValidObjectId(id))) return null;

  const count = await Category.countDocuments({ _id: { $in: ids } });
  return count === ids.length ? ids : null;
}

export async function listAuthors(req, res) {
  const authors = await User.find({ role: "author" })
    .select("-password")
    .populate("categories", "name slug")
    .sort("-createdAt");
  res.json({ authors });
}

export async function listAvailableAuthors(req, res) {
  const authors = await User.find({ role: "author", accountStatus: "active" })
    .select("name username")
    .sort({ name: 1, username: 1 });
  res.json({ authors });
}

export async function createAuthor(req, res) {
  try {
    const username = req.body.username?.trim();
    const { password } = req.body;
    const categories = await validCategoryIds(req.body.categories);

    if (!username || !password || !categories) {
      return res.status(400).json({
        message:
          "Username, password, and at least one valid category are required",
      });
    }

    if (await User.exists({ username })) {
      return res.status(409).json({ message: "Username is already in use" });
    }

    // The schema pre-save hook hashes the password before this document is stored.
    const author = await User.create({
      username,
      password,
      categories,
      role: "author",
    });
    return res.status(201).json({
      author: {
        id: author._id,
        username: author.username,
        categories: author.categories,
      },
    });
  } catch (error) {
    if (error?.code === 11000)
      return res.status(409).json({ message: "Username is already in use" });
    if (error?.name === "ValidationError")
      return res.status(400).json({ message: error.message });
    console.error("Failed to create author:", error);
    return res.status(500).json({ message: "Could not create author" });
  }
}
export async function updateAuthor(req, res) {
  try {
    const username = req.body.username?.trim();
    const categories = await validCategoryIds(req.body.categories);
    const password = req.body.password?.trim();

    if (!username || !categories) {
      return res.status(400).json({
        message: "Username and at least one valid category are required",
      });
    }

    // This role condition prevents this author-only endpoint from ever editing an admin.
    const author = await User.findOne({
      _id: req.params.id,
      role: "author",
    }).select("+password");
    if (!author) return res.status(404).json({ message: "Author not found" });

    if (
      username !== author.username &&
      (await User.exists({ username, _id: { $ne: author._id } }))
    ) {
      return res.status(409).json({ message: "Username is already in use" });
    }

    author.username = username;
    author.categories = categories;
    if (password) author.password = password;
    await author.save();

    const updatedAuthor = await User.findById(author._id)
      .select("-password")
      .populate("categories", "name slug");
    return res.json({ author: updatedAuthor });
  } catch (error) {
    if (error?.code === 11000)
      return res.status(409).json({ message: "Username is already in use" });
    if (error?.name === "ValidationError")
      return res.status(400).json({ message: error.message });
    console.error("Failed to update author:", error);
    return res.status(500).json({ message: "Could not update author" });
  }
}
