
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
    /* --- DATA & RENDER --- */
    let syllabusData = [
        { id: 1, title: "Data Structures", code: "CS201", branch: "cse", sem: "3" },
        { id: 2, title: "Thermodynamics", code: "ME302", branch: "mech", sem: "4" },
        { id: 3, title: "Digital Circuits", code: "EC204", branch: "ece", sem: "3" },
        { id: 4, title: "Operating Systems", code: "CS401", branch: "cse", sem: "4" },
        { id: 5, title: "Fluid Mechanics", code: "ME305", branch: "mech", sem: "3" },
        { id: 6, title: "Mathematics I", code: "MA101", branch: "all", sem: "1" },
        { id: 7, title: "Physics", code: "PH102", branch: "all", sem: "1" },
        { id: 8, title: "Computer Networks", code: "CS502", branch: "cse", sem: "5" }
    ];

    const grid = document.getElementById('syllabusGrid');

    function renderSyllabus(data) {
        grid.innerHTML = "";
        if(data.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">
                <i class="fa-regular fa-folder-open" style="font-size:3rem; margin-bottom:10px;"></i>
                <p>No syllabus found matching filters.</p>
            </div>`;
            return;
        }

        data.forEach(item => {
            const card = `
            <div class="paper-card">
                <div class="paper-header">
                    <div class="file-icon"><i class="fa-solid fa-book"></i></div>
                    <span class="paper-code">${item.code}</span>
                </div>
                <div class="paper-title">${item.title}</div>
                <div class="paper-meta">
                    <span class="tag">${item.branch.toUpperCase()}</span>
                    <span class="tag exam">Sem ${item.sem}</span>
                </div>
                <div class="paper-actions">
                    <span class="update-date">Updated: Jan 2024</span>
                    <button class="download-btn" title="Download" onclick="downloadFile('${item.title}')">
                        <i class="fa-solid fa-download"></i>
                    </button>
                </div>
            </div>`;
            grid.innerHTML += card;
        });
    }
    
    renderSyllabus(syllabusData);

    /* --- FILTERS --- */
    const searchInput = document.getElementById('searchInput');
    const branchFilter = document.getElementById('branchFilter');
    const semFilter = document.getElementById('semFilter');

    function filterData() {
        const query = searchInput.value.toLowerCase();
        const branch = branchFilter.value;
        const sem = semFilter.value;

        const filtered = syllabusData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(query) || item.code.toLowerCase().includes(query);
            const matchesBranch = branch === 'all' || item.branch === branch || item.branch === 'all';
            const matchesSem = sem === 'all' || item.sem === sem;
            return matchesSearch && matchesBranch && matchesSem;
        });
        renderSyllabus(filtered);
    }

    [searchInput, branchFilter, semFilter].forEach(el => el.addEventListener('input', filterData));

    /* --- UPLOAD LOGIC --- */
    const modal = document.getElementById('uploadModal');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const dropContent = document.getElementById('dropZoneContent');
    let selectedFile = null;

    function openModal() { modal.classList.add('open'); }
    function closeModal() { modal.classList.remove('open'); resetUploadForm(); }

    function handleFileSelect(input) {
        if (input.files && input.files[0]) validateAndSetFile(input.files[0]);
    }

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault(); dropZone.classList.remove('drag-over');
        if(e.dataTransfer.files[0]) {
            fileInput.files = e.dataTransfer.files;
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    });

    function validateAndSetFile(file) {
        selectedFile = file;
        dropContent.innerHTML = `<i class="fa-solid fa-check-circle" style="font-size:2rem; margin-bottom:10px; color:#10b981;"></i><p style="font-weight:600;">${file.name}</p>`;
    }

    function submitUpload() {
        const title = document.getElementById('uploadSubject').value;
        const code = document.getElementById('uploadCode').value;
        const branch = document.getElementById('uploadBranch').value;
        const sem = document.getElementById('uploadSem').value;
        
        if(!title || !code || !selectedFile) { showToast("Please fill all details."); return; }
        
        closeModal();
        showToast("Uploading Syllabus...");
        setTimeout(() => {
            syllabusData.unshift({ id: Date.now(), title, code, branch, sem });
            renderSyllabus(syllabusData);
            showToast("Upload Successful!");
        }, 1500);
    }

    function resetUploadForm() {
        document.getElementById('uploadSubject').value = "";
        document.getElementById('uploadCode').value = "";
        selectedFile = null;
        dropContent.innerHTML = `<i class="fa-solid fa-cloud-arrow-up" style="font-size:2rem; margin-bottom:10px; color:var(--secondary);"></i><p style="font-weight:500;">Click to browse</p>`;
    }

    /* --- UTILS --- */
    function downloadFile(name) { showToast(`Downloading: ${name}_Syllabus.pdf`); }
    function showToast(msg) {
        const c = document.getElementById('toast-container');
        const t = document.createElement('div');
        t.className = 'toast show';
        t.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#10b981;"></i> ${msg}`;
        c.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }
    function toggleMainSidebar() { document.getElementById('mainSidebar').classList.toggle('open'); }
    
    /* THEME */
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = toggleBtn.querySelector('i');
    if(localStorage.getItem('theme') === 'dark') { body.setAttribute('data-theme', 'dark'); icon.classList.replace('fa-sun', 'fa-moon'); }
    toggleBtn.addEventListener('click', () => {
        if(body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme'); icon.classList.replace('fa-moon', 'fa-sun'); localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark'); icon.classList.replace('fa-sun', 'fa-moon'); localStorage.setItem('theme', 'dark');
        }
    });

    /* AI CHAT */
    const widget = document.getElementById('ai-widget');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const apiKey = "AIzaSyCSk74KwiGihf0B7DkotyhcR5qCGtmKz-w"; // API Key injected by environment
    let firstOpen = true;

    function toggleChat() {
        widget.classList.toggle('expanded');
        if(widget.classList.contains('expanded') && firstOpen) {
            firstOpen = false;
            setTimeout(() => addMessage("ai", "Looking for a syllabus? I can help."), 500);
        }
    }

    function handleEnter(e) { if(e.key === 'Enter') sendMessage(); }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if(!text) return;

        // UI Updates
        addMessage("user", text);
        chatInput.value = '';
        const typingId = showTyping();

        // API Call
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: text
                        }]
                    }],
                    systemInstruction: {
                        parts: [{ text: "You are NexGen Bot, an AI assistant for a college syllabus platform. Help students find syllabus details, course codes, and academic info. Keep answers concise." }]
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            removeTyping(typingId);

            if (data.candidates && data.candidates[0].content) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                addMessage("ai", aiResponse);
            } else {
                addMessage("ai", "I'm sorry, I couldn't process that request.");
            }
        } catch (error) {
            console.error('Error:', error);
            removeTyping(typingId);
            addMessage("ai", "Sorry, I'm having trouble connecting to the server right now.");
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
