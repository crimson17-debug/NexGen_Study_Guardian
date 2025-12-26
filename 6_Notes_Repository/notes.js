
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
    /* SIDEBAR TOGGLE (MOBILE) */
    function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
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

    /* SEARCH LOGIC */
    function filterNotes() {
        const input = document.getElementById('repoSearch').value.toLowerCase();
        const cards = document.querySelectorAll('.note-card');

        cards.forEach(card => {
            const title = card.getAttribute('data-title').toLowerCase();
            const code = card.getAttribute('data-code').toLowerCase();
            const author = card.getAttribute('data-author').toLowerCase();
            if(title.includes(input) || code.includes(input) || author.includes(input)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /* MODAL LOGIC */
    function openUploadModal() {
        document.getElementById('uploadModal').style.display = 'flex';
    }
    function closeUploadModal() {
        document.getElementById('uploadModal').style.display = 'none';
        // Reset fields
        document.getElementById('noteTitle').value = '';
        document.getElementById('courseName').value = '';
        document.getElementById('courseCode').value = '';
        document.getElementById('noteDesc').value = '';
        document.getElementById('fileInput').value = '';
        document.getElementById('fileName').style.display = 'none';
    }

    function handleFileSelect(input) {
        if (input.files && input.files[0]) {
            const display = document.getElementById('fileName');
            display.innerText = input.files[0].name;
            display.style.display = 'block';
        }
    }

    function saveNote() {
        const title = document.getElementById('noteTitle').value;
        const code = document.getElementById('courseCode').value;
        const desc = document.getElementById('noteDesc').value;
        const file = document.getElementById('fileInput').files[0];

        if(!title || !code || !file) {
            alert("Please fill in required fields and select a file.");
            return;
        }

        const grid = document.getElementById('notesGrid');
        const newCard = document.createElement('div');
        newCard.className = 'note-card';
        newCard.setAttribute('data-title', title);
        newCard.setAttribute('data-code', code);
        newCard.setAttribute('data-author', 'You'); // Defaulting to user

        // Determine icon based on file type (simple check)
        let iconClass = 'icon-doc';
        let iconHtml = '<i class="fa-solid fa-file"></i>';
        if(file.name.endsWith('.pdf')) { iconClass = 'icon-pdf'; iconHtml = '<i class="fa-solid fa-file-pdf"></i>'; }
        else if(file.name.match(/\.(jpg|jpeg|png|gif)$/)) { iconClass = 'icon-img'; iconHtml = '<i class="fa-solid fa-file-image"></i>'; }

        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        newCard.innerHTML = `
            <div class="note-icon-box ${iconClass}">${iconHtml}</div>
            <div class="note-info">
                <span class="note-course">${code}</span>
                <h3>${title}</h3>
                <p class="note-desc">${desc || 'No description provided.'}</p>
            </div>
            <div class="note-footer">
                <div class="author-info">
                    <div class="author-avatar" style="background:var(--primary); color:white;">ME</div>
                    <span>You</span>
                </div>
                <span>${date}</span>
            </div>
            <button class="download-btn" onclick="downloadNote(this)"><i class="fa-solid fa-download"></i> Download</button>
        `;

        grid.prepend(newCard);
        closeUploadModal();
    }

    /* DOWNLOAD LOGIC (UPDATED) */
    function downloadNote(btn) {
        // Get note details
        const card = btn.closest('.note-card');
        const title = card.getAttribute('data-title');
        const code = card.getAttribute('data-code');
        const author = card.getAttribute('data-author');
        
        // Visual Feedback
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Downloading...';
        btn.style.pointerEvents = 'none';

        setTimeout(() => {
            // 1. Create content for the file
            const fileContent = `
            NEXGEN NOTES REPOSITORY
            -----------------------
            Title: ${title}
            Course: ${code}
            Author: ${author}
            Downloaded: ${new Date().toLocaleString()}
            
            [This is a simulated file download for the prototype.]
            `;

            // 2. Create a Blob
            const blob = new Blob([fileContent], { type: 'text/plain' });
            
            // 3. Create a link and trigger click
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${title.replace(/\s+/g, '_')}_Note.txt`; // Safe filename
            document.body.appendChild(a);
            a.click();
            
            // 4. Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // 5. Success State
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
            btn.style.backgroundColor = 'var(--success)';
            btn.style.color = 'white';
            btn.style.borderColor = 'var(--success)';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = ''; 
                btn.style.color = '';
                btn.style.borderColor = '';
                btn.style.pointerEvents = 'auto';
            }, 2000);
        }, 1500);
    }

    /* --- AI CHATBOT LOGIC (INTEGRATED) --- */
    const widget = document.getElementById('ai-widget');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    let firstOpen = true;

    function toggleChat() {
        widget.classList.toggle('expanded');
        if(widget.classList.contains('expanded') && firstOpen) {
            firstOpen = false;
            // Welcome message
            setTimeout(() => {
                addMessage("ai", "Hello! I'm NexGen Bot. I can help you find notes, summarize concepts, or organize your study plan. What can I do for you?");
            }, 500);
        }
    }

    function handleEnter(e) { if(e.key === 'Enter') sendMessage(); }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if(!text) return;
        
        // 1. Show user message
        addMessage("user", text);
        chatInput.value = '';
        
        // 2. Show typing indicator
        const typingId = showTyping();

        // 3. Call Gemini API
        try {
            const apiKey = "AIzaSyCSk74KwiGihf0B7DkotyhcR5qCGtmKz-w"; // Set at runtime
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: text }]
                    }],
                    systemInstruction: {
                        parts: [{ text: "You are NexGen Bot, a helpful AI study assistant for a college notes repository platform called NexGen. You help students find notes, explain concepts, and organize their study schedule. Keep responses concise, friendly, and helpful. You can use **bold** for emphasis." }]
                    }
                })
            });

            const data = await response.json();
            
            // 4. Handle Response
            removeTyping(typingId);
            
            if (data.candidates && data.candidates[0].content) {
                 const aiText = data.candidates[0].content.parts[0].text;
                 addMessage("ai", aiText);
            } else {
                 addMessage("ai", "I'm sorry, I'm having trouble processing that right now.");
                 console.error("API Error:", data);
            }

        } catch (error) {
            removeTyping(typingId);
            addMessage("ai", "Sorry, I lost connection to the server. Please try again.");
            console.error("Fetch Error:", error);
        }
    }

    function addMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `msg msg-${sender}`;
        
        // Simple Markdown parsing for bolding and newlines to keep it looking good without a library
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
            .replace(/\n/g, '<br>');               // Line breaks
            
        div.innerHTML = formattedText;
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

    function removeTyping(id) {
        const el = document.getElementById(id);
        if(el) el.remove();
    }
