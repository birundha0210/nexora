import Blog from '../models/Blog.js';
export async function ensureOwnership(req, res, next) { const post = await Blog.findById(req.params.id); if (!post) return res.status(404).json({ message: 'Post not found' }); if (req.user.role !== 'admin' && String(post.author) !== String(req.user._id)) return res.status(403).json({ message: 'You can only manage your own posts' }); req.post = post; next(); }
