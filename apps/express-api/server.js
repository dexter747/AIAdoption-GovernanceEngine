import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'ai-nexus-jwt-secret-change-in-production';
const JWT_ISSUER = 'ai-nexus';

// JWT Helper Functions
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function createSignature(data, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { success: false, error: 'Invalid format' };

    const [headerEncoded, payloadEncoded, signature] = parts;
    const expectedSignature = createSignature(`${headerEncoded}.${payloadEncoded}`, JWT_SECRET);
    
    if (signature !== expectedSignature) {
      return { success: false, error: 'Invalid signature' };
    }

    const payload = JSON.parse(base64UrlDecode(payloadEncoded));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      return { success: false, error: 'Token expired' };
    }

    if (payload.iss !== JWT_ISSUER) {
      return { success: false, error: 'Invalid issuer' };
    }

    return { success: true, user: payload };
  } catch (error) {
    return { success: false, error: 'Verification failed' };
  }
}

// Auth Middleware
function authMiddleware(options = {}) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
      if (options.optional) return next();
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = verifyToken(token);
    if (!result.success) {
      if (options.optional) return next();
      return res.status(401).json({ error: result.error });
    }

    req.user = result.user;
    req.token = token;
    next();
  };
}

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

// Auth - Verify token endpoint
app.get('/api/auth/verify', authMiddleware(), (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name,
      plan: req.user.plan || 'trial',
    },
    expiresAt: req.user.exp ? req.user.exp * 1000 : null,
  });
});

// Auth - Get current user
app.get('/api/auth/me', authMiddleware(), (req, res) => {
  res.json({
    id: req.user.sub,
    email: req.user.email,
    name: req.user.name,
    image: req.user.image,
    plan: req.user.plan || 'trial',
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
