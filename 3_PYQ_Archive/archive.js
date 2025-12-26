
    /* --- 1. PYQ DATA & RENDER --- */
    let papers = [
        { id: 1, title: "Data Structures & Algo", branch: "cse", year: "2023", type: "end", fileType: "pdf", author: "Rahul K." },
        { id: 2, title: "Engineering Mechanics", branch: "mech", year: "2022", type: "mid", fileType: "pdf", author: "Amit S." },
        { id: 3, title: "Digital Electronics", branch: "ece", year: "2023", type: "end", fileType: "img", author: "Sarah J." },
        { id: 4, title: "Thermodynamics", branch: "mech", year: "2024", type: "quiz", fileType: "pdf", author: "Priya V." },
        { id: 5, title: "Linear Algebra (Maths II)", branch: "all", year: "2022", type: "end", fileType: "pdf", author: "Admin" },
        { id: 6, title: "Operating Systems", branch: "cse", year: "2023", type: "mid", fileType: "pdf", author: "Rahul K." },
        { id: 7, title: "Fluid Mechanics", branch: "mech", year: "2023", type: "end", fileType: "img", author: "Amit S." },
        { id: 8, title: "Network Theory", branch: "ece", year: "2022", type: "end", fileType: "pdf", author: "John D." },
    ];

    const grid = document.getElementById('papersGrid');

    function renderPapers(data) {
        grid.innerHTML = "";
        if(data.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">
                <i class="fa-regular fa-folder-open" style="font-size:3rem; margin-bottom:10px;"></i>
                <p>No papers found matching your filters.</p>
            </div>`;
            return;
        }

        data.forEach(paper => {
            const iconClass = paper.fileType === 'pdf' ? 'icon-pdf' : 'icon-img';
            const iconHtml = paper.fileType === 'pdf' ? '<i class="fa-solid fa-file-pdf"></i>' : '<i class="fa-solid fa-file-image"></i>';
            const typeLabel = paper.type === 'end' ? 'End Sem' : paper.type === 'mid' ? 'Mid Sem' : 'Quiz';
            
            const card = `
            <div class="paper-card">
                <div class="paper-header">
                    <div class="file-icon ${iconClass}">${iconHtml}</div>
                    <span class="paper-year">${paper.year}</span>
                </div>
                <div class="paper-title">${paper.title}</div>
                <div class="paper-meta">
                    <span class="tag">${paper.branch.toUpperCase()}</span>
                    <span class="tag exam">${typeLabel}</span>
                </div>
                <div class="paper-actions">
                    <div class="author">
                        <div class="author-img"></div>
                        <span>${paper.author}</span>
                    </div>
                    <button class="download-btn" title="Download" onclick="downloadFile('${paper.title}')">
                        <i class="fa-solid fa-download"></i>
                    </button>
                </div>
            </div>`;
            grid.innerHTML += card;
        });
    }

    renderPapers(papers);

    /* --- 2. FILTER LOGIC --- */
    const searchInput = document.getElementById('searchInput');
    const branchFilter = document.getElementById('branchFilter');
    const yearFilter = document.getElementById('yearFilter');
    const examFilter = document.getElementById('examFilter');

    function filterData() {
        const query = searchInput.value.toLowerCase();
        const branch = branchFilter.value;
        const year = yearFilter.value;
        const exam = examFilter.value;

        const filtered = papers.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(query);
            const matchesBranch = branch === 'all' || p.branch === branch || p.branch === 'all';
            const matchesYear = year === 'all' || p.year === year;
            const matchesExam = exam === 'all' || p.type === exam;
            return matchesSearch && matchesBranch && matchesYear && matchesExam;
        });

        renderPapers(filtered);
    }

    [searchInput, branchFilter, yearFilter, examFilter].forEach(el => {
        el.addEventListener('input', filterData);
    });

    /* --- 3. UPLOAD & DRAG DROP LOGIC --- */
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

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
        dropZone.addEventListener(e, (ev) => { ev.preventDefault(); ev.stopPropagation(); }, false);
    });
    ['dragenter', 'dragover'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.add('drag-over'), false));
    ['dragleave', 'drop'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.remove('drag-over'), false));
    
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if(files && files[0]) {
            validateAndSetFile(files[0]);
            fileInput.files = files; 
        }
    }, false);

    function validateAndSetFile(file) {
        if(file.size > 5 * 1024 * 1024) { showToast("File is too large (Max 5MB)"); return; }
        selectedFile = file;
        dropContent.innerHTML = `
            <i class="fa-solid fa-file-circle-check" style="font-size:2rem; margin-bottom:10px; color:#10b981;"></i>
            <p style="font-weight:600; color:var(--text-main);">${file.name}</p>
            <p style="font-size:0.8rem; margin-top:5px; color:var(--text-muted);">${(file.size/1024/1024).toFixed(2)} MB</p>
        `;
    }

    function submitUpload() {
        const subject = document.getElementById('uploadSubject').value;
        const year = document.getElementById('uploadYear').value;
        const type = document.getElementById('uploadType').value;
        if(!subject || !selectedFile) { showToast("Please fill details and select a file."); return; }

        closeModal();
        showToast("Uploading paper...");

        setTimeout(() => {
            const newPaper = {
                id: Date.now(), title: subject, branch: "all", year: year, type: type, fileType: "pdf", author: "You"
            };
            papers.unshift(newPaper);
            renderPapers(papers);
            showToast("Upload Successful! (+10 Karma)");
        }, 1500);
    }

    function resetUploadForm() {
        document.getElementById('uploadSubject').value = "";
        selectedFile = null;
        dropContent.innerHTML = `<i class="fa-solid fa-cloud-arrow-up" style="font-size:2rem; margin-bottom:10px; color:var(--primary);"></i><p style="font-weight:500; color:var(--text-main);">Click to browse or drag file here</p><p style="font-size:0.8rem; margin-top:5px; color:var(--text-muted);">Supports PDF, JPG, PNG</p>`;
    }

    /* --- 4. COMMON UTILS (Toast, Download, Theme) --- */
    function downloadFile(name) { showToast(`Downloading: ${name}.pdf`); }

    function showToast(msg) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#10b981;"></i> ${msg}`;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
    }

    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = toggleBtn.querySelector('i');

    if(localStorage.getItem('theme') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    }

    toggleBtn.addEventListener('click', () => {
        if(body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });

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

    /* --- 5. REAL GEMINI API CHATBOT LOGIC --- */
    const apiKey = ""; // Set by environment
    const widget = document.getElementById('ai-widget');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chatSendBtn');
    let firstOpen = true;

    async function callGeminiAPI(prompt, systemInstruction = "") {
        const key = typeof apiKey !== 'undefined' ? apiKey : "";
        if (!key && !window.apiKey) { console.warn("API Key missing"); return "I am missing my API key."; }
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${key}`;
        
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Gemini API Error:", error);
            return "Sorry, I encountered a connection error.";
        }
    }

    function toggleChat() {
        widget.classList.toggle('expanded');
        if(widget.classList.contains('expanded') && firstOpen) {
            firstOpen = false;
            setTimeout(() => addMessage("ai", "Hi John! I'm your Exam Archive Assistant. Ask me about available papers or for help with specific subjects."), 500);
        }
    }
    
    function handleEnter(e) { if(e.key === 'Enter') sendMessage(); }
    
    async function sendMessage() {
        const text = chatInput.value.trim();
        if(!text) return;
        
        // UI Updates
        addMessage("user", text);
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;
        const typingId = showTyping();

        // Prepare Context: Feed the list of papers to the AI
        const paperList = papers.map(p => `${p.title} (${p.branch}, ${p.year})`).join(", ");
        const systemPrompt = `You are a helpful academic librarian for NexGen. 
        Your goal is to help students find previous year questions (PYQs) or explain concepts related to them.
        
        Here is the current list of available papers in the archive: 
        [${paperList}].
        
        If a user asks for a paper that is in this list, confirm you found it. 
        If they ask for something else, politely say it's not in the archive yet but you can explain the topic.
        Keep answers concise, friendly, and academic.`;

        // API Call
        const responseText = await callGeminiAPI(text, systemPrompt);

        // Handle Response
        removeTyping(typingId);
        addMessage("ai", responseText);
        
        // Reset UI
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    }

    function addMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `msg msg-${sender}`;
        
        // Basic Markdown formatting
        const formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
            
        div.innerHTML = formatted;
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
