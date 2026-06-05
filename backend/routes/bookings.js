import express from 'express';
import { dbAll, dbGet, dbRun } from '../db/database.js';

const router = express.Router();

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await dbAll('SELECT * FROM bookings ORDER BY created_at DESC');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bookings by email
router.get('/email/:email', async (req, res) => {
  try {
    const bookings = await dbAll('SELECT * FROM bookings WHERE email = ? ORDER BY created_at DESC', [req.params.email]);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create booking
router.post('/', async (req, res) => {
  try {
    const { name, email, itemType, itemId, quantity, specialRequests, totalPrice } = req.body;

    // Validation
    if (!name || !email || !itemType || !itemId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await dbRun(
      'INSERT INTO bookings (name, email, itemType, itemId, quantity, specialRequests, totalPrice, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, itemType, itemId, quantity || 1, specialRequests || '', totalPrice || 0, 'pending']
    );

    res.status(201).json({
      id: result.id,
      name,
      email,
      itemType,
      itemId,
      quantity,
      totalPrice,
      status: 'pending',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status (admin)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await dbRun('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [id]);
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM bookings WHERE id = ?', [id]);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
