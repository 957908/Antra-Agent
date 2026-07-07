# Antra-Agent - Your Personal GitHub AI Assistant 🤖

> An intelligent AI-powered bot that manages your GitHub workflow, sends SMS notifications, and provides smart suggestions with a warm "Namaste" greeting.

## ✨ Features

### 📱 **Smart Notifications**
- SMS alerts sent directly to your phone via Twilio
- Real-time updates on GitHub activity
- Customizable notification preferences

### 📋 **Daily Agenda**
- Automatic GitHub scan at specified times
- Shows open issues, PRs, and notifications
- Organized task list for your day

### 💡 **Intelligent Suggestions**
- AI-powered recommendations for your work
- Based on your repository activity
- Helps you prioritize tasks

### 👋 **Visitor Greeting**
- Greets visitors with "Namaste" 🙏
- Professional and friendly first impression
- Sets a welcoming tone

### 🤖 **Auto Q&A System**
- Automatically answers common GitHub questions
- Intelligent question detection
- Provides helpful guidance

### 🔄 **Regular Scanning**
- Continuously monitors your repositories
- Detects changes and new activities
- Keeps you updated automatically

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js >= 14
npm or yarn
GitHub account
Twilio account (for SMS)
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/957908/Antra-Agent.git
cd Antra-Agent
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# GitHub
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_username

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
YOUR_PHONE_NUMBER=+9876543210

# Server
PORT=3000
```

4. **Start the agent**
```bash
npm start
```

The agent will start and:
- Display the 3D logo 🤖
- Show system status
- Start listening on `http://localhost:3000`

---

## 📡 API Endpoints

### Get Daily Agenda
```bash
GET /api/agenda
```
Returns your open issues, PRs, and notifications.

### Get Suggestions
```bash
GET /api/suggestions
```
Gets AI-powered task suggestions.

### Visitor Greeting & Q&A
```bash
POST /api/visit
Content-Type: application/json

{
  "question": "What is GitHub?"
}
```

### Send SMS Notification
```bash
POST /api/send-sms
Content-Type: application/json

{
  "message": "Your custom message"
}
```

### Scan Repositories
```bash
POST /api/scan
```
Manually trigger a scan of your repositories.

### Get Logos
```bash
GET /api/logo/ascii    # ASCII art logo
GET /api/logo/3d       # 3D ASCII logo
GET /api/logo/colorful # Colorful 3D logo
```

---

## 💻 Web Dashboard

Access the beautiful web dashboard at:
```
http://localhost:3000
```

Features:
- 🎨 3D animated logo
- 📊 System status
- ⚡ Quick command reference
- 🌐 Real-time updates

---

## 🎯 Usage Examples

### In Terminal

```bash
# Check health
curl http://localhost:3000/api/health

# Get agenda
curl http://localhost:3000/api/agenda

# Get suggestions
curl http://localhost:3000/api/suggestions

# Ask a question
curl -X POST http://localhost:3000/api/visit \
  -H "Content-Type: application/json" \
  -d '{"question": "What are GitHub issues?"}'

# Send SMS
curl -X POST http://localhost:3000/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from Antra-Agent!"}'
```

### In Your Application

```javascript
// Get agenda
const agenda = await fetch('/api/agenda').then(r => r.json());
console.log(agenda);

// Ask question
const response = await fetch('/api/visit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'How do I create a PR?' })
});
const data = await response.json();
console.log(data.answer);
```

---

## 🏗️ Project Structure

```
Antra-Agent/
├── src/
│   ├── index.js              # Main server
│   ├── github-scanner.js     # GitHub integration
│   ├── sms-notifier.js       # Twilio SMS service
│   ├── task-detector.js      # Suggestion engine
│   ├── visitor-greeter.js    # Greeting system
│   ├── qa-handler.js         # Q&A engine
│   ├── dashboard.js          # CLI dashboard
│   ├── logo-generator.js     # Logo display
│   └── web-server.js         # Web dashboard
├── public/                   # Static assets
├── .env.example              # Configuration template
├── package.json              # Dependencies
└── README.md                 # This file
```

---

## 🔐 Security

- Keep your `.env` file secret
- Never commit `.env` to version control
- Use environment variables for all secrets
- Rotate tokens regularly

---

## 📞 Support

If you have questions or issues:

1. Check the [GitHub Issues](https://github.com/957908/Antra-Agent/issues)
2. Create a new issue with details
3. Include error messages and steps to reproduce

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with Node.js and Express
- GitHub API integration
- Twilio SMS service
- Special thanks to the open source community

---

<div align="center">

**Made with ❤️ by Antra-Agent**

[⭐ Star us on GitHub](https://github.com/957908/Antra-Agent) | [🐛 Report Bug](https://github.com/957908/Antra-Agent/issues) | [💡 Suggest Feature](https://github.com/957908/Antra-Agent/issues)

Namaste! 🙏

</div>
