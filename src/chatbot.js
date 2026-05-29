/* ----------------------------------------------------
 * FLOATING AI PORTFOLIO ASSISTANT (CHATBOT) ENGINE
 * ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const widget = document.querySelector('.chatbot-widget');
  const toggleBtn = document.getElementById('chatToggle');
  const closeBtn = document.getElementById('chatClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const quickQueries = document.getElementById('quickQueries');
  const badgeDot = document.querySelector('.chat-badge-dot');

  let chatbotInitialized = false;

  // 1. Toggle Chat Drawer Display
  toggleBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', closeChat);

  function toggleChat() {
    const isActive = widget.classList.contains('active');
    if (isActive) {
      closeChat();
    } else {
      openChat();
    }
  }

  function openChat() {
    widget.classList.add('active');
    
    // Hide notification badge
    if (badgeDot) {
      badgeDot.style.opacity = '0';
      badgeDot.style.transform = 'scale(0)';
    }

    // Initialize greeting on first open
    if (!chatbotInitialized) {
      simulateGreeting();
      chatbotInitialized = true;
    }

    // Focus input on desktop
    setTimeout(() => {
      if (window.innerWidth > 768) {
        chatInput.focus();
      }
    }, 400);
  }

  function closeChat() {
    widget.classList.remove('active');
  }

  // 2. Textarea Auto-height resizing
  chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if (this.scrollHeight > 80) {
      this.style.overflowY = 'auto';
    } else {
      this.style.overflowY = 'hidden';
    }
  });

  // 3. Send message actions
  sendBtn.addEventListener('click', handleUserSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserSend();
    }
  });

  function handleUserSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Append user message
    appendMessage(text, 'user');
    chatInput.value = '';
    chatInput.style.height = '38px'; // Reset height

    // Trigger bot typing simulation
    simulateBotResponse(text);
  }

  // 4. Append message nodes to body
  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    
    if (sender === 'bot') {
      msgDiv.innerHTML = text; // Safe for rich-HTML responses we generate
    } else {
      msgDiv.textContent = text;
    }
    
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
    return msgDiv;
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 5. Simulated Bot Responses
  const responses = {
    greeting: "Hi there! 👋 I am Krishna's AI portfolio assistant. Ask me anything about her designs, process, or availability!",
    
    about: "<b>Krishna Banerjee</b> is a creative UI/UX Designer based in West Bengal, India. <br><br>Having started her journey with a Computer Science background, she has a strong foundation in frontend coding, but she fell in love with design and transitioned fully. She now works exclusively as a UI/UX designer, combining systems thinking with a designer's eye to build intuitive, user-centered digital products.",
    
    services: "Krishna offers professional services in:<br>🎯 <b>UI/UX Design</b> (Mobile apps, SaaS dashboards, and Web UI/UX)<br>✨ <b>Interaction Design</b> (High-fidelity interactive prototypes, micro-interactions, and motion design)<br>🎨 <b>Design Systems</b> (Scalable component libraries, variables, and developer-ready handoff specs in Figma)",
    
    availability: "Yes, she is! 🟢 Krishna is actively seeking <b>full-time roles</b> and <b>freelance contracts</b>. <br><br>To discuss project ideas or openings, feel free to click the <b>'Let's Connect'</b> button in the header or email her directly at <a href='mailto:banerjeekrishnaaa35@gmail.com' style='color:var(--accent-purple);font-weight:700;text-decoration:underline;'>banerjeekrishnaaa35@gmail.com</a>!",
    
    projects: "Krishna has built some amazing projects that made her think hard! Here are the featured designs in her Selected Work section:<br><br>1. 🛡️ <b>Iraje PAM Dashboard redesign</b> (Enterprise UX)<br>🎨 <b>Artistry Connect</b> (Artist-client Matchmaking App)<br>📅 <b>TUDU Task Management</b> (Calm task workflow UI)<br>💬 <b>Scheduling Messages on WhatsApp</b> (Mobile UX concept)<br>🏆 <b>Designathon Club Duelz</b> (Sports UX match manager)<br>💼 <b>The Sales Studio Internship</b> (SaaS & PWA designs)<br><br>Feel free to scroll down to her <b>Selected Work</b> section to view detailed write-ups and visual mockups for each of them!",
    
    default: "That's an interesting question! While I am currently running as her interactive portfolio preview, I'd love to help you reach out to her. You can contact Krishna directly via email or connect through her social links at the bottom left of the page!"
  };

  function simulateGreeting() {
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      appendMessage(responses.greeting, 'bot');
    }, 1200);
  }

  function simulateBotResponse(userText) {
    showTypingIndicator();
    
    // Determine response matching
    const query = userText.toLowerCase();
    let replyText = responses.default;
    
    if (query.includes('who') || query.includes('krishna') || query.includes('about') || query.includes('background')) {
      replyText = responses.about;
    } else if (query.includes('service') || query.includes('offer') || query.includes('do you do') || query.includes('skills')) {
      replyText = responses.services;
    } else if (query.includes('hire') || query.includes('hiring') || query.includes('available') || query.includes('job') || query.includes('freelance')) {
      replyText = responses.availability;
    } else if (query.includes('project') || query.includes('work') || query.includes('portfolio')) {
      replyText = responses.projects;
    }

    // Delay response for cognitive natural typing effect
    const delay = Math.max(1000, Math.min(2500, replyText.length * 12));
    
    setTimeout(() => {
      hideTypingIndicator();
      appendMessage(replyText, 'bot');
    }, delay);
  }

  // Typing Bouncing Indicator
  let typingIndicatorNode = null;

  function showTypingIndicator() {
    if (typingIndicatorNode) return;
    
    const indicator = document.createElement('div');
    indicator.classList.add('message', 'bot', 'typing');
    indicator.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;
    
    chatMessages.appendChild(indicator);
    typingIndicatorNode = indicator;
    scrollToBottom();
  }

  function hideTypingIndicator() {
    if (typingIndicatorNode && typingIndicatorNode.parentNode) {
      typingIndicatorNode.parentNode.removeChild(typingIndicatorNode);
      typingIndicatorNode = null;
    }
  }

  // 6. Handle Quick Query Clicks
  quickQueries.addEventListener('click', (e) => {
    const btn = e.target.closest('.quick-btn');
    if (!btn) return;
    
    const query = btn.getAttribute('data-query');
    appendMessage(query, 'user');
    simulateBotResponse(query);
  });
});
