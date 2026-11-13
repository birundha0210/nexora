
import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { slugify } from '../utils/slugGenerator.js';

const populated = (query) =>
  query
    .populate('author', 'name username')
    .populate('category', 'name slug')
    .populate('tags', 'name slug');

async function categoryAccessError(user, categoryId) {
  if (!mongoose.isValidObjectId(categoryId)) {
    return 'A valid category is required';
  }

  const categoryExists = await Category.exists({
    _id: categoryId
  });

  if (!categoryExists) {
    return 'Selected category does not exist';
  }

  if (
    user.role === 'author' &&
    !user.categories.some(
      (id) => String(id) === String(categoryId)
    )
  ) {
    return 'You can only use categories assigned to your account';
  }

  return null;
}

// Get published blog posts
export async function listPublic(req, res) {
  const {
    category,
    search,
    page = 1,
    limit = 9
  } = req.query;

  const filter = {
    status: 'published',
    publishedAt: { $lte: new Date() }
  };

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const [posts, total] = await Promise.all([
    populated(
      Blog.find(filter)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
    ),
    Blog.countDocuments(filter)
  ]);

  res.json({
    posts,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit)
  });
}

// Get one published blog post
export async function getPublic(req, res) {
  const post = await populated(
    Blog.findOne({
      slug: req.params.slug,
      status: 'published',
      publishedAt: { $lte: new Date() }
    })
  );

  if (!post) {
    return res.status(404).json({
      message: 'Article not found'
    });
  }

  const related = await populated(
    Blog.find({
      _id: { $ne: post._id },
      category: post.category._id,
      status: 'published',
      publishedAt: { $lte: new Date() }
    }).limit(3)
  );

  res.json({ post, related });
}

// Get posts managed by the logged-in user
export async function listManaged(req, res) {
  const filter =
    req.user.role === 'admin'
      ? {}
      : { author: req.user._id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  res.json({
    posts: await populated(
      Blog.find(filter).sort({ updatedAt: -1 })
    )
  });
}

// Get one managed post after ownership authorization has been applied.
export async function getManagedPost(req, res) {
  const post = await populated(Blog.findById(req.post._id));
  return res.json({ post });
}

// Create a new blog post
export async function createPost(req, res) {
  const data = { ...req.body };

  const error = await categoryAccessError(
    req.user,
    data.category
  );

  if (error) {
    return res.status(400).json({
      message: error
    });
  }

  let authorId = req.user._id;
  if (req.user.role === 'admin') {
    if (!mongoose.isValidObjectId(data.author)) {
      return res.status(400).json({ message: 'A valid active author is required' });
    }
    const author = await User.exists({ _id: data.author, role: 'author', accountStatus: 'active' });
    if (!author) {
      return res.status(400).json({ message: 'Selected author is unavailable' });
    }
    authorId = data.author;
  }

  // Authors cannot select or impersonate another author; their JWT identity is always used.
  delete data.author;
  delete data._id;

  const baseSlug = slugify(data.slug || data.title);

  let slug = baseSlug;
  let count = 1;

  while (await Blog.exists({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  if (data.status === 'published') {
    data.publishedAt = new Date();
  }

  const post = await Blog.create({
    ...data,
    slug,
    author: authorId
  });

  return res.status(201).json({
    post: await populated(
      Blog.findById(post._id)
    )
  });
}

// Update an existing blog post
export async function updatePost(req, res) {
  const data = { ...req.body };

  delete data.author;
  delete data._id;

  if (data.category !== undefined) {
    const error = await categoryAccessError(
      req.user,
      data.category
    );

    if (error) {
      return res.status(400).json({
        message: error
      });
    }
  }

  if (data.title || data.slug) {
    data.slug = slugify(data.slug || data.title);
  }

  if (
    data.status === 'published' &&
    req.post.status !== 'published'
  ) {
    data.publishedAt = new Date();
  }

  Object.assign(req.post, data);

  await req.post.save();

  return res.json({
    post: await populated(
      Blog.findById(req.post._id)
    )
  });
}

// Delete a blog post
export async function deletePost(req, res) {
  await req.post.deleteOne();

  res.status(204).end();
}

// Publish scheduled posts whose scheduled time has arrived
export async function updateEligibleScheduledPosts() {
  try {
    const result = await Blog.updateMany(
      {
        status: 'scheduled',
        scheduledAt: { $lte: new Date() }
      },
      {
        $set: {
          status: 'published',
          publishedAt: new Date()
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `${result.modifiedCount} scheduled post(s) published`
      );
    }

    return result;
  } catch (error) {
    console.error(
      'Scheduled posts database update error:',
      error
    );

    throw error;
  }
}
