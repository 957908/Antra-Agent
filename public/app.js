document.addEventListener('DOMContentLoaded', () => {
  // Constants & Element Selectors
  const asciiCube = document.getElementById('ascii-cube-output');
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const chatOutput = document.getElementById('chat-output');
  const agendaList = document.getElementById('agenda-list');
  const suggestionsList = document.getElementById('suggestions-list');
  const scanReposBtn = document.getElementById('scan-repos-btn');
  const smsMessage = document.getElementById('sms-message');
  const smsSendBtn = document.getElementById('sms-send-btn');
  const smsStatus = document.getElementById('sms-status');

  // --- 1. Dynamic ASCII Cube Stream ---
  // Fetch new rotated cube frames from the server ASCII 3D engine
  function updateAsciiCube() {
    fetch('/api/logo/3d')
      .then(res => res.text())
      .then(text => {
        asciiCube.textContent = text;
      })
      .catch(err => {
        console.error('Error fetching 3D ASCII frame:', err);
        asciiCube.textContent = '3D Core Connection Paused...';
      });
  }

  // Update ASCII frame every 120ms for smooth spinning action
  setInterval(updateAsciiCube, 120);

  // --- 2. Chat / Q&A Client ---
  function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    
    if (sender === 'bot') {
      const avatarImg = document.createElement('img');
      avatarImg.classList.add('avatar', 'bot-avatar');
      avatarImg.src = 'logo.png';
      avatarImg.alt = 'Bot';
      msgDiv.appendChild(avatarImg);
    } else {
      const avatarDiv = document.createElement('div');
      avatarDiv.classList.add('avatar', 'user-avatar');
      avatarDiv.textContent = '👤';
      msgDiv.appendChild(avatarDiv);
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('msg-content');
    contentDiv.textContent = text;
    
    msgDiv.appendChild(contentDiv);
    chatOutput.appendChild(msgDiv);
    
    // Auto-scroll to bottom
    chatOutput.scrollTop = chatOutput.scrollHeight;
  }

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
        default: 'That\'s a great question! Let help you with GitHub and development tasks.'
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

  async function handleSendQuestion() {
    const question = chatInput.value.trim();
    if (!question) return;

    // Clear input & display user question
    chatInput.value = '';
    appendMessage('user', question);

    // Display temporary loading message
    const botLoadingId = 'bot-loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'bot');
    loadingDiv.id = botLoadingId;
    loadingDiv.innerHTML = `
      <img class="avatar bot-avatar" src="logo.png" alt="Bot" />
      <div class="msg-content"><i>Thinking...</i></div>
    `;
    chatOutput.appendChild(loadingDiv);
    chatOutput.scrollTop = chatOutput.scrollHeight;

    let answer = null;

    if (window.location.protocol !== 'file:') {
      try {
        const response = await fetch('/api/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question })
        });
        const data = await response.json();
        answer = data.answer;
      } catch (err) {
        console.warn('Backend server offline. Falling back to client-side Q&A.', err);
      }
    }

    // Offline / static fallback
    if (!answer) {
      const localQA = new LocalQAHandler();
      answer = localQA.handleQuestion(question);
    }

    // Remove loading message
    document.getElementById(botLoadingId)?.remove();
    appendMessage('bot', answer);
  }

  chatSendBtn.addEventListener('click', handleSendQuestion);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendQuestion();
  });

  // --- 3. Load Daily Agenda ---
  async function loadAgenda() {
    let agendaData = null;

    if (window.location.protocol !== 'file:') {
      try {
        const response = await fetch('/api/agenda');
        const data = await response.json();
        agendaData = data.agenda;
      } catch (err) {
        console.warn('Failed to load agenda from backend. Using static fallback data.', err);
      }
    }

    // Offline static fallback data
    if (!agendaData) {
      agendaData = [
        { id: 1, type: 'Issue', title: 'Fix broken login redirect in frontend', repo: 'web-app', status: 'open' },
        { id: 2, type: 'PR', title: 'Feature/user-profile-enhancement', repo: 'backend-api', status: 'review-required' },
        { id: 3, type: 'Notification', title: 'User @957908 mentioned you in a comment', repo: 'Antra-Agent', status: 'unread' }
      ];
    }
      
    agendaList.innerHTML = '';
    if (agendaData.length === 0) {
      agendaList.innerHTML = '<div class="list-item">No items on agenda today!</div>';
      return;
    }

    agendaData.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('list-item');
      
      let typeTagClass = 'tag-notification';
      if (item.type.toLowerCase() === 'issue') typeTagClass = 'tag-issue';
      if (item.type.toLowerCase() === 'pr') typeTagClass = 'tag-pr';

      itemDiv.innerHTML = `
        <div class="item-left">
          <span class="item-tag ${typeTagClass}">${item.type}</span>
          <span class="item-title">${item.title}</span>
          <span class="item-repo">Repo: ${item.repo}</span>
        </div>
        <span class="item-status">${item.status}</span>
      `;
      agendaList.appendChild(itemDiv);
    });
  }

  // --- 4. Load AI Suggestions ---
  async function loadSuggestions() {
    let suggestionsData = null;

    if (window.location.protocol !== 'file:') {
      try {
        const response = await fetch('/api/suggestions');
        const data = await response.json();
        suggestionsData = data.suggestions;
      } catch (err) {
        console.warn('Failed to load suggestions from backend. Using static fallback data.', err);
      }
    }

    // Offline static fallback data
    if (!suggestionsData) {
      suggestionsData = [
        { id: 1, priority: 'High', task: 'Review pull request #12 (user-profile-enhancement)', reason: 'Awaiting your approval for more than 24 hours.' },
        { id: 2, priority: 'Medium', task: 'Resolve issue #45: Fix broken login redirect', reason: 'High impact bug reported by 3 users.' },
        { id: 3, priority: 'Low', task: 'Refactor qa-handler.js to support custom NLP database', reason: 'Increases Q&A answer accuracy.' }
      ];
    }

    suggestionsList.innerHTML = '';
    if (suggestionsData.length === 0) {
      suggestionsList.innerHTML = '<div class="list-item">No recommendations found.</div>';
      return;
    }

    suggestionsData.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('list-item');

      let prioClass = 'tag-priority-low';
      if (item.priority.toLowerCase() === 'high') prioClass = 'tag-priority-high';
      if (item.priority.toLowerCase() === 'medium') prioClass = 'tag-priority-medium';

      itemDiv.innerHTML = `
        <div class="item-left">
          <span class="item-tag ${prioClass}">${item.priority} Priority</span>
          <span class="item-title">${item.task}</span>
          <span class="item-reason">${item.reason}</span>
        </div>
      `;
      suggestionsList.appendChild(itemDiv);
    });
  }

  // --- 5. GitHub Repository Scanner ---
  scanReposBtn.addEventListener('click', async () => {
    scanReposBtn.disabled = true;
    scanReposBtn.textContent = 'Scanning...';
    
    try {
      const response = await fetch('/api/scan', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        // Refresh both lists
        await Promise.all([loadAgenda(), loadSuggestions()]);
        
        // Show success animation
        const originalText = scanReposBtn.textContent;
        scanReposBtn.textContent = 'Scan Complete! ✓';
        scanReposBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
          scanReposBtn.disabled = false;
          scanReposBtn.textContent = 'Scan GitHub';
          scanReposBtn.style.background = '';
        }, 2000);
      }
    } catch (err) {
      console.error('Error scanning repos:', err);
      scanReposBtn.disabled = false;
      scanReposBtn.textContent = 'Scan Failed';
      setTimeout(() => {
        scanReposBtn.textContent = 'Scan GitHub';
      }, 2000);
    }
  });

  // --- 6. Twilio SMS Notification Sender ---
  smsSendBtn.addEventListener('click', async () => {
    const text = smsMessage.value.trim();
    if (!text) return;

    smsSendBtn.disabled = true;
    smsStatus.className = 'status-msg';
    smsStatus.textContent = 'Sending message...';

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();

      if (data.success) {
        smsStatus.classList.add('success');
        smsStatus.textContent = `✓ SMS Sim Complete! Sent to ${data.details.to}`;
        smsMessage.value = '';
      } else {
        smsStatus.classList.add('error');
        smsStatus.textContent = `Error sending SMS: ${data.error}`;
      }
    } catch (err) {
      console.error('Error sending SMS:', err);
      smsStatus.classList.add('error');
      smsStatus.textContent = 'SMS request failed. Server error.';
    } finally {
      smsSendBtn.disabled = false;
      setTimeout(() => {
        smsStatus.textContent = '';
      }, 5000);
    }
  });

  // --- 7. Initial Page Load ---
  loadAgenda();
  loadSuggestions();
});
