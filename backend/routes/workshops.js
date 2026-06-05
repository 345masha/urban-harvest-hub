import express from 'express';
import { dbAll, dbGet, dbRun } from '../db/database.js';

const router = express.Router();

// Get all workshops with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM workshops WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY date ASC';

    const workshops = await dbAll(sql, params);
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single workshop
router.get('/:id', async (req, res) => {
  try {
    const workshop = await dbGet('SELECT * FROM workshops WHERE id = ?', [req.params.id]);
    if (!workshop) {
      return res.status(404).json({ error: 'Workshop not found' });
    }
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create workshop (admin)
router.post('/', async (req, res) => {
  try {
    const { title, description, fullDescription, price, category, image, date, time, location, spots, instructor } = req.body;

    if (!title || !price || !date || !time || !location || !instructor) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await dbRun(
      'INSERT INTO workshops (title, description, fullDescription, price, category, image, date, time, location, spots, instructor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, fullDescription, price, category, image, date, time, location, spots || 0, instructor]
    );

    res.status(201).json({ id: result.id, title, date, time, location, instructor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update workshop (admin)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, fullDescription, price, category, image, date, time, location, spots, instructor } = req.body;
    const { id } = req.params;

    await dbRun(
      'UPDATE workshops SET title = ?, description = ?, fullDescription = ?, price = ?, category = ?, image = ?, date = ?, time = ?, location = ?, spots = ?, instructor = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, fullDescription, price, category, image, date, time, location, spots, instructor, id]
    );

    const workshop = await dbGet('SELECT * FROM workshops WHERE id = ?', [id]);
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete workshop (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM workshops WHERE id = ?', [id]);
    res.json({ message: 'Workshop deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
