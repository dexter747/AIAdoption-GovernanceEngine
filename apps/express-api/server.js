import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'AI Nexus API',
    version: '1.0.0',
    status: 'running',
  });
});

// License validation endpoint
app.post('/api/licenses/validate', async (req, res) => {
  try {
    const { licenseKey, deviceId } = req.body;

    if (!licenseKey || !deviceId) {
      return res.status(400).json({
        valid: false,
        error: 'Missing required fields',
      });
    }

    // TODO: Implement license validation logic
    // This would connect to Prisma/MongoDB to verify license

    res.json({
      valid: true,
      license: {
        plan: 'professional',
        expiresAt: '2027-01-01',
        features: ['all-ai-providers', 'unlimited-queries'],
      },
    });
  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'Internal server error',
    });
  }
});

// AI query endpoint (for desktop app)
app.post('/api/ai/query', async (req, res) => {
  try {
    const { provider, model, prompt, connectionId } = req.body;

    // TODO: Implement AI routing logic
    // This would route to appropriate AI provider

    res.json({
      success: true,
      response: 'AI response placeholder',
      usage: {
        tokens: 100,
        cost: 0.002,
      },
    });
  } catch (error) {
    console.error('AI query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process AI query',
    });
  }
});

// Usage tracking endpoint
app.post('/api/usage/track', async (req, res) => {
  try {
    const { licenseKey, event, metadata } = req.body;

    // TODO: Save to MongoDB for analytics

    res.json({ success: true });
  } catch (error) {
    console.error('Usage tracking error:', error);
    res.status(500).json({ success: false });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Express API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API Status: http://localhost:${PORT}/api/status`);
});
