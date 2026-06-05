
// Mock products data
export const products = [
  {
    id: 1,
    name: "Bamboo Toothbrush",
    description: "Eco-friendly bamboo toothbrush with biodegradable bristles",
    fullDescription: "Made from sustainably grown bamboo, this toothbrush is 100% biodegradable. The bristles are made from castor bean oil, making it a perfect zero-waste alternative.",
    price: 4.99,
    category: "lifestyle",
    image: "/p1.jpg",
    ecoFeatures: ["Biodegradable", "Plastic-free", "Sustainably sourced"],
    isEcoFriendly: true,
    stock: 50
  },
  {
    id: 2,
    name: "Reusable Produce Bags",
    description: "Set of 5 mesh produce bags for plastic-free grocery shopping",
    fullDescription: "These lightweight mesh bags replace single-use plastic bags at the grocery store. They're washable, durable, and perfect for fruits and vegetables.",
    price: 12.99,
    category: "food",
    image: "/p2.jpg",
    rating: 4.8,
    reviews: 256,
    ecoFeatures: ["Washable", "Reusable", "Made from recycled materials"],
    isEcoFriendly: true,
    stock: 100
  },
  {
    id: 3,
    name: "Reusable Produce Box",
    description: "Sturdy reusable box for grocery haul storage",
    fullDescription: "This sturdy reusable produce box keeps fruits and vegetables secure from market to home. It's made from recycled materials and helps reduce single-use packaging waste.",
    price: 15.99,
    category: "food",
    image: "/p4.webp",
    rating: 4.8,
    reviews: 257,
    ecoFeatures: ["Washable", "Reusable", "Made from recycled materials"],
    isEcoFriendly: true,
    stock: 100
  },

  {
    id: 4,
    name: "Solar Phone Charger",
    description: "Portable 20000mAh solar power bank for eco-friendly charging",
    fullDescription: "Harness the power of the sun to charge your devices anywhere. This portable solar charger is perfect for outdoor activities and reduces your carbon footprint.",
    price: 39.99,
    category: "energy",
    image: "/p3.jpg",
    rating: 4.3,
    reviews: 89,
    ecoFeatures: ["Solar-powered", "Energy efficient", "Long-lasting"],
    isEcoFriendly: true,
    stock: 30
  },
  {
    id: 5,
    name: "Fresh Organic Strawberries",
    description: "Sweet, juicy strawberries grown without pesticides",
    fullDescription: "Sweet, juicy strawberries grown without pesticides. Perfect for desserts or healthy snacking. These organic berries are locally sourced and packed with natural flavor.",
    price: 4.99,
    image: "/p6.webp",
    isEcoFriendly: true,
    category: "food",
    rating: 4.8,
    reviews: 156,
    ecoFeatures: ["Organic", "Locally sourced", "Pesticide-free"],
    stock: 75
  },
   {
    id: 6,
    name: "Ceramic Coffee Mug",
    description: "Handcrafted, microwave-safe ceramic mug with ergonomic handle",
    fullDescription: "Handcrafted ceramic mug that's microwave-safe and dishwasher-friendly. Each mug is individually made with an ergonomic handle for comfortable daily use. Perfect for your morning coffee or tea.",
    price: 18.50,
    image: "/p7.webp",
    isEcoFriendly: true,
    category: "lifestyle",
    rating: 4.6,
    reviews: 89,
    ecoFeatures: ["Handcrafted", "Durable", "Lead-free glaze"],
    stock: 45
  },
    {
    id: 7,
    name: "Bamboo Yoga Mat",
    description: "Eco-friendly, non-slip yoga mat made from sustainable bamboo",
    fullDescription: "Eco-friendly, non-slip yoga mat made from sustainable bamboo and natural rubber. This mat provides excellent grip, cushioning, and support for all types of yoga practice. Perfect for beginners and experienced yogis alike.",
    price: 59.99,
    image: "/p8.webp",
    isEcoFriendly: true,
    category: "lifestyle",
    rating: 4.9,
    reviews: 234,
    ecoFeatures: ["Sustainable bamboo", "Natural rubber", "Non-toxic"],
    tags: ["yoga", "eco-friendly", "fitness", "meditation"],
    stock: 30,
    colors: ["Natural", "Charcoal"]
  },
  {
    id: 8,
    name: "Organic Cotton Tote Bag",
    description: "Durable, reusable tote bag made from 100% organic cotton",
    fullDescription: "Durable, reusable tote bag made from 100% organic cotton. Perfect for shopping and everyday use. This machine-washable bag is a stylish alternative to single-use plastic bags.",
    price: 14.99,
    image: "/p10.webp",
    isEcoFriendly: true,
    category: "lifestyle",
    rating: 4.7,
    reviews: 120,
    ecoFeatures: ["Organic cotton", "Reusable", "Machine washable"],
    stock: 60,
    sizes: ["Small", "Medium", "Large"]
  }


];


// Mock workshops data
export const workshops = [
  {
    id: 1,
    title: "Composting 101",
    description: "Learn how to turn kitchen waste into nutrient-rich soil",
    fullDescription: "This hands-on workshop teaches you everything about composting - from what materials to use to maintaining your compost bin. Perfect for beginners!",
    price: 25,
    category: "education",
    image: "/p9.webp",
    date: "2024-04-15",
    time: "10:00 AM - 12:00 PM",
    location: "Community Garden Center",
    spots: 20,
    instructor: "Maria Green",
    rating: 4.7
  },
  {
    id: 2,
    title: "Urban Gardening",
    description: "Grow your own food in small spaces",
    fullDescription: "Discover how to create a thriving garden in apartments, balconies, and small yards. Learn container gardening, vertical growing, and seasonal planting.",
    price: 35,
    category: "food",
    image: "/p11.jpg",
    date: "2024-04-20",
    time: "1:00 PM - 4:00 PM",
    location: "Urban Farm Collective",
    spots: 15,
    instructor: "John Farmer",
    rating: 4.9
  }
];

// Mock events data
export const events = [
  {
    id: 1,
    title: "Beach Cleanup Day",
    description: "Join us to clean our local beaches and protect marine life",
    fullDescription: "Help remove plastic waste from our beaches. Gloves and bags provided. Let's work together to keep our oceans clean!",
    price: 0, // Free event
    category: "waste",
    image: "/p12.jpg",
    date: "2024-04-25",
    time: "8:00 AM - 12:00 PM",
    location: "Sunset Beach",
    spots: 50,
    organizer: "Ocean Conservation Society"
  },
  {
    id: 2,
    title: "Tree Planting Festival",
    description: "Plant native trees and help restore our forests",
    fullDescription: "Annual tree planting event. All tools provided. Help us reach our goal of planting 1000 trees this year!",
    price: 0,
    category: "education",
    image: "/p13.webp",
    date: "2024-05-01",
    time: "9:00 AM - 3:00 PM",
    location: "Green Valley Park",
    spots: 100,
    organizer: "Forest Restoration Project"
  }
  
]; 