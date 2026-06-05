import express from 'express';
import { dbAll, dbGet, dbRun } from '../db/database.js';
import webPushHelper from '../utils/webPushHelper.js';
const { sendNotification, getPublicKey } = webPushHelper;

const router = express.Router();

// Get notification history
router.get('/history', async (req, res) => {
  try {
    const history = await dbAll('SELECT * FROM notifications_history ORDER BY created_at DESC');
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get VAPID Public Key
router.get('/vapidPublicKey', (req, res) => {
  res.json({ publicKey: getPublicKey() });
});


// Register subscription
router.post('/subscribe', async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'Endpoint and subscription keys are required' });
    }

    // Insert or replace subscription (MySQL syntax)
    await dbRun(
      'INSERT INTO push_subscriptions (endpoint, p256dh, auth) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth)',
      [endpoint, keys.p256dh, keys.auth]
    );

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }
    await dbRun('DELETE FROM push_subscriptions WHERE endpoint = ?', [endpoint]);
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Broadcast notification (Admin trigger)
router.post('/send', async (req, res) => {
  try {
    const { title, body, audience } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Insert history record
    const result = await dbRun(
      'INSERT INTO notifications_history (title, body, audience, status) VALUES (?, ?, ?, ?)',
      [title, body, audience || 'all', 'sent']
    );

    // Fetch all active subscriptions
    const subscriptions = await dbAll('SELECT * FROM push_subscriptions');
    const payload = JSON.stringify({ title, body, audience: audience || 'all' });

    // Send push notification to all subscribers in background
    let successCount = 0;
    for (const sub of subscriptions) {
      try {
        const subData = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        const status = await sendNotification(subData, payload);
        if (status.success) {
          successCount++;
        }
      } catch (err) {
        console.error(`Failed to send to subscription ${sub.id}:`, err);
      }
    }

    res.json({
      message: `Notification broadcasted. Sent to ${successCount} of ${subscriptions.length} active devices.`,
      id: result.insertId || result.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification history record
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM notifications_history WHERE id = ?', [id]);
    res.json({ message: 'Notification history record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
