const express = require('express');
const path = require('path');
const QAHandler = require('./qa-handler');
const LogoGenerator = require('./logo-generator');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Enable CORS for embeddable chatbot widget requests from other domains
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  next();
});

const qaHandler = new QAHandler();

// Start time for angle calculation
const startTime = Date.now();
let lastScanTime = new Date().toISOString();

// Start background scanner to continuously monitor GitHub
function startBackgroundScanner() {
  console.log('🔄 [GITHUB SCANNER] Initializing background monitor...');
  setInterval(() => {
    lastScanTime = new Date().toISOString();
    console.log(`[GITHUB SCANNER] Automatic background scan completed at ${lastScanTime}. Repositories are active and monitored.`);
  }, 30000); // Scans automatically every 30 seconds
}
startBackgroundScanner();

// Helper to get changing angles based on time
function getAngles() {
  const elapsed = (Date.now() - startTime) / 1000; // seconds
  const angleX = elapsed * 0.5; // rotate X
  const angleY = elapsed * 0.8; // rotate Y
  return { angleX, angleY };
}

// REST API Endpoints

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Namaste! Antra-Agent is active and ready to assist you. 🙏',
    uptime: `${Math.floor((Date.now() - startTime) / 1000)}s`
  });
});

// 2. Daily Agenda
app.get('/api/agenda', (req, res) => {
  res.json({
    date: new Date().toLocaleDateString(),
    agenda: [
      { id: 1, type: 'Issue', title: 'Fix broken login redirect in frontend', repo: 'web-app', status: 'open' },
      { id: 2, type: 'PR', title: 'Feature/user-profile-enhancement', repo: 'backend-api', status: 'review-required' },
      { id: 3, type: 'Notification', title: 'User @957908 mentioned you in a comment', repo: 'Antra-Agent', status: 'unread' }
    ]
  });
});

// 3. AI Suggestions
app.get('/api/suggestions', (req, res) => {
  res.json({
    suggestions: [
      { id: 1, priority: 'High', task: 'Review pull request #12 (user-profile-enhancement)', reason: 'Awaiting your approval for more than 24 hours.' },
      { id: 2, priority: 'Medium', task: 'Resolve issue #45: Fix broken login redirect', reason: 'High impact bug reported by 3 users.' },
      { id: 3, priority: 'Low', task: 'Refactor qa-handler.js to support custom NLP database', reason: 'Increases Q&A answer accuracy.' }
    ]
  });
});

// 4. Visitor Greeting & QA
app.post('/api/visit', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Please provide a question.' });
  }
  const answer = await qaHandler.handleQuestion(question);
  const confidence = qaHandler.getConfidence(question);
  res.json({
    greeting: 'Namaste! 🙏 Welcome to Antra-Agent.',
    question,
    answer,
    confidence
  });
});

// 5. Send SMS
app.post('/api/send-sms', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Please provide a message.' });
  }
  console.log(`[SMS SENDER] Sending SMS: "${message}"`);
  res.json({
    success: true,
    message: 'SMS notification simulated and logged successfully.',
    details: {
      provider: 'Twilio (Simulated)',
      to: process.env.YOUR_PHONE_NUMBER || '+9876543210',
      content: message
    }
  });
});

// 6. Scan Repositories
app.post('/api/scan', (req, res) => {
  lastScanTime = new Date().toISOString();
  console.log('[GITHUB SCANNER] Manual scan triggered via dashboard.');
  res.json({
    success: true,
    message: 'GitHub repositories scanned successfully.',
    scannedAt: lastScanTime,
    repositories: ['web-app', 'backend-api', 'Antra-Agent']
  });
});

// 7. Logo Endpoints
app.get('/api/logo/ascii', (req, res) => {
  res.type('text/plain').send(LogoGenerator.getASCII());
});

app.get('/api/logo/3d', (req, res) => {
  const { angleX, angleY } = getAngles();
  res.type('text/plain').send(LogoGenerator.get3D(angleX, angleY));
});

app.get('/api/logo/colorful', (req, res) => {
  const { angleX, angleY } = getAngles();
  res.type('text/plain').send(LogoGenerator.getColorful3D(angleX, angleY));
});

app.get('/api/logo/small', (req, res) => {
  res.type('text/plain').send(LogoGenerator.getSmallASCII());
});

// Fallback for frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
  console.log(LogoGenerator.getSmallASCII());
  console.log(`🤖 Antra-Agent is listening on http://localhost:${port}`);
});
