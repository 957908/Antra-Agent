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

    try {
      const response = await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await response.json();
      
      // Remove loading message
      document.getElementById(botLoadingId)?.remove();

      // Render actual answer
      if (data.answer) {
        appendMessage('bot', data.answer);
      } else {
        appendMessage('bot', 'Sorry, I couldn\'t generate an answer. Please try again.');
      }
    } catch (err) {
      console.error('Error contacting Q&A API:', err);
      document.getElementById(botLoadingId)?.remove();
      appendMessage('bot', '⚠️ Connection error. Unable to contact Antra Q&A system.');
    }
  }

  chatSendBtn.addEventListener('click', handleSendQuestion);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendQuestion();
  });

  // --- 3. Load Daily Agenda ---
  async function loadAgenda() {
    try {
      const response = await fetch('/api/agenda');
      const data = await response.json();
      
      agendaList.innerHTML = '';
      if (!data.agenda || data.agenda.length === 0) {
        agendaList.innerHTML = '<div class="list-item">No items on agenda today!</div>';
        return;
      }

      data.agenda.forEach(item => {
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
    } catch (err) {
      console.error('Error fetching agenda:', err);
      agendaList.innerHTML = '<div class="list-item">Error loading agenda items.</div>';
    }
  }

  // --- 4. Load AI Suggestions ---
  async function loadSuggestions() {
    try {
      const response = await fetch('/api/suggestions');
      const data = await response.json();

      suggestionsList.innerHTML = '';
      if (!data.suggestions || data.suggestions.length === 0) {
        suggestionsList.innerHTML = '<div class="list-item">No recommendations found.</div>';
        return;
      }

      data.suggestions.forEach(item => {
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
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      suggestionsList.innerHTML = '<div class="list-item">Error loading suggestions.</div>';
    }
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
