import { CodeJar } from 'https://cdn.jsdelivr.net/npm/codejar@3.7.0/codejar.js';

// --- Global Variables ---
window.jar = null;
let currentLang = 'python';

// --- API Configuration ---
const apiKey = ""; 

// --- Helper: Call Gemini API ---
async function callGemini(prompt, systemInstruction = "") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
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

        if (!response.ok) throw new Error("API Error");

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
        console.error(error);
        return "Error: Could not connect to AI service.";
    }
}
// Expose callGemini to window if needed by inline HTML (optional, mostly for debug)
window.callGemini = callGemini; 

// --- Editor Setup ---
const highlight = editor => {
    // Ensure Prism is loaded
    if (typeof Prism !== 'undefined') {
        editor.innerHTML = Prism.highlight(
            editor.textContent, 
            Prism.languages[currentLang] || Prism.languages.javascript, 
            currentLang
        );
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const editorElement = document.querySelector('#code-editor');
    if (editorElement) {
        window.jar = CodeJar(editorElement, highlight);

        // Track Cursor
        editorElement.addEventListener('click', updateCursor);
        editorElement.addEventListener('keyup', updateCursor);

        // Default Code
        window.jar.updateCode(`# Python 3 Test
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

print("Calculating factorial of 5...")
result = factorial(5)
print(f"Result: {result}")`);
        
        // Initial Syntax Highlight
        highlight(editorElement);
    }
    
    // Theme Init
    initTheme();
});

function updateCursor() {
    const selection = window.getSelection();
    if(!selection.rangeCount) return;
    const text = window.jar.toString();
    const lines = text.split('\n').length;
    const chars = text.length;
    const cursorDisplay = document.getElementById('cursor-pos');
    if (cursorDisplay) cursorDisplay.innerText = `Ln ${lines}, Ch ${chars}`;
}


// --- EXPORTED FUNCTIONS (Attached to Window for HTML access) ---

// 1. Run Code
window.runCode = async function() {
    if (!window.jar) return;
    const code = window.jar.toString();
    const lang = document.getElementById('langSelect').value;
    const outputDiv = document.getElementById('consoleOutput');
    const runBtn = document.querySelector('.run-btn');
    const codeWrapper = document.getElementById('codeWrapper');
    
    // UI State: Running
    const originalBtnText = runBtn.innerHTML;
    runBtn.innerHTML = '<i class="fa-solid fa-gear fa-spin"></i> Executing...';
    codeWrapper.classList.add('running');
    outputDiv.innerHTML += `<br><span class="log-sys">> Running ${lang} environment...</span>`;
    outputDiv.scrollTop = outputDiv.scrollHeight;

    let output = "";

    try {
        if (lang === 'javascript') {
            // --- Real Local Execution for JS ---
            const logs = [];
            const originalLog = console.log;
            console.log = (...args) => {
                logs.push(args.join(' '));
                originalLog.apply(console, args);
            };

            try {
                const result = eval(code);
                if (logs.length > 0) output = logs.join('\n');
                else if (result !== undefined) output = String(result);
                else output = "Done (No output)";
            } catch (e) {
                output = `<span class="log-error">${e.toString()}</span>`;
            } finally {
                console.log = originalLog; // Restore
            }
        } else {
            // --- AI Simulated Execution ---
            const prompt = `Act as a ${lang} compiler/interpreter. Execute the following code and return ONLY the textual output (stdout) or error message (stderr). Do not provide explanations. Just the raw output.\n\nCode:\n${code}`;
            
            output = await callGemini(prompt, "You are a code execution engine. Return only the output of the code.");
            
            if (output.toLowerCase().includes("error") || output.toLowerCase().includes("exception")) {
                output = `<span class="log-error">${output.replace(/\n/g, '<br>')}</span>`;
            } else {
                output = output.replace(/\n/g, '<br>');
            }
        }
    } catch (err) {
        output = `<span class="log-error">System Error: ${err.message}</span>`;
    }

    // Display Result
    setTimeout(() => {
        outputDiv.innerHTML += `<br><span class="log-info">${output}</span>`;
        outputDiv.scrollTop = outputDiv.scrollHeight;
        runBtn.innerHTML = originalBtnText;
        codeWrapper.classList.remove('running');
    }, 500);
};

// 2. Chat Logic
window.sendMessage = async function() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if(!text) return;
    
    addMessage("user", text);
    input.value = '';
    
    const typingId = showTyping();
    
    const currentCode = window.jar ? window.jar.toString() : "";
    const lang = document.getElementById('langSelect').value;
    const prompt = `User Query: ${text}\n\nCurrent Code Context (${lang}):\n${currentCode}`;
    const systemPrompt = "You are NexGen Bot, an expert coding assistant. Help the user debug, write, or understand code. Be concise.";

    const response = await callGemini(prompt, systemPrompt);
    
    removeTyping(typingId);
    addMessage("ai", response);
};

// 3. AI Fix Logic
window.askAIToFix = async function() {
    if (!window.jar) return;
    const code = window.jar.toString();
    const lang = document.getElementById('langSelect').value;
    
    window.showToast("Analyzing code for bugs...", "info");
    
    const widget = document.getElementById('ai-widget');
    if(!widget.classList.contains('expanded')) window.toggleChat();
    
    addMessage("user", "Can you fix the bugs in my current code?");
    const typingId = showTyping();

    const prompt = `Analyze this ${lang} code for bugs or errors. Return the fixed code and a brief explanation.\n\nCode:\n${code}`;
    const response = await callGemini(prompt);
    
    removeTyping(typingId);
    addMessage("ai", response);
};

