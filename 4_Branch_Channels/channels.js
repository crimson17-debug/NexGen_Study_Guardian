
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
    /* THEME TOGGLE */
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = toggleBtn.querySelector('i');
    if(localStorage.getItem('theme') === 'dark') { body.setAttribute('data-theme', 'dark'); icon.classList.replace('fa-moon', 'fa-sun'); }
    toggleBtn.addEventListener('click', () => {
        if(body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme'); icon.classList.replace('fa-sun', 'fa-moon'); localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark'); icon.classList.replace('fa-moon', 'fa-sun'); localStorage.setItem('theme', 'dark');
        }
    });

    /* MOBILE SIDEBAR TOGGLE */
    function toggleMainSidebar() {
        document.getElementById('mainSidebar').classList.toggle('open');
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const sidebar = document.getElementById('mainSidebar');
        const btn = document.querySelector('.mobile-menu-btn');
        if (window.innerWidth <= 1024 && !sidebar.contains(event.target) && !btn.contains(event.target) && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    /* --- PERMISSION & BRANCH LOGIC --- */
    let currentRestrictedBranch = null;
    const restrictedBranches = ['CSE', 'ECE', 'MECH', 'CIVIL'];

    function selectBranch(element, branchName) {
        // Update Active State
        const allBranches = document.querySelectorAll('.branch-item');
        allBranches.forEach(b => b.classList.remove('active'));
        element.classList.add('active');

        // Update UI
        document.getElementById('currentBranchName').innerText = branchName;
        
        // Check Restriction
        const isRestricted = restrictedBranches.includes(branchName);

        if (isRestricted) {
            // Lock UI Logic
            currentRestrictedBranch = branchName;
            document.getElementById('channelIconWrapper').innerHTML = '<i class="fa-solid fa-lock" style="color:#ef4444; font-size:1.2rem;"></i>';
            showLockedScreen(branchName);
            openPermissionModal(branchName); // Auto-trigger modal
        } else {
            // Standard Access
            currentRestrictedBranch = null;
            document.getElementById('channelIconWrapper').innerHTML = '<span style="color:var(--text-muted); font-size:1.5rem;">#</span>';
            loadBranchChat(branchName, branchName, false);
        }
    }

    function showLockedScreen(branchName) {
        const feed = document.getElementById('mainChatFeed');
        const inputArea = document.getElementById('chatInputArea');
        
        // Hide Input Area for locked channels
        inputArea.style.display = 'none';

        feed.innerHTML = `
            <div class="locked-view">
                <i class="fa-solid fa-lock locked-icon"></i>
                <div class="locked-title">Access to ${branchName} is Restricted</div>
                <p>This channel is reserved for verified students of this branch.</p>
                <button class="locked-btn" onclick="openPermissionModal('${branchName}')">Request Permission</button>
            </div>
        `;
    }

    /* PERMISSION MODAL FUNCTIONS */
    function openPermissionModal(branchName) {
        const name = branchName || currentRestrictedBranch; 
        document.getElementById('targetBranch').innerText = name;
        document.getElementById('permissionModal').style.display = 'flex';
        document.getElementById('rollNoInput').value = ''; 
        document.getElementById('rollNoInput').focus();
    }

    function closePermissionModal() {
        document.getElementById('permissionModal').style.display = 'none';
    }

    function submitPermissionRequest() {
        const rollNo = document.getElementById('rollNoInput').value.trim();
        if(!rollNo) {
            alert("Please enter your Roll Number.");
            return;
        }

        const btn = document.getElementById('sendRequestBtn');
        const originalText = btn.innerText;
        btn.innerText = "Verifying...";
        btn.disabled = true;

        // Simulate API verification delay
        setTimeout(() => {
            btn.innerText = originalText;
            btn.disabled = false;
            closePermissionModal();
            
            // Grant Access Simulation
            document.getElementById('channelIconWrapper').innerHTML = '<i class="fa-solid fa-lock-open" style="color:var(--success); font-size:1.2rem;"></i>';
            loadBranchChat(currentRestrictedBranch, currentRestrictedBranch, true); // true = unlocked
        }, 1200);
    }

    function loadBranchChat(branchName, branchCode, isUnlocked) {
        const feed = document.getElementById('mainChatFeed');
        const inputArea = document.getElementById('chatInputArea');
        
        // Show Input Area
        inputArea.style.display = 'block';

        const subText = isUnlocked 
            ? `<span style="color:var(--success);"><i class="fa-solid fa-check-circle"></i> Access Granted</span>` 
            : 'Public Channel';

        feed.innerHTML = `
            <div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.9rem;">
                <i class="fa-solid fa-arrow-right-arrow-left"></i> Switched to <strong>${branchName}</strong>
            </div>
            <div class="message-group">
                <div class="user-avatar" style="background:#64748b;">SYS</div>
                <div class="msg-content">
                    <div class="msg-header"><span class="username">System</span> <span class="timestamp">Now</span></div>
                    <div class="msg-text">Welcome to the ${branchCode} channel. <br><strong>Status: ${subText}</strong></div>
                </div>
            </div>
        `;
    }

    /* CHANNEL SELECT (Legacy from previous, updated for lock checks) */
    function selectChannel(el, channelName, isGroup = false) {
        // Simple visual toggle for now, keeps current main branch view context
        document.querySelectorAll('.channel-item').forEach(item => item.classList.remove('active'));
        el.classList.add('active');
        document.getElementById('currentChannelName').innerText = channelName;
    }

    /* DIRECT MESSAGE & ATTACHMENTS (Standard) */
    function openDM(userName) {
        document.querySelectorAll('.channel-item').forEach(item => item.classList.remove('active'));
        document.getElementById('channelIconWrapper').innerHTML = '<i class="fa-solid fa-at" style="color:var(--text-muted); font-size:1.2rem;"></i>';
        document.getElementById('currentChannelName').innerText = userName;
        const feed = document.getElementById('mainChatFeed');
        document.getElementById('chatInputArea').style.display = 'block';
        feed.innerHTML = `
            <div style="text-align:center; padding:40px; color:var(--text-muted);">
                <div class="user-avatar" style="background:var(--primary); width:60px; height:60px; font-size:1.5rem; margin:0 auto 15px auto; border-radius:50%;">${userName.charAt(0)}</div>
                <h3 style="color:var(--text-main);">${userName}</h3>
                <p>This is the beginning of your direct message history.</p>
            </div>
        `;
    }

    function viewAttachment(url) {
        const win = window.open("", "_blank");
        // FIXED: Escaped forward slashes in closing tags to prevent script termination
        win.document.write(`<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#f3f4f6;font-family:sans-serif;color:#333;"><h1>${url}</h1><\/body><\/html>`);
    }

    /* CHAT MESSAGING */
    function handleMainEnter(e) { if(e.key === 'Enter') sendMainMessage(); }
    function sendMainMessage() {
        const input = document.getElementById('mainChatInput');
        const text = input.value.trim();
        if(!text) return;
        const feed = document.getElementById('mainChatFeed');
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        feed.insertAdjacentHTML('beforeend', `
            <div class="message-group">
                <div class="user-avatar" style="background:#8b5cf6;">JD</div>
                <div class="msg-content">
                    <div class="msg-header"><span class="username">John Doe</span> <span class="timestamp">${time}</span></div>
                    <div class="msg-text">${text}</div>
                </div>
            </div>
        `);
        input.value = '';
        feed.scrollTop = feed.scrollHeight;
    }

    /* CREATE GROUP LOGIC */
    let selectedIcon = '🚀';
    function openCreateModal() { document.getElementById('createGroupModal').style.display = 'flex'; }
    function closeCreateModal() { document.getElementById('createGroupModal').style.display = 'none'; }
    function selectIcon(el, icon) {
        document.querySelectorAll('.icon-option').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        selectedIcon = icon;
    }
    function createGroup() {
        const name = document.getElementById('groupName').value;
        if(!name) { alert('Please enter a group name'); return; }
        const list = document.getElementById('groupList');
        const item = document.createElement('div');
        item.className = 'channel-item';
        item.setAttribute('onclick', `selectChannel(this, '${name}', true)`);
        item.innerHTML = `<i class="fa-solid fa-lock channel-hash" style="font-size:0.8rem;"></i> <span class="channel-text">${name}</span>`;
        list.appendChild(item);
        closeCreateModal();
        document.getElementById('groupName').value = '';
    }

    /* --- CHATBOT LOGIC --- */
    const widget = document.getElementById('ai-widget');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    let firstOpen = true;

    function toggleChat() {
        widget.classList.toggle('expanded');
        if(widget.classList.contains('expanded') && firstOpen) {
            firstOpen = false;
            // Add greeting automatically with typing effect
            setTimeout(() => {
                const typingId = showTyping();
                setTimeout(() => {
                    removeTyping(typingId);
                    addMessage("ai", "Hi John, how can I help you today?");
                }, 1000);
            }, 500);
        }
    }

    function handleEnter(e) {
        if(e.key === 'Enter') sendMessage();
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if(!text) return;
        
        // 1. Add User Message
        addMessage("user", text);
        chatInput.value = '';

        // 2. Show Typing Indicator
        const typingId = showTyping();

        // 3. API Call
        const apiKey = ""; // System provides this at runtime
        const currentBranch = document.getElementById('currentBranchName').innerText;
        const currentChannel = document.getElementById('currentChannelName').innerText;
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text }] }],
                    // Add context about where the user is in the app
                    systemInstruction: { 
                        parts: [{ 
                            text: `You are NexGen Bot, a helpful academic assistant for students. The user is currently in the '${currentBranch}' branch viewing the '${currentChannel}' channel. Keep responses concise, helpful, and relevant to university life.` 
                        }] 
                    }
                })
            });
            
            if (!response.ok) throw new Error('API Error');
            
            const data = await response.json();
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond to that.";
            
            removeTyping(typingId);
            addMessage("ai", aiResponse);
            
        } catch (e) {
            removeTyping(typingId);
            addMessage("ai", "Sorry, I'm having trouble connecting to the network right now.");
            console.error(e);
        }
    }

    function addMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `msg msg-${sender}`;
        div.textContent = text;
        chatBox.appendChild(div);
        scrollToBottom();
    }

    function showTyping() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.className = 'typing-indicator';
        div.id = id;
        div.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
        chatBox.appendChild(div);
        scrollToBottom();
        return id;
    }

    function removeTyping(id) {
        const el = document.getElementById(id);
        if(el) el.remove();
    }

    function scrollToBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }

