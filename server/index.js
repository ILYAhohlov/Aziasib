const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../build')));

// MongoDB connection - используем секрет
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Supabase configuration - используем секреты
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}
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

// Base API route
app.get('/api', (req, res) => {
  res.json({ message: 'OptBazar API is running', timestamp: new Date().toISOString() });
});

// Products API Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    const transformedProducts = products.map(product => ({
      ...product.toObject(),
      id: product._id.toString()
    }));
    res.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
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
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
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

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    fs.unlinkSync(req.file.path);

    res.json({ url: publicUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin authentication - используем секреты
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!ADMIN_PASSWORD || !JWT_SECRET) {
      console.error('Admin credentials not found in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error', details: error.message });
});

// Serve React app for all non-API routes
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '../build/index.html');
  res.sendFile(indexPath);
});

// Initialize Supabase storage
async function initializeSupabaseStorage() {
  try {
    const { data, error } = await supabase.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 5242880,
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
const initializeDatabase = async () => {
  try {
    // Check if products already exist
    const existingProducts = await Product.find();
    if (existingProducts.length === 0) {
      // Add sample products
      const sampleProducts = [
        {
          id: "1",
          name: "Огурцы свежие",
          category: "овощи",
          price: 50,
          minOrder: 10,
          unit: "кг",
          description: "Свежие огурцы прямо с грядки. Идеальны для салатов и консервации.",
          shelfLife: "7 дней",
          allergens: "Нет",
          image: "https://images.unsplash.com/photo-1560433802-62c9db426a4d?w=400"
        },
        {
          id: "2", 
          name: "Яблоки Гала",
          category: "фрукты",
          price: 120,
          minOrder: 20,
          unit: "кг",
          description: "Сладкие и сочные яблоки сорта Гала. Отличный источник витаминов.",
          shelfLife: "14 дней",
          allergens: "Нет",
          image: "https://images.unsplash.com/photo-1623815242959-fb20354f9b8d?w=400"
        },
        {
          id: "3",
          name: "Черный перец горошком",
          category: "специи", 
          price: 280,
          minOrder: 1,
          unit: "кг",
          description: "Ароматный черный перец горошком высшего качества.",
          shelfLife: "24 месяца",
          allergens: "Нет",
          image: "https://images.unsplash.com/photo-1649952052743-5e8f37c348c5?w=400"
        },
        {
          id: "4",
          name: "Помидоры черри",
          category: "овощи",
          price: 180,
          minOrder: 5,
          unit: "кг", 
          description: "Маленькие сладкие помидорчики черри. Прекрасны в салатах.",
          shelfLife: "5 дней",
          allergens: "Нет",
          image: "https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400"
        },
        {
          id: "5",
          name: "Бананы",
          category: "фрукты",
          price: 90,
          minOrder: 15,
          unit: "кг",
          description: "Спелые тропические бананы. Богаты калием и витаминами.",
          shelfLife: "5 дней", 
          allergens: "Нет",
          image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400"
        },
        {
          id: "6",
          name: "Куркума молотая",
          category: "специи",
          price: 450,
          minOrder: 1,
          unit: "кг",
          description: "Натуральная куркума высшего качества. Обладает антиоксидантными свойствами.",
          shelfLife: "18 месяцев",
          allergens: "Нет",
          image: "https://images.unsplash.com/photo-1615485925600-97b042c9ca24?w=400"
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log('Sample products added to database');
    }

    // Check if orders already exist
    const existingOrders = await Order.find();
    if (existingOrders.length === 0) {
      // Add sample orders
      const sampleOrders = [
        {
          items: [
            {
              productId: null,
              name: "Огурцы свежие",
              price: 50,
              quantity: 15
            },
            {
              productId: null,
              name: "Помидоры черри",
              price: 180,
              quantity: 8
            }
          ],
          customerInfo: {
            name: "Иван Петров",
            phone: "+7 900 123-45-67",
            address: "г. Москва, ул. Тверская, д. 10",
            telegramId: 123456789
          },
          totalAmount: 2190,
          status: "В обработке",
          comments: "Доставка до 18:00",
          orderSource: "telegram",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // вчера
        },
        {
          items: [
            {
              productId: null,
              name: "Яблоки Гала",
              price: 120,
              quantity: 25
            }
          ],
          customerInfo: {
            name: "Мария Сидорова",
            phone: "+7 911 987-65-43",
            address: "г. СПб, Невский пр., д. 50",
            telegramId: 987654321
          },
          totalAmount: 3000,
          status: "Завершен",
          comments: "",
          orderSource: "web",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // позавчера
        },
        {
          items: [
            {
              productId: null,
              name: "Черный перец горошком",
              price: 280,
              quantity: 3
            },
            {
              productId: null,
              name: "Куркума молотая",
              price: 450,
              quantity: 2
            }
          ],
          customerInfo: {
            name: "Алексей Козлов",
            phone: "+7 912 345-67-89",
            address: "г. Екатеринбург, ул. Ленина, д. 25",
            telegramId: 456789123
          },
          totalAmount: 1740,
          status: "Принят",
          comments: "Срочная доставка",
          orderSource: "telegram",
          createdAt: new Date(Date.now() - 60 * 60 * 1000) // час назад
        }
      ];

      await Order.insertMany(sampleOrders);
      console.log('Sample orders added to database');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Initialize and start server
async function startServer() {
  try {
    await initializeSupabaseStorage();
    await initializeDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      console.log(`API available at http://0.0.0.0:${PORT}/api`);
    });
  } catch (error) {
    console.error('Server initialization error:', error);
  }
}

startServer();