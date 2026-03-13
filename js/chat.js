// Gemini AI Integration
const WORKER_URL = "https://ai.amkyaw.workers.dev/";

// Chat state
let messages = [];
let currentTab = 'chat';

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    sidebar.classList.toggle('open');
}

// Switch between chat and coder tabs
function switchTab(tab) {
    currentTab = tab;
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'chat') {
        tabs[0].classList.add('active');
        window.location.href = 'chat.html';
    } else {
        tabs[1].classList.add('active');
        window.location.href = 'coder.html';
    }
}

// New chat
function newChat() {
    messages = [];
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="message bot">
            <div class="message-content">
                Hello! How can I help you today?
            </div>
        </div>
    `;
}

// Send message to AI
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingId = showTypingIndicator();
    
    try {
        // Call Gemini AI through worker
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: messages
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        // Add AI response
        addMessage(data.response, 'bot');
        
        // If response contains code, offer to open in coder
        if (data.response.includes('```') || data.response.includes('function') || data.response.includes('class')) {
            showCodeOption(data.response);
        }
        
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator(typingId);
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

// Add message to chat
function addMessage(text, sender) {
    messages.push({ text, sender, timestamp: new Date() });
    
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            ${text.replace(/\n/g, '<br>')}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = id;
    typingDiv.className = 'message bot';
    typingDiv.innerHTML = `
        <div class="message-content">
            <i class="fas fa-circle-notch fa-spin"></i> Thinking...
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

// Remove typing indicator
function removeTypingIndicator(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

// File upload
function uploadFile() {
    const fileInput = document.getElementById('fileUpload');
    fileInput.click();
    
    fileInput.onchange = function(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                addMessage(`📎 Uploaded: ${file.name}`, 'user');
                // Process file content
                processFile(file.name, e.target.result);
            };
            reader.readAsText(file);
        });
    };
}

// Process uploaded file
function processFile(filename, content) {
    // Add file content to context
    messages.push({
        text: `File: ${filename}\nContent:\n${content}`,
        sender: 'system',
        timestamp: new Date()
    });
}

// Show code option
function showCodeOption(codeContent) {
    const chatMessages = document.getElementById('chatMessages');
    const optionDiv = document.createElement('div');
    optionDiv.className = 'message bot';
    optionDiv.innerHTML = `
        <div class="message-content">
            <p>I detected code in my response. Would you like to open it in the coder?</p>
            <button onclick="openInCoder()" style="padding: 10px 20px; background: linear-gradient(45deg, #667eea, #764ba2); border: none; border-radius: 8px; color: white; cursor: pointer; margin-top: 10px;">
                Open in Coder
            </button>
        </div>
    `;
    chatMessages.appendChild(optionDiv);
}

// Open in coder with extracted code
function openInCoder() {
    // Extract code from last bot message
    const lastBotMessage = messages.filter(m => m.sender === 'bot').pop();
    if (lastBotMessage) {
        const codeMatch = lastBotMessage.text.match(/```(?:\w+)?\n([\s\S]*?)```/);
        if (codeMatch) {
            localStorage.setItem('pendingCode', codeMatch[1]);
            window.location.href = 'coder.html';
        }
    }
}

// Auto-resize textarea
document.getElementById('messageInput')?.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Enter to send (Shift+Enter for new line)
document.getElementById('messageInput')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
