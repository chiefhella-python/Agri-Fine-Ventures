// ============================================
// AGRI-FINE VENTURES — AI ASSISTANT
// ============================================

const AIAssistant = {
  messages: [],
  isLoading: false,

  init() {
    this.messages = [{
      role: 'assistant',
      content: 'Hello! I\'m your Agri-Fine AI Assistant 🌾. I specialize in greenhouse horticulture — tomatoes, capsicum, pest management, irrigation, nutrients, and crop scheduling. How can I help you today?'
    }];
  },

  getSystemPrompt() {
    const ghSummary = AFV.greenhouses.map(gh => {
      const pending = gh.tasks.filter(t => !t.completed).map(t => t.name).slice(0,3);
      return `${gh.name}: ${gh.crop} (${gh.variety}), planted ${Math.floor((new Date()-gh.plantedDate)/(1000*60*60*24))} days ago, ${AFV.getOverallProgress(gh)}% tasks done, pending: ${pending.join(', ') || 'none'}`;
    }).join('\n');

    return `You are the Agri-Fine Assistant, an expert AI for Agri-Fine Ventures, a commercial greenhouse horticulture farm in Kenya. 

Farm Context:
${ghSummary}

Current user role: ${AFV.currentUser?.role || 'unknown'}
User: ${AFV.currentUser?.name || 'Unknown'}

You are an expert in:
- Commercial greenhouse horticulture (tomatoes, capsicum, cucumbers, herbs)
- Hydroponic and soil-based growing systems
- Integrated Pest Management (IPM)
- Crop nutrition and fertigation
- Disease diagnosis and treatment
- Irrigation scheduling and management
- Post-harvest handling
- Kenyan agricultural context and local conditions

Guidelines:
- Be concise but thorough
- Use specific product names, rates, and timings when relevant
- Consider the Kenyan climate and market context
- Reference the farm's actual greenhouses and crops when relevant
- Provide actionable advice with specific steps
- Flag urgent issues prominently
- If asked about tasks, reference the actual pending tasks in the farm`;
  },

  async sendMessage(userMessage) {
    if (!userMessage.trim() || this.isLoading) return;

    this.addMessage('user', userMessage);
    this.showThinking();
    this.isLoading = true;

    try {
      const provider = AFV.aiSettings.provider;
      const apiKey = AFV.aiSettings.apiKey;

      if (!apiKey) {
        this.hideThinking();
        this.addMessage('assistant', '⚙️ **No API key configured!**\n\nTo use the AI Assistant:\n1. Click the "API Settings" button above\n2. Select your AI provider (Anthropic, OpenAI, or Google)\n3. Enter your API key\n4. Click Save\n\nYour key is stored locally and used directly to call the AI service. Once configured, I can answer all your agricultural questions!');
        this.isLoading = false;
        return;
      }

      let response;

      if (provider === 'openai') {
        response = await this.callOpenAI(apiKey, userMessage);
      } else if (provider === 'gemini') {
        response = await this.callGemini(apiKey, userMessage);
      } else {
        response = await this.callAnthropic(apiKey, userMessage);
      }

      this.hideThinking();
      this.addMessage('assistant', response);

    } catch (err) {
      this.hideThinking();
      this.addMessage('assistant', `❌ Error: ${err.message}\n\nPlease check your API key and try again. Make sure your key is valid for the selected provider.`);
    }

    this.isLoading = false;
  },

  async callAnthropic(apiKey, userMessage) {
    const msgs = this.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        system: this.getSystemPrompt(),
        messages: msgs
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.content[0].text;
  },

  async callOpenAI(apiKey, userMessage) {
    const msgs = [
      { role: 'system', content: this.getSystemPrompt() },
      ...this.messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o', messages: msgs, max_tokens: 1024 })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  },

  async callGemini(apiKey, userMessage) {
    const history = this.messages.slice(-8).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [...history, { role: 'user', parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: this.getSystemPrompt() }] }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  },

  addMessage(role, content) {
    this.messages.push({ role, content });
    const container = document.getElementById('ai-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `ai-message ${role}`;
    div.innerHTML = `
      <div class="msg-avatar">${role === 'user' ? (AFV.currentUser?.avatar || '👤') : '🌾'}</div>
      <div class="msg-bubble">${this.formatMessage(content)}</div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/, '<p>$1</p>');
  },

  showThinking() {
    const container = document.getElementById('ai-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'ai-message assistant thinking';
    div.id = 'ai-thinking';
    div.innerHTML = `<div class="msg-avatar">🌾</div><div class="msg-bubble">Thinking<span id="thinking-dots">...</span></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    let dots = 0;
    this._thinkingInterval = setInterval(() => {
      const el = document.getElementById('thinking-dots');
      if (el) el.textContent = '.'.repeat((++dots % 3) + 1);
    }, 400);
  },

  hideThinking() {
    clearInterval(this._thinkingInterval);
    const el = document.getElementById('ai-thinking');
    if (el) el.remove();
  }
};

// Global AI functions
function openAIModal() {
  document.getElementById('ai-modal').style.display = 'flex';
  
  // Hide API Settings for workers and agronomists (only admin can configure AI)
  const settingsBtn = document.getElementById('ai-settings-btn');
  const settingsPanel = document.getElementById('ai-settings-panel');
  
  if (AFV.currentUser && AFV.currentUser.role !== 'admin') {
    if (settingsBtn) settingsBtn.style.display = 'none';
    if (settingsPanel) settingsPanel.style.display = 'none';
  } else {
    if (settingsBtn) settingsBtn.style.display = 'inline-flex';
  }
}

function closeAIModal() {
  document.getElementById('ai-modal').style.display = 'none';
}

function toggleAISettings() {
  const panel = document.getElementById('ai-settings-panel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function saveAISettings() {
  const provider = document.getElementById('ai-provider')?.value;
  const key = document.getElementById('ai-api-key')?.value;
  if (provider) AFV.aiSettings.provider = provider;
  if (key) AFV.aiSettings.apiKey = key;
  showToast('AI settings saved! ✓', 'success');
  toggleAISettings();
}

function sendAIMessage() {
  const input = document.getElementById('ai-input');
  const msg = input?.value?.trim();
  if (msg) {
    input.value = '';
    AIAssistant.sendMessage(msg);
  }
}

function sendQuickMsg(msg) {
  AIAssistant.sendMessage(msg);
}

function handleAIKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendAIMessage();
  }
}
