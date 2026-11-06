
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const jobRoutes = require('./routes/jobs');
const alumniRoutes = require('./routes/alumni');
const connectionRoutes = require('./routes/connections');
const messageRoutes = require('./routes/messages');
const app = express();

// CORS configuration must run before API routes
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle JSON requests
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.status(200).send('Alumni Connect Backend is Running!');
});

// Authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);
// Start server after connecting to MongoDB
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB connected successfully!');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
}

startServer();
