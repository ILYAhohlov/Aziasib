
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = "mongodb://optbazar_becomingto:71dccccce5b294406027a42ed3c3020fb3e797e3@dfqdnz.h.filess.io:27018/optbazar_becomingto";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Supabase configuration
const supabaseUrl = 'https://pdlhdxjsjmcgojzlwujl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbGhkeGpzam1jZ29qemx3dWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTc3NjYsImV4cCI6MjA3MjEzMzc2Nn0.Pfq4iclPhBr7knCVhSX5zRvzTZqjMEgXIRdhP4nLQ0g';
const supabase = createClient(supabaseUrl, supabaseKey);

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/' });

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  minOrder: { type: Number, required: true },
  unit: { type: String, default: 'кг' },
  description: String,
  shelfLife: String,
  allergens: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  customerInfo: {
    name: String,
    phone: { type: String, required: true },
    address: String,
    telegramId: Number
  },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Принят', 'В обработке', 'В доставке', 'Завершен', 'Отменен'],
    default: 'Принят' 
  },
  comments: String,
  orderSource: { type: String, enum: ['web', 'telegram'], default: 'web' },
  createdAt: { type: Date, default: Date.now }
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Admin = mongoose.model('Admin', adminSchema);

// Routes

// Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Orders
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('items.productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Image upload
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const fs = require('fs');
    const file = fs.readFileSync(req.file.path);
    const fileName = `${Date.now()}-${req.file.originalname}`;
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        contentType: req.file.mimetype
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    res.json({ url: publicUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // For demo purposes, use simple hardcoded check
    // In production, use bcrypt and proper JWT
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign({ username }, 'secret-key', { expiresIn: '24h' });
      res.json({ token, message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize Supabase storage
async function initializeSupabaseStorage() {
  try {
    // Create bucket for product images if it doesn't exist
    const { data, error } = await supabase.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    });
    
    if (error && error.message !== 'Bucket already exists') {
      console.error('Error creating bucket:', error);
    } else {
      console.log('Supabase storage bucket ready');
    }
  } catch (error) {
    console.log('Supabase storage initialization:', error.message);
  }
}

// Initialize database with sample data
async function initializeDatabase() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        {
          name: "Огурцы свежие",
          category: "овощи",
          price: 50,
          minOrder: 10,
          unit: "кг",
          description: "Свежие огурцы из Узбекистана",
          shelfLife: "7 дней",
          allergens: "Нет",
          image: "https://images.unsplash.com/photo-1560433802-62c9db426a4d"
        },
        {
          name: "Яблоки Гала",
          category: "фрукты", 
          price: 120,
          minOrder: 20,
          unit: "кг",
          description: "Сладкие красные яблоки",
          shelfLife: "30 дней",
          allergens: "Нет",
          image: "https://images.unsplash.com/photo-1571535911609-4f7afc6af16b"
        },
        {
          name: "Бананы",
          category: "фрукты",
          price: 90,
          minOrder: 10,
          unit: "кг", 
          description: "Спелые сладкие бананы из Эквадора",
          shelfLife: "5 дней",
          allergens: "Нет",
          image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224"
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log('Sample products added to database');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  initializeDatabase();
  initializeSupabaseStorage();
});
