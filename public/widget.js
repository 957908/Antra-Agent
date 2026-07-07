(function() {
  // Get backend server URL based on the script source
  const scriptTag = document.currentScript;
  const scriptURL = scriptTag ? scriptTag.src : '';
  // Fallback to current origin if script tag is not found (e.g. inline scripts)
  const serverURL = scriptURL ? new URL(scriptURL).origin : window.location.origin;

  // 1. Create and inject Widget Stylesheet
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = serverURL + '/widget.css';
  document.head.appendChild(link);

  // 2. Create Widget HTML Structure
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'antra-widget-container';
  widgetContainer.innerHTML = `
    <!-- Floating Action Button -->
    <button id="antra-widget-trigger" aria-label="Open Chat">
      <img src="${serverURL}/logo.png" alt="Antra Logo" />
      <span class="pulse-ring"></span>
    </button>

    <!-- Chat Panel Window -->
    <div id="antra-widget-panel" class="hidden">
      <div class="widget-header">
        <div class="header-info">
          <img src="${serverURL}/logo.png" alt="Antra Logo" class="header-logo" />
          <div>
            <h4>Antra Agent</h4>
            <span class="online-indicator">Active Now</span>
          </div>
        </div>
        <button id="antra-widget-close" aria-label="Close Chat">&times;</button>
      </div>

      <div class="widget-chat-output" id="widget-chat-output">
        <div class="widget-message bot">
          <img class="widget-avatar bot" src="${serverURL}/logo.png" alt="Bot" />
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
      img.src = serverURL + '/logo.png';
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
      <img class="widget-avatar bot" src="${serverURL}/logo.png" alt="Bot" />
      <div class="widget-msg-content"><i>Thinking...</i></div>
    `;
    chatOutput.appendChild(loadingDiv);
    chatOutput.scrollTop = chatOutput.scrollHeight;

    try {
      const response = await fetch(serverURL + '/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      });
      const data = await response.json();

      document.getElementById(loadingId)?.remove();

      if (data.answer) {
        appendMessage('bot', data.answer);
      } else {
        appendMessage('bot', 'I could not process that request. Please try again.');
      }
    } catch (err) {
      console.error('Widget error:', err);
      document.getElementById(loadingId)?.remove();
      appendMessage('bot', '⚠️ Connection error. Server unreachable.');
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
