
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import connectDatabase from './config/database.js';
import Category from './models/Category.js';
import User from './models/User.js';

import { slugify } from './utils/slugGenerator.js';

import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import seoRoutes from './routes/seoRoutes.js';

import {
  updateEligibleScheduledPosts
} from './controllers/blogController.js';

// Temporary debugging: capture unhandled promise errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n========== UNHANDLED PROMISE REJECTION ==========');
  console.error('Actual reason:', reason);
  console.error('Error message:', reason?.message);
  console.error('Error stack:', reason?.stack);
  console.error('================================================\n');
});

// Handle unexpected errors
process.on('uncaughtException', (error) => {
  console.error('\n========== UNCAUGHT EXCEPTION ==========');
  console.error(error);
  console.error('========================================\n');

  process.exit(1);
});

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
  })
);

app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/seo', seoRoutes);

// Global error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'Image must be 5 MB or smaller'
    });
  }

  console.error('API Error:', err);

  res.status(500).json({
    message: 'Server error'
  });
});

// Initial categories
const initialCategories = [
  'Software Development',
  'Artificial Intelligence & Machine Learning',
  'Web and Mobile App Development',
  'Technology & Innovation',
  'Cybersecurity',
  'Cloud Computing',
  'Industry Insights'
];

// Create default categories if they do not exist
async function ensureInitialCategories() {
  for (const name of initialCategories) {
    const slug = slugify(name);

    await Category.updateOne(
      { slug },
      {
        $setOnInsert: {
          name,
          slug
        }
      },
      { upsert: true }
    );
  }

  console.log('Initial categories checked');
}

// Ensure optional email index supports users without email
async function ensureOptionalEmailIndex() {
  const indexes = await User.collection.indexes();

  const emailIndex = indexes.find(
    (index) =>
      Object.keys(index.key).length === 1 &&
      index.key.email === 1
  );

  if (emailIndex && !emailIndex.sparse) {
    await User.collection.dropIndex(emailIndex.name);
  }

  if (!emailIndex || !emailIndex.sparse) {
    await User.collection.createIndex(
      { email: 1 },
      {
        unique: true,
        sparse: true
      }
    );
  }

  console.log('Email index checked');
}

// Create the initial admin only if the account does not exist
async function ensureInitialAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminUsername = (
    process.env.ADMIN_USERNAME || 'admin'
  ).trim();

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log('Initial admin credentials not configured');
    return;
  }

  const existingAdmin = await User.findOne({
    $or: [
      { email: adminEmail },
      { username: adminUsername }
    ]
  });

  if (existingAdmin) {
    console.log(
      'Existing account found. Initial admin creation skipped.'
    );
    return;
  }

  try {
    await User.create({
      name: process.env.ADMIN_NAME || 'Administrator',
      email: adminEmail,
      username: adminUsername,
      password: adminPassword,
      role: 'admin'
    });

    console.log('Initial admin created successfully');
  } catch (error) {
    if (error.code === 11000) {
      const duplicateUser = await User.findOne({
        $or: [
          { email: adminEmail },
          { username: adminUsername }
        ]
      });

      if (duplicateUser) {
        console.log(
          'Admin account already exists. Skipping creation.'
        );
        return;
      }
    }

    throw error;
  }
}

// Run scheduled post updates safely
async function runScheduledPostUpdates() {
  try {
    await updateEligibleScheduledPosts();
  } catch (error) {
    console.error(
      'Scheduled posts update failed:',
      error
    );
  }
}

// Start server
async function startServer() {
  try {
    await connectDatabase();

    console.log('MongoDB connected');

    await ensureInitialCategories();
    await ensureOptionalEmailIndex();
    await ensureInitialAdmin();

    await runScheduledPostUpdates();

    setInterval(() => {
      runScheduledPostUpdates();
    }, 60000);

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`API running on ${PORT}`);
    });

  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
