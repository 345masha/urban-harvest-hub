import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vapidKeysPath = path.join(__dirname, '../vapid-keys.json');

let vapidDetails = {
  publicKey: '',
  privateKey: ''
};

export const generateVAPIDKeys = () => {
  // If we already have keys saved to a file, load them
  if (fs.existsSync(vapidKeysPath)) {
    const keys = JSON.parse(fs.readFileSync(vapidKeysPath, 'utf8'));
    vapidDetails = keys;
    return keys;
  }

  // Otherwise, generate new keys
  const keys = webpush.generateVAPIDKeys();
  vapidDetails = keys;
  
  // Save to file for persistence across server restarts
  fs.writeFileSync(vapidKeysPath, JSON.stringify(keys, null, 2), 'utf8');
  
  return keys;
};

export const setVapidDetails = (subject) => {
  const keys = generateVAPIDKeys();
  webpush.setVapidDetails(
    subject,
    keys.publicKey,
    keys.privateKey
  );
  console.log(`🔑 VAPID details configured for: ${subject}`);
  return keys;
};

// Initialize on load
setVapidDetails('mailto:admin@urbanharvest.com');

export const getPublicKey = () => {
  return vapidDetails.publicKey;
};

export const sendNotification = async (subscription, payload) => {
  console.log(`✉️ Attempting to send Push Notification to endpoint: ${subscription.endpoint}`);
  
  try {
    const result = await webpush.sendNotification(subscription, payload);
    console.log('✅ Real Push Notification sent successfully!');
    return { success: true, response: result };
  } catch (error) {
    console.warn(`⚠️ Real Web Push request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export default {
  generateVAPIDKeys,
  setVapidDetails,
  getPublicKey,
  sendNotification
};
