
    // PASTE THIS AT THE TOP OF YOUR SCRIPT
async function generateWithRetry(model, prompt) {
    let attempts = 0;
    while (attempts < 5) { // Try up to 5 times
        try {
            // Attempt to call the API
            // const result = await model.generateContent(prompt);
            // NEW WAY (Use the function you pasted in Step 2)
            const result = await generateWithRetry(model, prompt);
            return result; // If successful, return the result
        } catch (error) {
            // Check if the error is "Too Many Requests" (429)
            if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
                console.warn(`Quota hit. Waiting 10 seconds before retry #${attempts + 1}...`);
                // Wait for 10 seconds
                await new Promise(resolve => setTimeout(resolve, 10000)); 
                attempts++;
            } else {
                throw error; // If it's a different error, stop.
            }
        }
    }
    throw new Error("Failed after 5 retries due to rate limits.");
}
    // --- API CONFIGURATION ---
    // PASTE YOUR GOOGLE GEMINI API KEY HERE
    const apiKey = "config.API_KEY"; 

    /* 1. GATEWAY LOGIC (FORCED RESET) */
    const gateway = document.getElementById('gateway');
    const initBtn = document.getElementById('initBtn');

    // Using a NEW key 'nexgen_init_v2' to force it to show even if you visited before.
    if(!localStorage.getItem('nexgen_init_v2')) {
        gateway.classList.add('active');
    }

    function initializeSystem() {
        // Visual Feedback
        initBtn.classList.add('btn-loading');
        initBtn.innerHTML = '<span>VERIFYING ID...</span> <i class="fa-solid fa-spinner"></i>';
        
        // Mock Delay
        setTimeout(() => {
            initBtn.innerHTML = '<span>ACCESS GRANTED</span> <i class="fa-solid fa-check"></i>';
            initBtn.style.background = '#10b981';
            
            setTimeout(() => {
                gateway.style.opacity = '0';
                localStorage.setItem('nexgen_init_v2', 'true');
                setTimeout(() => {
                    gateway.classList.remove('active');
                }, 600);
            }, 800);
        }, 1200);
    }

    /* 2. THEME LOGIC */
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = toggleBtn.querySelector('i');
    
    if(localStorage.getItem('theme') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        body.removeAttribute('data-theme');
        icon.classList.replace('fa-sun', 'fa-moon');
    }

    toggleBtn.addEventListener('click', () => {
        if(body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme'); icon.classList.replace('fa-sun', 'fa-moon'); localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark'); icon.classList.replace('fa-moon', 'fa-sun'); localStorage.setItem('theme', 'dark');
        }
    });

    /* 3. MOBILE SIDEBAR */
    function toggleMainSidebar() {
        document.getElementById('mainSidebar').classList.toggle('open');
    }
    document.addEventListener('click', function(event) {
        const sidebar = document.getElementById('mainSidebar');
        const btn = document.querySelector('.mobile-menu-btn');
        if (window.innerWidth <= 1024 && !sidebar.contains(event.target) && !btn.contains(event.target) && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    /* 4. CHATBOT LOGIC (INTEGRATED) */
    const widget = document.getElementById('ai-widget');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    let firstOpen = true;

    function toggleChat() {
        widget.classList.toggle('expanded');
        if(widget.classList.contains('expanded') && firstOpen) {
            firstOpen = false;
            setTimeout(() => addMessage("ai", "Hi John, how can I help you today?"), 500);
        }
    }

    function handleEnter(e) { if(e.key === 'Enter') sendMessage(); }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if(!text) return;

        // 1. Add User Message
        addMessage("user", text);
        chatInput.value = '';
        const typingId = showTyping();

        // 2. Check for API Key
        if (!apiKey) {
            setTimeout(() => {
                removeTyping(typingId);
                addMessage("ai", "Error: API Key is missing. Please open the code file and paste your Google Gemini API key into the 'const apiKey' variable at the bottom of the script.");
            }, 600);
            return;
        }

        // 3. Call Gemini API
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: text }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            removeTyping(typingId);

            // 4. Parse and Display Response
            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                addMessage("ai", aiResponse);
            } else {
                addMessage("ai", "I'm having trouble thinking right now. Please try again.");
            }

        } catch (error) {
            console.error(error);
            removeTyping(typingId);
            addMessage("ai", "Connection error. Please check your internet or API key.");
        }
    }

    function addMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `msg msg-${sender}`;
        div.textContent = text;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showTyping() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.className = 'typing-indicator';
        div.id = id;
        div.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
        return id;
    }

    function removeTyping(id) { const el = document.getElementById(id); if(el) el.remove(); }
