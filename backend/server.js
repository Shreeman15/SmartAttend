const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');
const path     = require('path');
const fs       = require('fs');
const { swaggerUi, specs } = require('./swagger');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
const frontendPath = fs.existsSync(path.join(__dirname, '../frontend'))
  ? path.join(__dirname, '../frontend')
  : path.join(__dirname, '../../frontend');

console.log('📁 Frontend:', frontendPath);

app.use(express.static(frontendPath));

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/employees',  require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leaves',     require('./routes/leaves'));
app.use('/api/reports',    require('./routes/reports'));
app.use('/api/dashboard',  require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root route
app.get('/', (req, res) => {
  res.send('SmartAttend Backend Running 🚀');
});

// MongoDB connection
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB error:', err.message));
}

module.exports = app;