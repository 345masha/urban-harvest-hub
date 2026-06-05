import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'urban_harvest',
  DB_PORT = 3306,
  DB_CONNECTION_LIMIT = 10
} = process.env;


export const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: Number(DB_PORT),
  waitForConnections: true,
  connectionLimit: Number(DB_CONNECTION_LIMIT),
  decimalNumbers: true
});

export const dbRun = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return result;
};

export const dbGet = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
};

export const dbAll = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows || [];
};

export async function initializeDB() {
  try {
    // Create tables if they don't exist (MySQL-compatible)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        fullDescription TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image VARCHAR(255),
        stock INT DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        reviews INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS workshops (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        fullDescription TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image VARCHAR(255),
        date DATE NOT NULL,
        time VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        spots INT DEFAULT 0,
        instructor VARCHAR(255) NOT NULL,
        rating DECIMAL(3,2) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        fullDescription TEXT,
        price DECIMAL(10,2) DEFAULT 0,
        category VARCHAR(100) NOT NULL,
        image VARCHAR(255),
        date DATE NOT NULL,
        time VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        spots INT DEFAULT 0,
        organizer VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        itemType VARCHAR(50) NOT NULL,
        itemId INT NOT NULL,
        quantity INT DEFAULT 1,
        specialRequests TEXT,
        totalPrice DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create new tables for notifications, users, preferences, reviews
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        endpoint VARCHAR(512) UNIQUE NOT NULL,
        p256dh VARCHAR(255) NOT NULL,
        auth VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notifications_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        body TEXT,
        audience VARCHAR(100) DEFAULT 'all',
        status VARCHAR(50) DEFAULT 'sent',
        scheduled_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        rating INT DEFAULT 5,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        event_id INT NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'registered',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_email VARCHAR(255) UNIQUE NOT NULL,
        language VARCHAR(10) DEFAULT 'en',
        theme VARCHAR(10) DEFAULT 'light',
        weather_city VARCHAR(100),
        weather_district VARCHAR(100),
        weather_province VARCHAR(100),
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Seed initial data if products table is empty
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM products');
    const count = rows[0] ? rows[0].count : 0;
    if (count === 0) {
      await seedInitialData();
    }

    console.log('Connected to MySQL and ensured schema');
  } catch (err) {
    console.error('Error initializing MySQL database:', err);
  }
}

async function seedInitialData() {
  const products = [
    ['Bamboo Toothbrush', 'Eco-friendly bamboo toothbrush with biodegradable bristles', 'Made from sustainably grown bamboo, this toothbrush is 100% biodegradable. The bristles are made from castor bean oil, making it a perfect zero-waste alternative.', 4.99, 'lifestyle', '/p1.jpg', 50, 4.5, 120],
    ['Reusable Produce Bags', 'Set of 5 mesh produce bags for plastic-free grocery shopping', "These lightweight mesh bags replace single-use plastic bags at the grocery store. They're washable, durable, and perfect for fruits and vegetables.", 12.99, 'food', '/p2.jpg', 100, 4.8, 256],
    ['Reusable Produce Box', 'Sturdy reusable box for grocery haul storage', 'This sturdy reusable produce box keeps fruits and vegetables secure from market to home. It is made from recycled materials and helps reduce single-use packaging waste.', 15.99, 'food', '/p4.webp', 100, 4.8, 257],
    ['Solar Phone Charger', 'Portable 20000mAh solar power bank for eco-friendly charging', 'Harness the power of the sun to charge your devices anywhere. This portable solar charger is perfect for outdoor activities and reduces your carbon footprint.', 39.99, 'energy', '/p3.jpg', 30, 4.3, 89],
    ['Fresh Organic Strawberries', 'Sweet, juicy strawberries grown without pesticides', 'Sweet, juicy strawberries grown without pesticides. Perfect for desserts or healthy snacking. These organic berries are locally sourced and packed with natural flavor.', 4.99, 'food', '/p6.webp', 75, 4.8, 156],
    ['Ceramic Coffee Mug', 'Handcrafted, microwave-safe ceramic mug with ergonomic handle', 'Handcrafted ceramic mug that is microwave-safe and dishwasher-friendly. Each mug is individually made with an ergonomic handle for comfortable daily use. Perfect for your morning coffee or tea.', 18.50, 'lifestyle', '/p7.webp', 45, 4.6, 89],
    ['Bamboo Yoga Mat', 'Eco-friendly, non-slip yoga mat made from sustainable bamboo', 'Eco-friendly, non-slip yoga mat made from sustainable bamboo and natural rubber. This mat provides excellent grip, cushioning, and support for all types of yoga practice. Perfect for beginners and experienced yogis alike.', 59.99, 'lifestyle', '/p8.webp', 30, 4.9, 234],
    ['Organic Cotton Tote Bag', 'Durable, reusable tote bag made from 100% organic cotton', 'Durable, reusable tote bag made from 100% organic cotton. Perfect for shopping and everyday use. This machine-washable bag is a stylish alternative to single-use plastic bags.', 14.99, 'lifestyle', '/p10.webp', 60, 4.7, 120]
  ];

  for (const product of products) {
    await pool.execute(
      'INSERT INTO products (name, description, fullDescription, price, category, image, stock, rating, reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      product
    );
  }

  const workshops = [
    ['Composting 101', 'Learn how to turn kitchen waste into nutrient-rich soil',
      'This hands-on workshop teaches you everything about composting...', 25, 'education', '/p9.webp', '2024-04-15', '10:00 AM - 12:00 PM', 'Community Garden Center', 20, 'Maria Green', 4.7],
  ];

  for (const workshop of workshops) {
    await pool.execute(
      'INSERT INTO workshops (title, description, fullDescription, price, category, image, date, time, location, spots, instructor, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      workshop
    );
  }

  const events = [
    ['Urban Gardening Meetup', 'Join local gardeners to share tips and seeds', 'An open meetup for urban gardeners of all experience levels to swap seeds and stories.', 0, 'community', '/p11.jpg', '2024-05-10', '2:00 PM - 5:00 PM', 'City Park Pavilion', 50, 'Urban Harvest Hub'],
    ['Sustainable Living Fair', 'A day of eco-friendly vendors and workshops', 'Explore sustainable products, enjoy local organic food, and attend mini-workshops.', 5, 'lifestyle', '/p13.jpg', '2024-06-20', '9:00 AM - 4:00 PM', 'Downtown Plaza', 200, 'Eco Coalition']
  ];

  for (const event of events) {
    await pool.execute(
      'INSERT INTO events (title, description, fullDescription, price, category, image, date, time, location, spots, organizer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      event
    );
  }

  // Seed default admin and standard users
  await pool.execute(
    'INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Admin User', 'admin@urbanharvest.com', 'admin123', 'admin']
  );
  await pool.execute(
    'INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Regular User', 'user@urbanharvest.com', 'user123', 'user']
  );

  console.log('✅ Database seeded with initial data (MySQL)');
}
