import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Admins still use their existing name/email credentials. Authors use only a username.
  name: { type: String, required() { return this.role === 'admin'; }, trim: true },
  email: { type: String, required() { return this.role === 'admin'; }, unique: true, sparse: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'author'], required: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  accountStatus: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

userSchema.path('categories').validate(function validateAuthorCategories(categories) {
  return this.role !== 'author' || categories.length > 0;
}, 'Authors must be assigned at least one category');

userSchema.pre('save', async function hashPassword(next) { if (!this.isModified('password')) return next(); this.password = await bcrypt.hash(this.password, 12); next(); });
userSchema.methods.matchesPassword = function matchesPassword(password) { return bcrypt.compare(password, this.password); };
export default mongoose.model('User', userSchema);
