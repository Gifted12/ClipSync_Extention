import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import clipRoutes from './routes/clips.js';
import userRoutes from './routes/users.js';
const PORT = process.env.PORT;
dotenv.config();

const app = express();


app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [
      process.env.CLIENT_URL || 'http://localhost:5173',
    
    ];

    if (origin.startsWith('chrome-extension://')) return callback(null, true);
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);


app.use('/api/auth', authRoutes);
app.use('/api/clips', clipRoutes);
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
  res.json({
    name: 'ClipSync API',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/auth', '/api/clips', '/api/users'],
  });
});


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
});


app.use((err, req, res, next) => {
  console.error(' Server error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  

  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('👉 Check your MONGODB_URI in backend/.env');
    process.exit(1);
  });
    app.listen(PORT, () => {
      console.log(`🚀 Server running → http://localhost:${PORT}`);
      console.log(`📋 ClipSync API ready`);
    });  