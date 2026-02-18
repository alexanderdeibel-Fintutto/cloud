/**
 * Fintutto AI Widget - Universelles Chat-Widget
 *
 * Einbinden mit einem Script-Tag in JEDER App:
 * <script src="https://your-cdn.com/fintutto-ai-widget.js"
 *         data-app-id="vermieterportal"
 *         data-supabase-url="https://xxx.supabase.co"
 *         data-supabase-key="eyJ..."></script>
 */

(function() {
  'use strict';

  // Konfiguration aus Script-Tag lesen
  const scriptTag = document.currentScript || document.querySelector('script[data-app-id]');
  const config = {
    appId: scriptTag?.getAttribute('data-app-id') || 'vermietify',
    supabaseUrl: scriptTag?.getAttribute('data-supabase-url') || '',
    supabaseKey: scriptTag?.getAttribute('data-supabase-key') || '',
    primaryColor: scriptTag?.getAttribute('data-color') || null,
    position: scriptTag?.getAttribute('data-position') || 'bottom-right',
  };

  // App-spezifische Defaults
  const APP_CONFIGS = {
    mieterportal: { title: 'Mieter-Assistent', color: '#10b981', placeholder: 'Frag mich zu Mietrecht...', duForm: true },
    vermieterportal: { title: 'Vermieter-Assistent', color: '#6366f1', placeholder: 'Frag mich zu Verwaltung...', duForm: false },
    vermietify: { title: 'Vermietify Assistent', color: '#6366f1', placeholder: 'Wie kann ich helfen?', duForm: false },
    mieterapp: { title: 'Wohn-Assistent', color: '#10b981', placeholder: 'Was kann ich fuer dich tun?', duForm: true },
    formulare: { title: 'Formulare Assistent', color: '#8b5cf6', placeholder: 'Welches Dokument?', duForm: false },
    rechner: { title: 'Rechner Assistent', color: '#f59e0b', placeholder: 'Was berechnen?', duForm: false },
    betriebskosten: { title: 'NK-Assistent', color: '#3b82f6', placeholder: 'Fragen zu Nebenkosten?', duForm: false },
    default: { title: 'Fintutto Assistent', color: '#6366f1', placeholder: 'Wie kann ich helfen?', duForm: false },
  };

  const appConfig = APP_CONFIGS[config.appId] || APP_CONFIGS.default;
  const primaryColor = config.primaryColor || appConfig.color;

  // Styles injizieren
  const styles = `
    #fintutto-ai-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #fintutto-ai-btn {
      position: fixed; ${config.position === 'bottom-left' ? 'left' : 'right'}: 24px; bottom: 24px;
      width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
      background: ${primaryColor}; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s; z-index: 99999;
    }
    #fintutto-ai-btn:hover { transform: scale(1.1); box-shadow: 0 6px 25px rgba(0,0,0,0.3); }
    #fintutto-ai-btn svg { width: 28px; height: 28px; fill: white; }
    #fintutto-ai-btn .pulse {
      position: absolute; top: -4px; right: -4px; width: 16px; height: 16px;
      background: #fbbf24; border-radius: 50%; animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    #fintutto-ai-chat {
      position: fixed; ${config.position === 'bottom-left' ? 'left' : 'right'}: 24px; bottom: 24px;
      width: 380px; max-width: calc(100vw - 48px); height: 500px; max-height: 70vh;
      background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      display: none; flex-direction: column; overflow: hidden; z-index: 99999;
      border: 1px solid #e5e7eb;
    }
    #fintutto-ai-chat.open { display: flex; }

    #fintutto-ai-header {
      padding: 16px; background: ${primaryColor}; color: white;
      display: flex; justify-content: space-between; align-items: center;
    }
    #fintutto-ai-header h3 { margin: 0; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    #fintutto-ai-close { background: none; border: none; color: white; cursor: pointer; padding: 4px; border-radius: 4px; }
    #fintutto-ai-close:hover { background: rgba(255,255,255,0.2); }

    #fintutto-ai-messages {
      flex: 1; overflow-y: auto; padding: 16px; background: #f9fafb;
      display: flex; flex-direction: column; gap: 12px;
    }
    .fintutto-msg {
      max-width: 85%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5;
      word-wrap: break-word; white-space: pre-wrap;
    }
    .fintutto-msg.user {
      align-self: flex-end; background: ${primaryColor}; color: white; border-bottom-right-radius: 4px;
    }
    .fintutto-msg.assistant {
      align-self: flex-start; background: white; border: 1px solid #e5e7eb;
      border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .fintutto-welcome {
      text-align: center; color: #6b7280; padding: 40px 20px;
    }
    .fintutto-welcome svg { width: 48px; height: 48px; fill: ${primaryColor}; opacity: 0.5; margin-bottom: 12px; }
    .fintutto-loading { display: flex; gap: 4px; padding: 12px 16px; }
    .fintutto-loading span {
      width: 8px; height: 8px; background: ${primaryColor}; border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out;
    }
    .fintutto-loading span:nth-child(1) { animation-delay: -0.32s; }
    .fintutto-loading span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

    #fintutto-ai-input-area {
      padding: 12px; border-top: 1px solid #e5e7eb; background: white; display: flex; gap: 8px;
    }
    #fintutto-ai-input {
      flex: 1; padding: 10px 16px; border: 1px solid #d1d5db; border-radius: 24px;
      font-size: 14px; outline: none; transition: border-color 0.2s;
    }
    #fintutto-ai-input:focus { border-color: ${primaryColor}; }
    #fintutto-ai-send {
      width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer;
      background: ${primaryColor}; display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s;
    }
    #fintutto-ai-send:disabled { opacity: 0.5; cursor: not-allowed; }
    #fintutto-ai-send svg { width: 18px; height: 18px; fill: white; }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // HTML erstellen
  const widget = document.createElement('div');
  widget.id = 'fintutto-ai-widget';
  widget.innerHTML = `
    <button id="fintutto-ai-btn" aria-label="KI-Assistent oeffnen">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>
      <div class="pulse"></div>
    </button>
    <div id="fintutto-ai-chat">
      <div id="fintutto-ai-header">
        <h3>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          ${appConfig.title}
        </h3>
        <button id="fintutto-ai-close" aria-label="Schliessen">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
      <div id="fintutto-ai-messages">
        <div class="fintutto-welcome">
          <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
          <p>${appConfig.duForm ? 'Hallo! Wie kann ich dir helfen?' : 'Guten Tag! Wie kann ich Ihnen helfen?'}</p>
        </div>
      </div>
      <div id="fintutto-ai-input-area">
        <input type="text" id="fintutto-ai-input" placeholder="${appConfig.placeholder}" />
        <button id="fintutto-ai-send" aria-label="Senden">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // Elemente referenzieren
  const btn = document.getElementById('fintutto-ai-btn');
  const chat = document.getElementById('fintutto-ai-chat');
  const closeBtn = document.getElementById('fintutto-ai-close');
  const input = document.getElementById('fintutto-ai-input');
  const sendBtn = document.getElementById('fintutto-ai-send');
  const messages = document.getElementById('fintutto-ai-messages');

  let conversationHistory = [];
  let isLoading = false;

  // Event Listeners
  btn.addEventListener('click', () => {
    chat.classList.add('open');
    btn.style.display = 'none';
    input.focus();
  });

  closeBtn.addEventListener('click', () => {
    chat.classList.remove('open');
    btn.style.display = 'flex';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isLoading) return;

    input.value = '';
    isLoading = true;
    sendBtn.disabled = true;

    // Welcome entfernen
    const welcome = messages.querySelector('.fintutto-welcome');
    if (welcome) welcome.remove();

    // User Message anzeigen
    addMessage(text, 'user');
    conversationHistory.push({ role: 'user', content: text });

    // Loading anzeigen
    const loadingEl = document.createElement('div');
    loadingEl.className = 'fintutto-msg assistant fintutto-loading';
    loadingEl.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(loadingEl);
    messages.scrollTop = messages.scrollHeight;

    try {
      // Supabase Edge Function aufrufen
      const response = await fetch(`${config.supabaseUrl}/functions/v1/aiCoreService`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.supabaseKey}`,
        },
        body: JSON.stringify({
          appId: config.appId,
          userTier: 'pro',
          prompt: text,
          userId: getOrCreateUserId(),
          conversationHistory: conversationHistory.slice(-6),
        }),
      });

      const data = await response.json();
      loadingEl.remove();

      if (data.success) {
        addMessage(data.content, 'assistant');
        conversationHistory.push({ role: 'assistant', content: data.content });
      } else {
        addMessage(data.error || 'Es gab einen Fehler. Bitte versuche es erneut.', 'assistant');
      }
    } catch (error) {
      loadingEl.remove();
      addMessage('Verbindungsfehler. Bitte versuche es erneut.', 'assistant');
      console.error('Fintutto AI Error:', error);
    }

    isLoading = false;
    sendBtn.disabled = false;
  }

  function addMessage(text, role) {
    const msg = document.createElement('div');
    msg.className = `fintutto-msg ${role}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function getOrCreateUserId() {
    let id = localStorage.getItem('fintutto_user_id');
    if (!id) {
      id = 'anon_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('fintutto_user_id', id);
    }
    return id;
  }

  console.log('Fintutto AI Widget loaded for:', config.appId);
})();