// 4. Retry Logic (Exported as requested)
window.generateWithRetry = async function(model, prompt) {
    let attempts = 0;
    while (attempts < 5) {
        try {
             // Mocking the model call since we use callGemini wrapper usually, 
             // but keeping this structure as requested.
            const result = await callGemini(prompt); 
            return result;
        } catch (error) {
            if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
                console.warn(`Quota hit. Waiting 10s...`);
                await new Promise(resolve => setTimeout(resolve, 10000)); 
                attempts++;
            } else {
                throw error;
            }
        }
    }
    throw new Error("Failed after 5 retries.");
};

// 5. Theme Toggle
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    const body = document.body;
    const icon = toggleBtn.querySelector('i');
    
    if(localStorage.getItem('theme') === 'light') { 
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
}

// 6. UI Toggles
window.toggleMainSidebar = function() {
    const sidebar = document.getElementById('mainSidebar');
    if (sidebar) sidebar.classList.toggle('open');
};

window.changeLanguage = function() {
    const lang = document.getElementById('langSelect').value;
    const editorDiv = document.getElementById('code-editor');
    
    const classes = editorDiv.className.split(" ").filter(c => !c.startsWith("language-"));
    editorDiv.className = classes.join(" ");
    
    let prismLang = lang;
    if(lang === 'cpp') prismLang = 'cpp'; 
    currentLang = lang; // Update global state
    
    editorDiv.classList.add(`language-${prismLang}`);
    
    if(lang === 'python') {
        window.jar.updateCode(`# Python 3\ndef main():\n    print("Hello from Python")\n    # The AI will simulate this output!\n    print(20 * 5)\n\nmain()`);
    } else if(lang === 'javascript') {
        window.jar.updateCode(`// JavaScript\nconsole.log("Hello from Browser JS");\n\nconst calculate = (a, b) => {\n  return a + b;\n};\n\nconsole.log("Result:", calculate(10, 50));`);
    } else if(lang === 'cpp') {
        window.jar.updateCode(`// C++ 20\n#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++ (AI Simulated)" << std::endl;\n    int x = 10;\n    if (x > 5) {\n        std::cout << "Logic works!" << std::endl;\n    }\n    return 0;\n}`);
    } else if(lang === 'java') {
        window.jar.updateCode(`// Java 17\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java (AI Simulated)");\n        for(int i=0; i<3; i++) {\n            System.out.println("Count: " + i);\n        }\n    }\n}`);
    }
};

window.saveCode = function() {
    const btn = document.querySelector('.toolbar-btn.primary');
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...';
    setTimeout(() => {
        btn.innerHTML = originalHtml;
        window.showToast('File saved successfully', 'success');
    }, 800);
};

window.showToast = function(msg, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' || type === 'info' ? '<i class="fa-solid fa-check-circle"></i>' : '<i class="fa-solid fa-triangle-exclamation" style="color:#f85149;"></i>';
    toast.innerHTML = `${icon} <span>${msg}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.classList.add('show'); });
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

window.clearConsole = function() {
    document.getElementById('consoleOutput').innerHTML = '<div class="log-sys">nexgen-terminal:~$ cleared</div>';
};

let firstOpen = true;
window.toggleChat = function() {
    const widget = document.getElementById('ai-widget');
    widget.classList.toggle('expanded');
    if(widget.classList.contains('expanded') && firstOpen) {
        firstOpen = false;
        setTimeout(() => {
            const chatBox = document.getElementById('chat-box');
            const div = document.createElement('div');
            div.className = 'msg msg-ai';
            div.textContent = "Hello! I am your coding assistant. I can explain code, fix bugs, or help you write new algorithms. How can I help?";
            chatBox.appendChild(div);
        }, 300);
    }
};

window.handleEnter = function(e) { if(e.key === 'Enter') window.sendMessage(); };

// Team Chat Functions
window.toggleTeamChat = function() {
    document.getElementById('teamChatPanel').classList.toggle('collapsed');
};
window.handleTeamChatEnter = function(e) {
    if(e.key === 'Enter') window.sendTeamMessage();
};
window.sendTeamMessage = function() {
    const input = document.getElementById('tcInput');
    const text = input.value.trim();
    if(!text) return;
    const chatBody = document.getElementById('tcBody');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'tc-msg tc-msg-local';
    msgDiv.innerHTML = `<span style="font-size:0.7em; font-weight:700; display:block; margin-bottom:4px; opacity:0.8;">You</span>${text}`;
    chatBody.appendChild(msgDiv);
    input.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;
};

// Chat Helpers
function addMessage(sender, text) {
    const chatBox = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.className = `msg msg-${sender}`;
    if (text.includes("```")) {
        const parts = text.split("```");
        div.innerHTML = "";
        parts.forEach((part, index) => {
            if (index % 2 === 1) {
                const codeBlock = document.createElement("div");
                codeBlock.style.background = "rgba(0,0,0,0.3)";
                codeBlock.style.padding = "8px";
                codeBlock.style.borderRadius = "4px";
                codeBlock.style.fontFamily = "monospace";
                codeBlock.textContent = part.replace(/^[a-z]+\n/, ""); 
                div.appendChild(codeBlock);
            } else {
                const span = document.createElement("span");
                span.textContent = part;
                div.appendChild(span);
            }
        });
    } else {
        div.textContent = text;
    }
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
    const chatBox = document.getElementById('chat-box');
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'msg msg-ai'; // reuse style
    div.id = id;
    div.innerHTML = `<i class="fa-solid fa-ellipsis fa-fade"></i>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function removeTyping(id) {
    const el = document.getElementById(id);
    if(el) el.remove();
}