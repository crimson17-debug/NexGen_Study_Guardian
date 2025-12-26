

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
    // --- GOOGLE GEMINI API SETUP ---
    const apiKey = "AIzaSyCSk74KwiGihf0B7DkotyhcR5qCGtmKz-w"; // The environment will provide this automatically in the preview.

    async function callGeminiAPI(prompt, systemInstruction = "") {
        // 1. Check if API Key is loaded
        const key = typeof apiKey !== 'undefined' ? apiKey : "";
        if (!key && !window.apiKey) {
            // Fallback for demo
            console.warn("API Key missing");
        }

        // 2. Use the CORRECT model (Gemini 1.5 Flash)
        const modelName = "gemini-2.5-flash"; 
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
            
            // 3. Catch API Errors and ALERT them
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error ? errorData.error.message : "Unknown Error";
                alert(`GOOGLE API ERROR:\n${errorMessage}`); 
                console.error("Full Error Details:", errorData);
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;

        } catch (error) {
            console.error("Gemini API Error:", error);
            return null;
        }
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

    /* NAV HIGHLIGHT */
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active')); this.classList.add('active');
        });
    });

    /* MOBILE SIDEBAR TOGGLE */
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

    /* PDF & PRINT */
    function printPaper() {
        const content = document.getElementById('paperContent').innerText;
        if(content.includes("Enter details")) { alert("Please generate a paper first!"); return; }
        window.print();
    }

    function downloadPDF() {
        const element = document.getElementById('paperContent');
        if(element.innerText.includes("Enter details")) { alert("Please generate a paper first!"); return; }
        
        var opt = {
          margin:       0,
          filename:     'exam_paper.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    }

    /* GENERATION LOGIC (Now using Gemini API) */
    async function generatePaper() {
        const topic = document.getElementById('topicInput').value;
        const difficulty = document.getElementById('difficultySelect').value;
        const type = document.getElementById('typeSelect').value;
        const marks = document.getElementById('marksValue').innerText;
        const overlay = document.getElementById('loadingOverlay');
        const paper = document.getElementById('paperContent');
        const btn = document.getElementById('generateBtn');

        if(!topic) { alert("Please enter a topic!"); return; }

        // UI State: Loading
        overlay.style.display = 'flex';
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

        // Constructing the Prompt for Gemini
        const date = new Date().toLocaleDateString();
        const systemPrompt = "You are an expert academic assistant. Your task is to generate valid HTML code for an exam paper.";
        
        const userPrompt = `
            Create a professional exam paper for the topic: "${topic}".
            Difficulty Level: ${difficulty}.
            Question Types: ${type}.
            Total Marks: ${marks}.

            Strictly follow this HTML structure. Do NOT return markdown code blocks (like \`\`\`html), just the raw HTML content compatible with the following CSS classes:
            - 'section-header' for Part titles (e.g., Part A).
            - 'question-row' for each question container.
            - 'q-num' for question number (e.g., 1.).
            - 'q-text' for the question text.
            - 'q-marks' for marks (e.g., [2]).
            - 'mcq-options' for Multiple Choice Options, containing <span> elements for (a), (b), etc.
            
            Example format:
            <div class="section-header">Part A: Multiple Choice Questions</div>
            <div class="question-row">
                <div class="q-num">1.</div>
                <div class="q-text">Question here?
                    <div class="mcq-options">
                        <span>(a) Option 1</span>
                        <span>(b) Option 2</span>
                    </div>
                </div>
                <div class="q-marks">[2]</div>
            </div>

            Generate enough questions to sum up to exactly ${marks} marks.
            If type is 'mixed', include Part A (MCQ) and Part B (Theory).
            If type is 'mcq', only generate MCQs.
            If type is 'theory', only generate descriptive questions.
            Ensure the content is academic and relevant to ${topic}.
        `;

        const generatedContent = await callGeminiAPI(userPrompt, systemPrompt);

        // Header Boilerplate
        const headerHtml = `
            <div class="exam-header">
                <div class="university-name">Technical Institute of Technology</div>
                <div class="exam-title">Mid-Semester Examination: ${topic}</div>
            </div>

            <table class="meta-table">
                <tr>
                    <td>Date: ${date}</td>
                    <td class="meta-right">Max Marks: ${marks}</td>
                </tr>
                <tr>
                    <td>Duration: 90 Minutes</td>
                    <td class="meta-right">Level: ${difficulty}</td>
                </tr>
            </table>

            <div style="font-size: 10pt; font-style: italic; border-bottom: 1px solid #000; margin-bottom: 20px; padding-bottom: 5px;">
                <strong>Instructions:</strong> All questions are compulsory. Figures to the right indicate full marks.
            </div>
        `;

        const footerHtml = `<div style="text-align:center; margin-top:40px; font-weight:bold;">*** END OF PAPER ***</div>`;

        if (generatedContent) {
            // Clean up if Gemini wrapped it in markdown code blocks despite instructions
            let cleanContent = generatedContent.replace(/```html/g, '').replace(/```/g, '');
            paper.innerHTML = headerHtml + cleanContent + footerHtml;
        } else {
            alert("Failed to generate paper. Please try again.");
        }

        // Reset UI
        overlay.style.display = 'none';
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Generate Paper';
    }

    /* --- CHATBOT LOGIC (Now using Gemini API) --- */
    const widget = document.getElementById('ai-widget');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chatSendBtn');
    let firstOpen = true;

    function toggleChat() {
        widget.classList.toggle('expanded');
        if(widget.classList.contains('expanded') && firstOpen) {
            firstOpen = false;
            setTimeout(() => {
                addMessage("ai", "Hi there! I'm powered by Google Gemini. I can help you structure your exam paper or explain concepts. What topic are you working on?");
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
        chatInput.disabled = true;
        sendBtn.disabled = true;

        // 2. Show Typing Indicator
        const typingId = showTyping();

        // 3. Call Gemini API
        const systemPrompt = "You are a helpful teaching assistant helping a user create exam papers. Keep answers concise and helpful.";
        const responseText = await callGeminiAPI(text, systemPrompt);

        // 4. Remove Typing & Add AI Message
        removeTyping(typingId);
        
        if (responseText) {
            addMessage("ai", responseText);
        } else {
            addMessage("ai", "Sorry, I'm having trouble connecting to the server right now.");
        }

        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    }

    function addMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `msg msg-${sender}`;
        
        // Simple markdown parsing for bold text (**text**)
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        div.innerHTML = formattedText;
        
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
