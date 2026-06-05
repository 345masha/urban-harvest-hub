// Location: urban-harvest-hub/backend/routes/users.js
import express from 'express';
import { dbAll, dbGet, dbRun } from '../db/database.js';

const router = express.Router();

// User Login (Admin authentication and standard user sessions)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await dbGet('SELECT id, name, email, role FROM users WHERE email = ? AND password = ?', [email, password]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (Admin CRUD - Read)
router.get('/', async (req, res) => {
  try {
    const users = await dbAll('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user (Admin CRUD - Create)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const result = await dbRun(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role || 'user']
    );

    res.status(201).json({
      id: result.insertId || result.id,
      name,
      email,
      role: role || 'user'
    });
  } catch (error) {
    if (error.message.includes('UNIQUE') || error.message.includes('duplicate')) {
      return res.status(400).json({ error: 'Email is already registered' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update user role/profile (Admin CRUD - Update)
router.put('/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const { id } = req.params;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    await dbRun(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );

    const user = await dbGet('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (Admin CRUD - Delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
