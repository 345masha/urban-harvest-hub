import express from 'express';
import { dbAll, dbGet, dbRun } from '../db/database.js';

const router = express.Router();

// Get all events with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM events WHERE 1=1';
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

    const events = await dbAll(sql, params);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await dbGet('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event (admin)
router.post('/', async (req, res) => {
  try {
    const { title, description, fullDescription, price, category, image, date, time, location, spots, organizer } = req.body;

    // Validation
    const errors = [];
    if (!title || typeof title !== 'string') errors.push('Valid title is required');
    if (!date) errors.push('Date is required');
    if (!time) errors.push('Time is required');
    if (!location || typeof location !== 'string') errors.push('Valid location is required');
    if (!organizer || typeof organizer !== 'string') errors.push('Valid organizer is required');
    if (price !== undefined && (isNaN(price) || price < 0)) errors.push('Price must be a positive number');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const result = await dbRun(
      'INSERT INTO events (title, description, fullDescription, price, category, image, date, time, location, spots, organizer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, fullDescription, price || 0, category, image, date, time, location, spots || 0, organizer]
    );

    res.status(201).json({ id: result.id, title, date, time, location, organizer });
  } catch (error) {
    res.status(500).json({ error: 'Database error occurred while creating event', details: error.message });
  }
});

//put details
router.put('/api/events/:id', async (req, res) => {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    await event.update(req.body);

    res.json(event);
});

// Update event (admin)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, fullDescription, price, category, image, date, time, location, spots, organizer } = req.body;
    const { id } = req.params;

    // Validation
    const errors = [];
    if (!title || typeof title !== 'string') errors.push('Valid title is required');
    if (!date) errors.push('Date is required');
    if (!time) errors.push('Time is required');
    if (!location || typeof location !== 'string') errors.push('Valid location is required');
    if (!organizer || typeof organizer !== 'string') errors.push('Valid organizer is required');
    if (price !== undefined && (isNaN(price) || price < 0)) errors.push('Price must be a positive number');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    await dbRun(
      'UPDATE events SET title = ?, description = ?, fullDescription = ?, price = ?, category = ?, image = ?, date = ?, time = ?, location = ?, spots = ?, organizer = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, fullDescription, price || 0, category, image, date, time, location, spots, organizer, id]
    );

    const event = await dbGet('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found after update' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Database error occurred while updating event', details: error.message });
  }
});

// Delete event (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM events WHERE id = ?', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
