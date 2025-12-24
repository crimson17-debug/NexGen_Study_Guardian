# NexGen - Intelligent Academic Ecosystem (MVP) 🎓🚀

**NexGen** is a futuristic, student-centric academic dashboard designed to centralize study resources, track syllabus progress, facilitate peer communication, and provide AI-driven study tools. This repository contains the high-fidelity frontend prototype built with modern HTML5, CSS3,JavaScript, GEMINI API, Nodejs.

> **Status:** Frontend Prototype (High Fidelity)
> **Theme:** Glassmorphism & Neomorphism (Dark/Light Mode Supported)

---

## 🌟 Key Features

### 🏠 Dashboard (`dashboard.html`)
* **Central Hub:** A gamified overview of academic progress.
* **3D Elements:** Features a CSS-only 3D Gyroscope animation representing the "Knowledge Core."
* **Analytics:** Heatmaps for study intensity and streak tracking.
* **Security:** A simulated "Gateway" overlay for secure entry.

### 🧠 AI Paper Generator (`aipapergen.html`)
* **Custom Exams:** Generates mock exam papers based on user inputs (Topic, Difficulty, Question Type).
* **PDF Export:** Integrated `html2pdf.js` to download generated papers instantly.
* **Preview Mode:** Real-time A4 sheet preview of the question paper.

### 🎯 Syllabus Tracker (`syllabus.html` & `syllabus-list.html`)
* **Progress Bars:** Visual tracking of module completion for specific courses.
* **Database Search:** Simulated search for adding new courses (e.g., CS201, MA101).
* **Topic Checklists:** Interactive accordions with checkboxes to mark completed topics.

### 💻 Integrated Code Editor (`editor.html`)
* **Multi-Language Support:** Python, JavaScript, C++, and Java syntax highlighting via `Prism.js`.
* **Lightweight IDE:** Built using `CodeJar` for a smooth typing experience.
* **Terminal Simulation:** A mock console output window for running code.
* **Team Chat:** A collapsible side panel for real-time code collaboration simulation.

### 🤝 Community & Resources
* **Branch Channels (`channels.html`):** Discord-style chat interface with role-based access (locked channels for specific branches like CSE/ECE).
* **Notes Repository (`notes.html`):** A library to upload and download study materials with filtering.
* **PYQ Archive (`archive.html`):** A searchable archive for Past Year Questions.

### 🤖 Global AI Assistant
* A persistent **AI Widget** present on every page.
* Simulates intelligent responses for doubt resolution, code debugging, and navigation help.

---

## 🛠️ Tech Stack

* **Core:** HTML5, CSS3 (CSS Variables, Flexbox, Grid), Vanilla JavaScript (ES6+).
* **Styling:** Custom CSS implementing Glassmorphism (Backdrop-filter), Animations, and Responsive Design.
* **Libraries:**
    * [FontAwesome](https://fontawesome.com/) (Icons)
    * [Prism.js](https://prismjs.com/) (Syntax Highlighting)
    * [CodeJar](https://github.com/antonmedv/codejar) (Micro Code Editor)
    * [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) (PDF Generation)
* **Fonts:** Inter & Fira Code (for the editor).

---

## 📂 Project Structure

```text
NexGen/
├── dashboard.html       # Main landing page with stats and navigation
├── aipapergen.html      # AI Exam paper generator tool
├── syllabus.html        # Syllabus tracking and progress management
├── syllabus-list.html   # List view of available syllabi
├── editor.html          # Browser-based IDE/Code Editor
├── notes.html           # Notes repository and upload interface
├── channels.html        # Chat/Communication interface
├── archive.html         # Past Year Question (PYQ) archive
├── NexGen-logo.jpg      # Project Asset
└── README.md            # Documentation
```
---

## 🚀 How to Run

Since this project is built with static technologies, no build step or backend server is required to view the prototype.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/nexgen-dashboard.git](https://github.com/yourusername/nexgen-dashboard.git)
    ```
2.  **Navigate to the folder:**
    ```bash
    cd nexgen-dashboard
    ```
3.  **Launch:**
    * Simply double-click `dashboard.html` to open it in your web browser.
    * *Recommended:* Use the "Live Server" extension in VS Code for the best experience.

---

## 🎨 UI/UX Highlights

* **Dark/Light Mode:** Toggleable theme that persists across pages using `localStorage`.
* **Responsive Sidebar:** Collapsible sidebar for mobile devices.
* **Interactive Modals:** Custom modals for uploads, permissions, and settings.
* **Toast Notifications:** Non-intrusive popup alerts for user actions (downloads, saves, errors).

---

## 🔮 Future Roadmap

* **Backend Integration:** Connect to Node.js/Express for real-time database management.
* **Real AI Integration:** Connect the chat widget to the Gemini API or OpenAI API.
* **User Auth:** Replace the simulated gateway with Firebase Authentication.
* **Live Collaboration:** Use WebSockets (Socket.io) for the Code Editor and Channel Chat.

---

*Built with ❤️ by the NexGen Team -NAVYA MADE , SUJAL NEGI.*
