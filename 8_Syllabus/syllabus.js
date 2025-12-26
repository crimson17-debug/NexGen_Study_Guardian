
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
    function toggleMainSidebar() { document.getElementById('mainSidebar').classList.toggle('open'); }

    /* SEARCH FUNCTIONALITY */
    function filterCourses() {
        const input = document.getElementById('syllabusSearch').value.toLowerCase();
        const cards = document.querySelectorAll('.course-card');

        cards.forEach(card => {
            const title = card.getAttribute('data-title').toLowerCase();
            const code = card.getAttribute('data-code').toLowerCase();
            if(title.includes(input) || code.includes(input)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /* CARD EXPANSION */
    function toggleCard(header) {
        const body = header.nextElementSibling;
        const icon = header.querySelector('.toggle-btn');
        body.classList.toggle('open');
        icon.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    /* CHECKBOX & PROGRESS LOGIC */
    function toggleCheck(item) {
        const checkbox = item.querySelector('.custom-checkbox');
        const text = item.querySelector('span');
        
        checkbox.classList.toggle('checked');
        text.classList.toggle('strikethrough');
        
        updateProgress(item.closest('.course-card'));
    }

    function updateProgress(card) {
        const total = card.querySelectorAll('.topic-item').length;
        const checked = card.querySelectorAll('.custom-checkbox.checked').length;
        const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
        
        card.querySelector('.progress-fill').style.width = pct + '%';
        card.querySelector('.pct-text').innerText = pct + '%';
    }

    /* --- ADD COURSE MODAL LOGIC (UPDATED WITH DB SEARCH) --- */
    const courseDatabase = [
        { name: 'Operating Systems', code: 'CS401' },
        { name: 'Computer Networks', code: 'CS402' },
        { name: 'Discrete Mathematics', code: 'MA202' },
        { name: 'Digital Logic Design', code: 'EC201' },
        { name: 'Theory of Computation', code: 'CS501' },
        { name: 'Compiler Design', code: 'CS502' },
        { name: 'Artificial Intelligence', code: 'CS601' },
        { name: 'Web Technologies', code: 'IT301' },
        { name: 'Machine Learning', code: 'CS602' },
        { name: 'Cyber Security', code: 'IT402' }
    ];

    function openAddCourseModal() {
        document.getElementById('addCourseModal').style.display = 'flex';
        document.getElementById('courseSearchInput').value = '';
        document.getElementById('searchResults').style.display = 'none';
        document.getElementById('selectedCourseName').value = '';
        document.getElementById('selectedCourseCode').value = '';
    }
    
    function closeAddCourseModal() {
        document.getElementById('addCourseModal').style.display = 'none';
    }

    function searchDatabase() {
        const input = document.getElementById('courseSearchInput').value.toLowerCase();
        const resultsContainer = document.getElementById('searchResults');
        
        // Filter
        const filtered = courseDatabase.filter(c => 
            c.name.toLowerCase().includes(input) || c.code.toLowerCase().includes(input)
        );

        // Render
        resultsContainer.innerHTML = '';
        if(filtered.length > 0) {
            resultsContainer.style.display = 'block';
            filtered.forEach(course => {
                const div = document.createElement('div');
                div.className = 'course-list-item';
                div.onclick = () => selectCourse(course.name, course.code);
                div.innerHTML = `<span>${course.name}</span> <span class="db-code">${course.code}</span>`;
                resultsContainer.appendChild(div);
            });
        } else {
             resultsContainer.style.display = 'none';
        }
    }

    function selectCourse(name, code) {
        document.getElementById('selectedCourseName').value = name;
        document.getElementById('selectedCourseCode').value = code;
        document.getElementById('searchResults').style.display = 'none';
        document.getElementById('courseSearchInput').value = `${name} (${code})`;
    }

    function saveNewCourse() {
        const name = document.getElementById('selectedCourseName').value;
        const code = document.getElementById('selectedCourseCode').value;
        
        if(!name || !code) { 
            alert('Please search and select a valid course from the database.'); 
            return; 
        }

        // PREVENT DUPLICATES CHECK
        const existing = document.querySelectorAll(`.course-card[data-code="${code}"]`);
        if(existing.length > 0) {
            alert("This course is already in your tracker.");
            return;
        }

        const grid = document.getElementById('coursesGrid');
        const newCard = document.createElement('div');
        newCard.className = 'course-card';
        newCard.setAttribute('data-title', name);
        newCard.setAttribute('data-code', code);
        newCard.innerHTML = `
            <div class="card-header" onclick="toggleCard(this)">
                <div class="course-meta">
                    <div class="course-info">
                        <h3>${name}</h3>
                        <span class="course-code">${code}</span>
                    </div>
                    <div class="toggle-btn"><i class="fa-solid fa-chevron-down"></i></div>
                </div>
                <div class="progress-section">
                    <div class="progress-labels">
                        <span>Progress</span>
                        <span class="pct-text">0%</span>
                    </div>
                    <div class="progress-bg"><div class="progress-fill" style="width: 0%"></div></div>
                </div>
            </div>
            <div class="card-body">
                <div class="module-item">
                    <div class="module-header">Unit 1: Introduction (Default)</div>
                    <ul class="topic-list">
                        <li class="topic-item" onclick="toggleCheck(this)">
                            <div class="custom-checkbox"><i class="fa-solid fa-check"></i></div>
                            <span>Topic 1</span>
                        </li>
                        <li class="topic-item" onclick="toggleCheck(this)">
                            <div class="custom-checkbox"><i class="fa-solid fa-check"></i></div>
                            <span>Topic 2</span>
                        </li>
                    </ul>
                </div>
            </div>
        `;
        grid.prepend(newCard); // Add to top
        closeAddCourseModal();
    }

    /* --- CHATBOT LOGIC --- */
    const widget = document.getElementById('ai-widget');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const apiKey = "AIzaSyCSk74KwiGihf0B7DkotyhcR5qCGtmKz-w"; // API Key injected by environment
    let firstOpen = true;

    function toggleChat() {
        widget.classList.toggle('expanded');
        if(widget.classList.contains('expanded') && firstOpen) {
            firstOpen = false;
            setTimeout(() => {
                addMessage("ai", "Hi there! I can help you find missing topics in your syllabus plan or suggest study resources.");
            }, 500);
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
                        parts: [{ text: "You are NexGen Bot, an AI assistant for a college syllabus tracking platform. Help students organize their study plans, understand course topics, and suggest resources for subjects like Data Structures, DBMS, and Mathematics. Keep answers concise and helpful." }]
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

    function removeTyping(id) {
        const el = document.getElementById(id);
        if(el) el.remove();
    }

