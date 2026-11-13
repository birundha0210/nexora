import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const tokenFor = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
export async function login(req, res) { const { identifier, password, role } = req.body; const field = role === 'admin' ? 'email' : 'username'; const user = await User.findOne({ [field]: identifier, role }).select('+password'); if (!user || !(await user.matchesPassword(password))) return res.status(401).json({ message: 'Invalid credentials' }); if (user.accountStatus !== 'active') return res.status(403).json({ message: 'This account is inactive' }); res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email, username: user.username, role: user.role } }); }
export async function profile(req, res) { res.json({ user: req.user }); }
