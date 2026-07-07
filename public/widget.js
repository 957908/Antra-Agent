(function() {
  // Get backend server URL based on the script source
  const scriptTag = document.currentScript;
  const scriptURL = scriptTag ? scriptTag.src : '';
  // Determine if script is served locally or from a remote server
  const serverURL = (scriptURL && !scriptURL.startsWith('file:')) ? new URL(scriptURL).origin : window.location.origin;

  // 1. Create and inject Widget Stylesheet
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  // Use absolute server URL if online, otherwise fall back to relative path for static hosting
  link.href = serverURL.startsWith('file') ? 'widget.css' : serverURL + '/widget.css';
  document.head.appendChild(link);

  // Local Client-side Q&A Database for offline/static deployment (no localhost needed)
  class LocalQAHandler {
    constructor() {
      this.qaDatabase = {
        github: 'GitHub is a platform for version control and collaboration using Git.',
        agent: 'Antra-Agent is your personal AI assistant for managing GitHub tasks and notifications.',
        issues: 'Issues are used to track ideas, bugs, and tasks in your repository.',
        pullrequest: 'A pull request is a request to merge your code changes into the main branch.',
        notification: 'Notifications alert you about activities in your repositories.',
        agenda: 'Your agenda shows today\'s GitHub tasks and activities.',
        suggestion: 'Suggestions are AI-powered recommendations for your work.',
        sms: 'You will receive SMS notifications on your phone about important updates.',
        default: 'That\'s a great question! Let me help you with GitHub and development tasks.'
      };
    }

    handleQuestion(question) {
      const lowerQuestion = question.toLowerCase();
      for (const [key, answer] of Object.entries(this.qaDatabase)) {
        if (lowerQuestion.includes(key)) {
          return answer;
        }
      }
      return this.getSmartAnswer(question);
    }

    getSmartAnswer(question) {
      const responses = {
        how: 'Here\'s how you can approach that: Start by checking your GitHub dashboard for relevant information.',
        what: 'That\'s related to GitHub and development. Check your repositories for more details.',
        why: 'Great question! This helps you manage your work better and stay organized.',
        when: 'You can do this anytime! I recommend scheduling it during your work hours.',
        where: 'You can find this in your GitHub dashboard or repositories.',
        help: '📚 I\'m here to help! Ask me about GitHub, tasks, notifications, or anything development-related.'
      };

      for (const [keyword, response] of Object.entries(responses)) {
        if (question.toLowerCase().startsWith(keyword)) {
          return response;
        }
      }
      return 'I understand your question. Please ask me about GitHub features, issues, pull requests, or notifications.';
    }
  }

  const logoSrc = serverURL.startsWith('file') ? 'logo.png' : serverURL + '/logo.png';

  // 2. Create Widget HTML Structure
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'antra-widget-container';
  widgetContainer.innerHTML = `
    <!-- Floating Action Button -->
    <button id="antra-widget-trigger" aria-label="Open Chat">
      <img src="${logoSrc}" alt="Antra Logo" />
      <span class="pulse-ring"></span>
    </button>

    <!-- Chat Panel Window -->
    <div id="antra-widget-panel" class="hidden">
      <div class="widget-header">
        <div class="header-info">
          <img src="${logoSrc}" alt="Antra Logo" class="header-logo" />
          <div>
            <h4>Antra Agent</h4>
            <span class="online-indicator">Active Now</span>
          </div>
        </div>
        <button id="antra-widget-close" aria-label="Close Chat">&times;</button>
      </div>

      <div class="widget-chat-output" id="widget-chat-output">
        <div class="widget-message bot">
          <img class="widget-avatar bot" src="${logoSrc}" alt="Bot" />
          <div class="widget-msg-content">Namaste! 🙏 I am your Antra-Agent. Ask me anything about your GitHub activities, issues, or repositories!</div>
        </div>
      </div>

      <div class="widget-chat-input-area">
        <input type="text" id="widget-chat-input" placeholder="Ask a question..." />
        <button id="widget-chat-send">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // 3. UI References & State
  const triggerBtn = document.getElementById('antra-widget-trigger');
  const panel = document.getElementById('antra-widget-panel');
  const closeBtn = document.getElementById('antra-widget-close');
  const chatInput = document.getElementById('widget-chat-input');
  const sendBtn = document.getElementById('widget-chat-send');
  const chatOutput = document.getElementById('widget-chat-output');

  // Toggle Chat Window
  triggerBtn.addEventListener('click', () => {
    panel.classList.toggle('hidden');
    chatInput.focus();
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.add('hidden');
  });

  // Append Message Helper
  function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('widget-message', sender);

    if (sender === 'bot') {
      const img = document.createElement('img');
      img.classList.add('widget-avatar', 'bot');
      img.src = logoSrc;
      img.alt = 'Bot';
      msgDiv.appendChild(img);
    } else {
      const avatar = document.createElement('div');
      avatar.classList.add('widget-avatar', 'user');
      avatar.textContent = '👤';
      msgDiv.appendChild(avatar);
    }

    const content = document.createElement('div');
    content.classList.add('widget-msg-content');
    content.textContent = text;
    msgDiv.appendChild(content);

    chatOutput.appendChild(msgDiv);
    chatOutput.scrollTop = chatOutput.scrollHeight;
  }

  // Handle Message Submission
  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    appendMessage('user', text);

    // Add Loading Indicator
    const loadingId = 'widget-loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('widget-message', 'bot');
    loadingDiv.id = loadingId;
    loadingDiv.innerHTML = `
      <img class="widget-avatar bot" src="${logoSrc}" alt="Bot" />
      <div class="widget-msg-content"><i>Thinking...</i></div>
    `;
    chatOutput.appendChild(loadingDiv);
    chatOutput.scrollTop = chatOutput.scrollHeight;

    let answer = null;
    const isStaticMode = window.location.protocol === 'file:' || serverURL.startsWith('file');

    // Attempt to query the backend API if we are served over HTTP/HTTPS
    if (!isStaticMode) {
      try {
        const response = await fetch(serverURL + '/api/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: text })
        });
        const data = await response.json();
        answer = data.answer;
      } catch (err) {
        console.warn('Backend server offline. Falling back to client-side Q&A engine.', err);
      }
    }

    // Offline / Static fallback: Calculate answer directly in client browser
    if (!answer) {
      const localQA = new LocalQAHandler();
      answer = localQA.handleQuestion(text);
    }

    document.getElementById(loadingId)?.remove();
    appendMessage('bot', answer);
  }

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
