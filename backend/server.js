// server.js - Backend API for Reading Partner
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Initialize Firebase
const { initializeFirebase } = require('./src/services/firebase');
const db = initializeFirebase();

// Import routes
const questionsRouter = require('./src/routes/questions');
const notesRouter = require('./src/routes/notes');
const readingsRouter = require('./src/routes/readings');
const responsesRouter = require('./src/routes/responses');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.API_RATE_LIMIT) || 100,
    message: 'Too many requests, please try again later.'
});

const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: parseInt(process.env.AI_RATE_LIMIT_HOUR) || 20,
    message: 'AI request limit reached. Please try again in an hour.'
});

app.use('/api/', apiLimiter);
app.use('/api/generate-questions', aiLimiter);

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend API is working!',
        firebase: 'connected',
        anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not configured'
    });
});

// API Routes
app.use('/api/generate-questions', questionsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/readings', readingsRouter);
app.use('/api/responses', responsesRouter);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`\n✨ Ready to accept requests!`);
});
