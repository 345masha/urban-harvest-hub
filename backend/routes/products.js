import express from 'express';
import { dbAll, dbGet, dbRun } from '../db/database.js';

const router = express.Router();

// Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const products = await dbAll(sql, params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product (admin)
router.post('/', async (req, res) => {
  try {
    const { name, description, fullDescription, price, category, image, stock } = req.body;

    // Validation
    const errors = [];
    if (!name || typeof name !== 'string') errors.push('Valid name is required');
    if (price === undefined || isNaN(price) || price < 0) errors.push('Valid positive price is required');
    if (!category || typeof category !== 'string') errors.push('Valid category is required');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const result = await dbRun(
      'INSERT INTO products (name, description, fullDescription, price, category, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, fullDescription, price, category, image, stock || 0]
    );

    res.status(201).json({
      id: result.id,
      name,
      description,
      price,
      category,
      image,
      stock: stock || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error occurred while creating product', details: error.message });
  }
});

// Update product (admin)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, fullDescription, price, category, image, stock } = req.body;
    const { id } = req.params;

    // Validation
    const errors = [];
    if (!name || typeof name !== 'string') errors.push('Valid name is required');
    if (price === undefined || isNaN(price) || price < 0) errors.push('Valid positive price is required');
    if (!category || typeof category !== 'string') errors.push('Valid category is required');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    await dbRun(
      'UPDATE products SET name = ?, description = ?, fullDescription = ?, price = ?, category = ?, image = ?, stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, fullDescription, price, category, image, stock, id]
    );

    const product = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found after update' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Database error occurred while updating product', details: error.message });
  }
});

// Delete product (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
