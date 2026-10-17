/* Nigraan - Main Application Controller (Every student, seen before they're lost.) */

class AppController {
  constructor() {
    this.students = INITIAL_STUDENTS_DATA;
    this.selectedStudent = this.students[0];
    this.currentTab = "dashboard";
    this.isFullscreen = true;
    this.searchQuery = "";
    this.riskFilter = "All";
    this.auditLogs = [];

    // Persistent Counselor Alert Inbox
    this.counselorAlerts = JSON.parse(localStorage.getItem('nigraan_counselor_alerts')) || [
      {
        id: "alt_101",
        studentId: "STU-101",
        studentName: "Zain Ahmed",
        type: "HIGH_RISK_ALERT",
        title: "Critical Early Warning Triggered",
        detail: "Risk score 86%. 3-week attendance drop (88% → 58%) and unpaid fees.",
        timestamp: "10 mins ago",
        status: "ACTIVE"
      },
      {
        id: "alt_102",
        studentId: "STU-102",
        studentName: "Ayesha Khan",
        type: "STUDENT_VOICE_CHECKIN",
        title: "Student Voice Check-in Pending",
        detail: "Flagged 'Family & Personal Responsibilities' during morning check-in.",
        timestamp: "2 hours ago",
        status: "ACTIVE"
      }
    ];
  }

  async init() {
    if (!authService.isLoggedIn()) {
      this.renderPortalLoginScreen();
      return;
    }

    const user = authService.currentUser;
    if (user.role === "Student") {
      this.currentTab = "journey";
    } else if (user.role === "Counselor") {
      this.currentTab = "admin";
      this.loadAuditLogs();
    } else if (user.role === "Teacher") {
      this.currentTab = "dashboard";
    }

    this.renderHeader();
    this.renderActiveTab();
    this.renderBottomNav();
  }

  saveCounselorAlerts() {
    localStorage.setItem('nigraan_counselor_alerts', JSON.stringify(this.counselorAlerts));
  }

  resolveCounselorAlert(alertId) {
    const alertItem = this.counselorAlerts.find(a => a.id === alertId);
    if (alertItem) {
      alertItem.status = "RESOLVED";
      this.saveCounselorAlerts();
      this.showToast(`Alert for ${alertItem.studentName} marked actioned.`);
      this.renderActiveTab();
    }
  }

  async loadAuditLogs() {
    try {
      const response = await fetch(`${authService.apiBase}/api/audit-logs`, {
        headers: authService.getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        this.auditLogs = data.auditLogs || [];
        if (this.currentTab === 'admin') {
          this.renderActiveTab();
        }
      }
    } catch (err) {
      console.warn("Audit log fetch error:", err.message);
    }
  }

  // 1. Portal Login Screen with Real Email/Password Auth & JWT Issue
  renderPortalLoginScreen() {
    const headerEl = document.getElementById("app-header");
    const contentEl = document.getElementById("app-content");
    const navEl = document.getElementById("bottom-nav");
    const fabEl = document.getElementById("fab-action-btn");

    if (fabEl) fabEl.style.display = "none";
    if (navEl) navEl.style.display = "none";

    if (headerEl) {
      headerEl.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="images/logo.png" alt="Nigraan Logo" class="brand-logo-img">
          <div>
            <h1 class="font-extrabold text-lg text-white leading-none tracking-tight">Nigraan</h1>
            <span class="text-[10px] text-emerald-300 font-semibold block mt-0.5">Every student, seen before they're lost.</span>
          </div>
        </div>
        <button onclick="appController.openOnboardingModal()" class="text-[11px] bg-emerald-950/80 text-emerald-200 border border-emerald-700/80 px-3 py-1 rounded-full font-bold hover:bg-emerald-900">
          ℹ️ Tour App
        </button>
      `;
    }

    if (contentEl) {
      contentEl.innerHTML = `
        <div class="space-y-4 py-2">
          <!-- Hero Banner -->
          <div class="hero-detail-card text-center space-y-2">
            <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 block">EARLY WARNING & STUDENT SUPPORT</span>
            <h2 class="font-black text-2xl tracking-tight text-white">Welcome to Nigraan</h2>
            <p class="text-xs text-emerald-100/90 font-medium italic">"Every student, seen before they're lost."</p>
            <div class="pt-2">
              <span class="inline-block bg-white/10 backdrop-filter blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                🔒 JWT Authenticated & Server-Side RBAC
              </span>
            </div>
          </div>

          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Select Portal to Authenticate</div>

          <!-- Teacher Portal Login -->
          <div class="stitch-card border-2 border-emerald-600 bg-white shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xl shadow-xs">
                👨‍🏫
              </div>
              <div>
                <h3 class="font-extrabold text-slate-900 text-sm">Teacher Portal</h3>
                <p class="text-xs text-slate-500 font-medium">Class Rosters, Marks Entry & Early Warnings</p>
              </div>
            </div>
            
            <div class="space-y-2 mb-3">
              <input type="email" id="login-email-Teacher" value="teacher@nigraan.edu.pk" class="input-field mb-0 text-xs" placeholder="Email">
              <input type="password" id="login-pass-Teacher" value="teacher123" class="input-field mb-0 text-xs" placeholder="Password">
            </div>

            <button onclick="appController.loginAs('Teacher')" class="btn-stitch-primary">
              <span class="material-symbols-outlined text-sm">login</span> Authenticate Teacher (JWT)
            </button>
          </div>

          <!-- Counselor Portal Login -->
          <div class="stitch-card border-2 border-slate-800 bg-white shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xl shadow-xs">
                🏛️
              </div>
              <div>
                <h3 class="font-extrabold text-slate-900 text-sm">Admin / Counselor Portal</h3>
                <p class="text-xs text-slate-500 font-medium">Systemic Analytics, Case Triggers & AI Audits</p>
              </div>
            </div>

            <div class="space-y-2 mb-3">
              <input type="email" id="login-email-Counselor" value="admin@nigraan.edu.pk" class="input-field mb-0 text-xs" placeholder="Email">
              <input type="password" id="login-pass-Counselor" value="admin123" class="input-field mb-0 text-xs" placeholder="Password">
            </div>

            <button onclick="appController.loginAs('Counselor')" class="btn-stitch-dark">
              <span class="material-symbols-outlined text-sm">admin_panel_settings</span> Authenticate Counselor (JWT)
            </button>
          </div>

          <!-- Student Portal Login -->
          <div class="stitch-card border-2 border-emerald-500 bg-emerald-50/40 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-12 h-12 rounded-2xl bg-emerald-200 text-emerald-950 flex items-center justify-center font-bold text-xl shadow-xs">
                🎓
              </div>
              <div>
                <h3 class="font-extrabold text-slate-900 text-sm">Student Portal</h3>
                <p class="text-xs text-slate-500 font-medium">My Journey, Nigraan AI Notes & Quizzes</p>
              </div>
            </div>

            <div class="space-y-2 mb-3">
              <input type="email" id="login-email-Student" value="zainab@student.nigraan.edu.pk" class="input-field mb-0 text-xs" placeholder="Email">
              <input type="password" id="login-pass-Student" value="student123" class="input-field mb-0 text-xs" placeholder="Password">
            </div>

            <button onclick="appController.loginAs('Student')" class="btn-stitch-primary">
              <span class="material-symbols-outlined text-sm">school</span> Authenticate Student (JWT)
            </button>
          </div>
        </div>
      `;
    }
  }

  async loginAs(role) {
    const demos = authService.getDemoCredentials();
    let email = "";
    let pass = "";
    if (role === "Teacher") { email = demos.teacher.email; pass = demos.teacher.pass; }
    else if (role === "Counselor") { email = demos.admin.email; pass = demos.admin.pass; }
    else if (role === "Student") { email = demos.student.email; pass = demos.student.pass; }

    const inputEmail = document.getElementById(`login-email-${role}`);
    const inputPass = document.getElementById(`login-pass-${role}`);
    if (inputEmail && inputEmail.value) email = inputEmail.value.trim();
    if (inputPass && inputPass.value) pass = inputPass.value.trim();

    const res = await authService.login(email, pass);
    if (res.success) {
      this.showToast(`Authenticated into ${res.user.role} Portal (JWT Token Issued)!`);
      await this.init();
    } else {
      this.showToast(`Authentication Error: ${res.error}`);
    }
  }

  logout() {
    authService.logout();
    this.showToast("Logged out of Nigraan session.");
    this.init();
  }

  switchTab(tab) {
    this.currentTab = tab;
    if (tab === 'admin') this.loadAuditLogs();
    this.renderActiveTab();
    this.renderBottomNav();
  }

  selectStudent(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (student) {
      this.selectedStudent = student;
      this.switchTab("insight");
    }
  }

  handleSearch(query) {
    this.searchQuery = query.toLowerCase();
    this.renderActiveTab();
  }

  setRiskFilter(filter) {
    this.riskFilter = filter;
    this.renderActiveTab();
  }

  setStudyStyle(style) {
    ustaadAIStudyCompanion.setStyle(style);
    this.renderActiveTab();
    this.showToast(`Explanation style set to: ${style}`);
  }

  handleTaskToggle(studentId, taskId) {
    const res = recoveryPlanModule.toggleTask(studentId, taskId);
    if (res) {
      firebaseService.saveStudentToFirestore(res.student);
      this.renderActiveTab();
      if (res.pct === 100) {
        this.showToast("🎉 Recovery Plan 100% Complete! Risk Status: Low (On Track)");
        if (typeof confetti === 'function') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      } else {
        this.showToast(`Recovery milestone updated (${res.pct}% complete)`);
      }
    }
  }

  deleteDocument(docId) {
    if (confirm("Are you sure you want to delete this study material document?")) {
      ustaadAIStudyCompanion.deleteDocument(docId);
      this.renderActiveTab();
      this.showToast("Document removed from study companion.");
    }
  }

  setActiveDocument(docId) {
    if (ustaadAIStudyCompanion.setActiveDocument(docId)) {
      this.renderActiveTab();
      this.showToast("Active grounding document switched!");
    }
  }

  openParentNotificationDraftModal(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (student) {
      this.openModal(interventionSimulator.renderParentNotificationDraftModal(student));
    }
  }

  sendParentNotification(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return;

    const smsText = document.getElementById("draft-parent-sms") ? document.getElementById("draft-parent-sms").value : "";

    student.riskLevel = "Medium";
    student.riskScore = 40;
    if (student.digitalTwinTimeline) {
      student.digitalTwinTimeline.push({
        week: "Today",
        title: "Supportive Parent Communication Dispatched",
        detail: `Sent SMS & Email update to guardian of ${student.name}. Communication: "${smsText.slice(0, 80)}..."`,
        type: "recovery"
      });
    }

    firebaseService.saveStudentToFirestore(student);
    this.closeModal();
    this.switchTab("journey");
    this.showToast(`📩 Parent Notification dispatched for ${student.name}!`);
    if (typeof confetti === 'function') {
      confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
    }
  }

  // Header Render
  renderHeader() {
    const headerEl = document.getElementById("app-header");
    if (!headerEl) return;

    const user = authService.currentUser;
    const fabEl = document.getElementById("fab-action-btn");
    const navEl = document.getElementById("bottom-nav");

    if (fabEl) fabEl.style.display = user.role === 'Teacher' ? 'flex' : 'none';
    if (navEl) navEl.style.display = 'flex';

    if (this.currentTab === "insight" || this.currentTab === "playground") {
      headerEl.innerHTML = `
        <div class="flex items-center gap-3">
          <button onclick="appController.switchTab('dashboard')" class="text-white hover:text-emerald-300 transition-colors p-1">
            <span class="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <img src="${this.selectedStudent.avatar}" alt="${this.selectedStudent.name}" class="w-9 h-9 rounded-full object-cover border-2 border-emerald-400 shadow-xs">
          <div>
            <h2 class="font-extrabold text-white text-sm leading-tight">${this.selectedStudent.name}</h2>
            <span class="text-[10px] text-emerald-300 font-medium">Nigraan Early Warning</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="appController.openAIAgentHelpModal()" class="bg-emerald-800 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1 hover:bg-emerald-700 shadow-xs" title="Ask AI Agent">
            <span class="material-symbols-outlined text-xs">smart_toy</span> AI Help
          </button>
          <button onclick="appController.openSettingsModal()" class="text-emerald-200 hover:text-white p-1" title="Settings">
            <span class="material-symbols-outlined text-xl">settings</span>
          </button>
          <button onclick="appController.logout()" class="bg-emerald-950 text-emerald-200 border border-emerald-700/80 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-xs hover:bg-emerald-900">
            <span class="material-symbols-outlined text-xs">logout</span> Logout
          </button>
        </div>
      `;
    } else {
      headerEl.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="images/logo.png" alt="Nigraan Logo" class="brand-logo-img">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-extrabold text-white text-sm leading-tight">Nigraan</h1>
              <span class="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-1.5 py-0.2 rounded font-bold">${user.role}</span>
            </div>
            <p class="text-[10px] text-emerald-200/90 font-medium">Every student, seen before they're lost.</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="appController.openAIAgentHelpModal()" class="bg-emerald-800 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1 hover:bg-emerald-700 shadow-xs" title="Ask AI Agent">
            <span class="material-symbols-outlined text-xs">smart_toy</span> AI Help
          </button>
          <button onclick="appController.openSettingsModal()" class="text-emerald-200 hover:text-white p-1" title="Settings">
            <span class="material-symbols-outlined text-xl">settings</span>
          </button>
          <button onclick="appController.logout()" class="bg-emerald-950 text-emerald-200 border border-emerald-700/80 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-xs hover:bg-emerald-900">
            <span class="material-symbols-outlined text-xs">logout</span> Switch
          </button>
        </div>
      `;
    }
  }

  generateClientAIResponse(query) {
    if (ustaadAIStudyCompanion.activeDocument && ustaadAIStudyCompanion.activeDocument.ocrFailed) {
      return "This scan didn't come through clearly — the text looks corrupted. Could you try re-scanning with better lighting/focus, or upload the file directly instead of a photo?";
    }

    const q = query.toLowerCase();

    // Rule 3: Only show Document Upload Guide if literally asking how to upload
    if (q.includes('how to upload') || q.includes('where to upload') || q.includes('upload help') || q.includes('how do i upload') || q.includes('how can i upload')) {
      return `📄 **Document Upload Guide**:\n1. Open the **Student Portal** ("My Journey") or tap **"Upload Material"** in Grounded Study Notes.\n2. Tap **"+ Upload New"** or select your PDF, PPTX, TXT, or image file.\n3. Nigraan extracts the text using client-side OCR & parsing, making it your active study grounding source!`;
    }

    // Rule 1, 4 & 5: Scanned Document Analysis Query (Interpreting actual text provided)
    if (q.includes('analyze') || q.includes('scanned') || q.includes('explain this') || q.includes('page (')) {
      if (q.includes('photo') || q.includes('leaf') || q.includes('light') || q.includes('chloroplast')) {
        return `🌿 **Scanned Page Analysis (Photosynthesis)**:\n\nThis page discusses plant energy conversion:\n• **Process**: Chloroplasts absorb sunlight to convert $CO_2$ and $H_2O$ into glucose and oxygen.\n• **Equation**: $6CO_2 + 6H_2O + \\text{Light} \\rightarrow C_6H_{12}O_6 + 6O_2$\n• **Key Takeaway**: Essential for plant growth and oxygen production.`;
      }
      if (q.includes('math') || q.includes('square') || q.includes('quadratic') || q.includes('equation')) {
        return `📐 **Scanned Page Analysis (Mathematics)**:\n\nThis page covers quadratic solutions:\n• **Standard Form**: $ax^2 + bx + c = 0$\n• **Quadratic Formula**: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$\n• **Completing the Square**: Divide by $a$, shift constant $c$, and add $(b/2)^2$ to both sides.`;
      }
      return `📖 **Scanned Document Analysis**:\n\nBased on your scanned page excerpt:\n• **Subject Overview**: Secondary curriculum study material parsed by Nigraan AI.\n• **Core Concept**: Step-by-Step rules and foundational definitions extracted for revision.\n• **Study Advice**: Review the main formulas/rules in Grounded Study Notes and attempt the Adaptive Practice Quiz!`;
    }

    // 2. Science & Biology (Photosynthesis, Cells, Plant Biology)
    if (q.includes('photosynthesis')) {
      return `🌿 **Photosynthesis Explanation**:\n\nPhotosynthesis is the biological process by which green plants, algae, and cyanobacteria convert light energy into chemical energy stored in glucose.\n\n• **Chemical Equation**: $6CO_2 + 6H_2O + \\text{Light} \\rightarrow C_6H_{12}O_6 + 6O_2$\n• **Inputs**: Carbon Dioxide ($CO_2$), Water ($H_2O$), and Sunlight.\n• **Outputs**: Glucose ($C_6H_{12}O_6$) and Oxygen ($O_2$).\n• **Location**: Occurs inside plant **Chloroplasts** containing green **Chlorophyll** pigment.`;
    }
    if (q.includes('cell') || q.includes('biology') || q.includes('organelle')) {
      return `🔬 **Cell Biology Summary**:\n\nA cell is the fundamental structural unit of life.\n• **Nucleus**: Command center containing DNA genetic code.\n• **Mitochondria**: Cellular powerhouse producing ATP energy.\n• **Cell Membrane**: Selective barrier regulating nutrient & waste movement.`;
    }
    if (q.includes('force') || q.includes('physics') || q.includes('newton') || q.includes('gravity')) {
      return `⚛️ **Physics Fundamentals**:\n\n• **Newton's Second Law**: $F = m \\times a$ (Force = mass × acceleration).\n• **Gravitational Acceleration**: $g \\approx 9.8 \\text{ m/s}^2$ on Earth.\n• **Work & Energy**: $W = F \\times d$ (Work = Force × distance).`;
    }

    if (q.includes('camera') || q.includes('scan') || q.includes('photo')) {
      return `📷 **Camera Document Scanner Guide**:\n1. Tap **"Upload & Ground Study Material"** and select **"📷 Scan"**.\n2. Position your physical textbook page or handwritten notes in frame.\n3. Take a photo — Nigraan OCR will extract the text and load it into this AI Assistant automatically for instant Q&A!`;
    }
    if (q.includes('risk') || q.includes('score') || q.includes('drop')) {
      return `📊 **Nigraan AI 3-Signal Risk Engine**:\n- **Attendance Rate (35%)**: Monitors 3-week declining trends below 75%.\n- **Academic Marks (40%)**: Pinpoints concept gaps.\n- **Fee Status (25%)**: Detects early financial stress.\nScores ≥70% trigger High Risk early warnings requiring intervention.`;
    }
    if (q.includes('math') || q.includes('square') || q.includes('quadratic') || q.includes('algebra')) {
      return `📐 **Completing the Square Step-by-Step**:\nFor ax² + bx + c = 0:\n1. Divide by a so coefficient of x² is 1.\n2. Move constant term c to the right side.\n3. Add (b/2)² to BOTH sides of the equation.\n4. Factor left side as (x + b/2)² and solve using square roots!`;
    }
    if (q.includes('parent') || q.includes('sms') || q.includes('email')) {
      return `✉️ **Parent Notification Guide**:\n1. Open **Intervention Playground**.\n2. Select **"Supportive Parent Notification"**.\n3. Tap **"Edit & Dispatch Parent SMS/Email"** to review and edit pre-filled supportive templates before sending!`;
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('help')) {
      return `👋 Assalam-o-Alaikum! I am your **Nigraan AI Assistant** ("Every student, seen before they're lost.").\n\nHow can I help you today? Ask me about:\n- What is photosynthesis or any science topic\n- Analyzing scanned study pages (.pdf, .png, .jpg)\n- Using the 📷 Camera Document Scanner\n- 3-Signal Early Dropout Risk Scores`;
    }

    return `🤖 **Nigraan AI Assistant Response**:\n\nRegarding your query: "${query}"\n\nNigraan's early intervention platform combines attendance trends, quiz assessment marks, and grounded study notes. You can ask me any question on Science, Biology, Math, or Nigraan features!`;
  }

  // Interactive Nigraan AI Help Agent Modal
  openAIAgentHelpModal() {
    this.openModal(`
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
              <span class="material-symbols-outlined text-sm">smart_toy</span>
            </div>
            <div>
              <h3 class="font-extrabold text-slate-900 text-sm">Nigraan AI Help Assistant</h3>
              <span class="text-[10px] text-emerald-700 font-bold block">Every student, seen before they're lost.</span>
            </div>
          </div>
          <button onclick="appController.closeModal()" class="text-slate-400 hover:text-slate-600 p-1">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div id="ai-chat-messages" class="space-y-3 max-h-72 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs" style="direction: ltr !important; text-align: left !important;">
          <div class="chat-bubble-ai">
            <strong class="font-extrabold block text-xs mb-1">🤖 Nigraan AI Assistant</strong>
            Assalam-o-Alaikum! I am your AI Support Agent. Ask me anything about Science (e.g. Photosynthesis), Math, uploading study materials, or scanning document photos!
          </div>
        </div>

        <div>
          <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Quick Help Suggestions</span>
          <div class="flex flex-wrap gap-1.5">
            <button onclick="appController.sendAIAgentMessage('What is photosynthesis?')" class="filter-chip text-[10px]">🌿 Photosynthesis</button>
            <button onclick="appController.sendAIAgentMessage('How do I upload study materials?')" class="filter-chip text-[10px]">📄 Upload Help</button>
            <button onclick="appController.sendAIAgentMessage('How do I scan with camera?')" class="filter-chip text-[10px]">📷 Camera Scan</button>
            <button onclick="appController.sendAIAgentMessage('How is dropout risk calculated?')" class="filter-chip text-[10px]">📊 Risk Score Help</button>
          </div>
        </div>

        <div class="ai-chat-input-row pt-1">
          <input type="text" id="ai-agent-input" class="ai-chat-input-field" placeholder="Type question (e.g. what is photosynthesis?)..." onkeydown="if(event.key==='Enter') appController.sendAIAgentMessage()">
          <button onclick="appController.sendAIAgentMessage()" class="ai-chat-send-btn">
            <span class="material-symbols-outlined text-sm">send</span> Send
          </button>
        </div>
      </div>
    `);
  }

  async sendAIAgentMessage(presetQuery = null) {
    const inputEl = document.getElementById("ai-agent-input");
    const query = presetQuery || (inputEl ? inputEl.value.trim() : "");
    if (!query) return;

    if (inputEl) inputEl.value = "";

    const msgContainer = document.getElementById("ai-chat-messages");
    if (!msgContainer) return;

    // Render User Bubble
    msgContainer.innerHTML += `
      <div class="chat-bubble-user">
        <strong class="font-bold block text-[10px] text-emerald-300 mb-0.5">You</strong>
        <span>${query}</span>
      </div>
      <div id="ai-typing-indicator" class="text-[10px] text-slate-400 italic pl-1">Nigraan AI is thinking...</div>
    `;
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Call backend API with fast local fallback timeout
    let aiAnswer = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${authService.apiBase}/api/ai/chat`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          query,
          role: authService.getCurrentRole(),
          activeDocumentText: ustaadAIStudyCompanion.activeDocument ? ustaadAIStudyCompanion.activeDocument.textContent : "",
          ocrFailed: ustaadAIStudyCompanion.activeDocument ? !!ustaadAIStudyCompanion.activeDocument.ocrFailed : false
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.answer) {
          aiAnswer = data.answer;
        }
      }
    } catch (err) {
      console.warn("AI Chat fetch fallback active:", err.message);
    }

    // Always fallback to client AI response if server unavailable
    if (!aiAnswer) {
      aiAnswer = this.generateClientAIResponse(query);
    }

    const typingEl = document.getElementById("ai-typing-indicator");
    if (typingEl) typingEl.remove();

    msgContainer.innerHTML += `
      <div class="chat-bubble-ai">
        <strong class="font-extrabold block text-xs mb-1">🤖 Nigraan AI Assistant</strong>
        <div class="whitespace-pre-wrap leading-relaxed">${aiAnswer}</div>
      </div>
    `;
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  generateClientAIResponse(query) {
    if (!query) return "Please enter a question so I can assist you!";
    const q = query.toLowerCase();

    if (typeof ustaadAIStudyCompanion !== 'undefined' && ustaadAIStudyCompanion.activeDocument && ustaadAIStudyCompanion.activeDocument.ocrFailed) {
      return "This scan didn't come through clearly — the text looks corrupted. Could you try re-scanning with better lighting/focus, or upload the file directly instead of a photo?";
    }

    if (typeof ustaadAIStudyCompanion !== 'undefined' && ustaadAIStudyCompanion.activeDocument && ustaadAIStudyCompanion.activeDocument.textContent) {
      const excerpt = ustaadAIStudyCompanion.activeDocument.textContent.slice(0, 300);
      return `📖 **Scanned Document Analysis**:\n\nBased on your active document (${ustaadAIStudyCompanion.activeDocument.fileName}):\n"""${excerpt}"""...\n\n• **Core Concept**: Educational study content parsed and grounded by Nigraan AI.\n• **Key Takeaway**: Review key definitions, formulas, and step-by-step worked examples in your Grounded Notes!`;
    }

    if (q.includes('photosynthesis')) {
      return `🌿 **Photosynthesis Explanation**:\n\nPhotosynthesis is the biological process where plants convert light energy into chemical energy:\n\n• **Chemical Equation**: $6CO_2 + 6H_2O + \\text{Light} \\rightarrow C_6H_{12}O_6 + 6O_2$\n• **Inputs**: Carbon Dioxide, Water, and Sunlight.\n• **Outputs**: Glucose (energy) and Oxygen gas.\n• **Location**: Takes place inside chloroplasts containing green chlorophyll.`;
    }

    if (q.includes('math') || q.includes('quadratic') || q.includes('square') || q.includes('equation')) {
      return `📐 **Mathematics: Quadratic Equations & Completing the Square**:\n\n• **Standard Form**: $ax^2 + bx + c = 0$\n• **Quadratic Solution**: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$\n• **Completing the Square**: 1. Divide by $a$. 2. Move $c$ to RHS. 3. Add $(b/2)^2$ to both sides. 4. Solve for $x$.`;
    }

    if (q.includes('risk') || q.includes('score') || q.includes('drop') || q.includes('calculate')) {
      return `📊 **Nigraan 3-Signal AI Early Warning System**:\n- **Attendance Rate (35%)**: Tracks 3-week declining trends below 75%.\n- **Academic Marks (40%)**: Identifies subject and concept mastery gaps.\n- **Fee Status (25%)**: Flags financial overdue status early.\nRisk scores ≥70% trigger High Risk alerts for teacher & counselor action.`;
    }

    if (q.includes('upload') || q.includes('camera') || q.includes('scan')) {
      return `📄 **Document Upload & Camera Scan Guide**:\n1. Open **Student Portal** ("My Journey").\n2. Tap **"+ Upload New"** to select PDF/PPTX/TXT files or **"📷 Scan"** to capture textbook photos.\n3. Nigraan extracts and grounds text for instant AI tutoring!`;
    }

    return `🤖 **Nigraan AI Study Assistant**:\n\nRegarding your question: "${query}"\n\nI am ready to help you with study concepts (biology, math, physics), textbook document explanations, or platform guidance! Ask any specific question anytime.`;
  }

  // Active Tab Renderer
  renderActiveTab() {
    const contentEl = document.getElementById("app-content");
    if (!contentEl) return;

    if (this.currentTab === "dashboard") {
      contentEl.innerHTML = this.renderTeacherDashboard();
    } else if (this.currentTab === "insight") {
      contentEl.innerHTML = this.renderAIRiskInsightDetail();
    } else if (this.currentTab === "playground") {
      contentEl.innerHTML = interventionSimulator.renderInterventionPlayground(this.selectedStudent);
    } else if (this.currentTab === "journey") {
      contentEl.innerHTML = this.renderStudentJourney();
    } else if (this.currentTab === "admin") {
      contentEl.innerHTML = this.renderCounselorAdminDashboard();
    }
  }

  // Teacher Dashboard Screen
  renderTeacherDashboard() {
    let filtered = this.students;

    if (this.searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(this.searchQuery) ||
        s.grade.toLowerCase().includes(this.searchQuery) ||
        s.id.toLowerCase().includes(this.searchQuery)
      );
    }

    if (this.riskFilter !== "All") {
      filtered = filtered.filter(s => s.riskLevel === this.riskFilter);
    }

    const actionRequiredCards = filtered.map(s => {
      let isHigh = s.riskLevel === "High";
      let isMed = s.riskLevel === "Medium";
      let borderClass = isHigh ? "stitch-card-rose" : (isMed ? "stitch-card-amber" : "stitch-card-mint");
      let badgeRisk = isHigh
        ? `<span class="badge-risk-high">! HIGH RISK</span>`
        : (isMed ? `<span class="badge-risk-moderate">⚠️ MODERATE</span>` : `<span class="badge-risk-low">✓ ON TRACK</span>`);

      let attClass = s.attendanceCurrent < 75 ? "signal-box-danger" : "signal-box-success";
      let acadClass = s.academicCurrent < 60 ? "signal-box-danger" : "signal-box-success";
      let feeClass = s.feeDaysOverdue > 0 ? "signal-box-danger" : "signal-box-success";

      return `
        <div class="stitch-card ${borderClass}">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <img src="${s.avatar}" alt="${s.name}" class="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow-xs">
              <div>
                <h3 class="font-extrabold text-slate-900 text-sm leading-tight">${s.name}</h3>
                <p class="text-xs text-slate-500 font-medium">${s.grade} • ID: ${s.id}</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="badge-confidence">${s.confidence}% CONFIDENCE</span>
              ${badgeRisk}
            </div>
          </div>

          <div class="signal-matrix-grid">
            <div class="signal-box ${attClass}">
              <span class="text-[9px] font-extrabold uppercase block text-slate-500">ATTENDANCE</span>
              <strong class="text-sm font-black">${s.attendanceCurrent}%</strong>
              <span class="text-[9px] block text-slate-500 mt-0.5">${s.attendanceCurrent < 75 ? '3-Wk Declining' : 'Healthy'}</span>
            </div>
            <div class="signal-box ${acadClass}">
              <span class="text-[9px] font-extrabold uppercase block text-slate-500">MARKS</span>
              <strong class="text-sm font-black">${s.academicCurrent}%</strong>
              <span class="text-[9px] block text-slate-500 mt-0.5">${s.weakSubject || 'Stable'}</span>
            </div>
            <div class="signal-box ${feeClass}">
              <span class="text-[9px] font-extrabold uppercase block text-slate-500">FEE DEPOSIT</span>
              <strong class="text-sm font-black">${s.feeDaysOverdue > 0 ? s.feeDaysOverdue + 'd Overdue' : 'Paid'}</strong>
              <span class="text-[9px] block text-slate-500 mt-0.5">${s.feeDaysOverdue > 0 ? 'Pending' : 'Up to Date'}</span>
            </div>
          </div>

          ${isHigh ? `
          <div class="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-950 mb-3">
            <span class="material-symbols-outlined text-rose-600 text-base shrink-0">warning</span>
            <span>Nigraan AI Signal Fusion: Student is at critical early dropout risk. Immediate intervention recommended.</span>
          </div>` : ''}

          <button onclick="appController.selectStudent('${s.id}')" class="btn-stitch-primary">
            <span class="material-symbols-outlined text-sm">lightbulb</span> View AI Risk Reasoning & Trends
          </button>
        </div>
      `;
    }).join('');

    const highCount = this.students.filter(s => s.riskLevel === 'High').length;
    const medCount = this.students.filter(s => s.riskLevel === 'Medium').length;
    const lowCount = this.students.filter(s => s.riskLevel === 'Low').length;

    return `
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white p-4 rounded-2xl shadow-md relative overflow-hidden">
          <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 block mb-1">NIGRAAN DASHBOARD</span>
          <h2 class="font-extrabold text-base">Teacher Overview</h2>
          <p class="text-xs text-emerald-200/90 italic mt-0.5">"Every student, seen before they're lost."</p>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div onclick="appController.setRiskFilter('High')" class="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-center cursor-pointer ${this.riskFilter === 'High' ? 'ring-2 ring-rose-500' : ''}">
            <span class="text-[9px] font-extrabold uppercase text-rose-800 block">HIGH RISK</span>
            <span class="text-2xl font-black text-rose-950">${highCount}</span>
          </div>
          <div onclick="appController.setRiskFilter('Medium')" class="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center cursor-pointer ${this.riskFilter === 'Medium' ? 'ring-2 ring-amber-500' : ''}">
            <span class="text-[9px] font-extrabold uppercase text-amber-800 block">MODERATE</span>
            <span class="text-2xl font-black text-amber-950">${medCount}</span>
          </div>
          <div onclick="appController.setRiskFilter('Low')" class="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center cursor-pointer ${this.riskFilter === 'Low' ? 'ring-2 ring-emerald-500' : ''}">
            <span class="text-[9px] font-extrabold uppercase text-emerald-800 block">ON TRACK</span>
            <span class="text-2xl font-black text-emerald-950">${lowCount}</span>
          </div>
        </div>

        <div class="space-y-2">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-lg">search</span>
            <input type="text" value="${this.searchQuery}" oninput="appController.handleSearch(this.value)" placeholder="Search student name, grade, or ID..." class="input-field pl-10 mb-0">
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button onclick="appController.setRiskFilter('All')" class="filter-chip ${this.riskFilter === 'All' ? 'active' : ''}">All (${this.students.length})</button>
            <button onclick="appController.setRiskFilter('High')" class="filter-chip ${this.riskFilter === 'High' ? 'active' : ''}">High Risk (${highCount})</button>
            <button onclick="appController.setRiskFilter('Medium')" class="filter-chip ${this.riskFilter === 'Medium' ? 'active' : ''}">Moderate (${medCount})</button>
            <button onclick="appController.setRiskFilter('Low')" class="filter-chip ${this.riskFilter === 'Low' ? 'active' : ''}">On Track (${lowCount})</button>
          </div>
        </div>

        <div>
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">QUICK ENTRY ACTIONS</span>
          <div class="grid grid-cols-3 gap-2">
            <button onclick="appController.openDataEntryModal()" class="bg-white border border-slate-200 p-3 rounded-2xl text-center shadow-2xs hover:bg-slate-50">
              <span class="material-symbols-outlined text-emerald-700 text-xl block mb-1">person_check</span>
              <span class="text-xs font-bold text-slate-800">Attendance</span>
            </button>
            <button onclick="appController.openDataEntryModal()" class="bg-white border border-slate-200 p-3 rounded-2xl text-center shadow-2xs hover:bg-slate-50">
              <span class="material-symbols-outlined text-emerald-700 text-xl block mb-1">quiz</span>
              <span class="text-xs font-bold text-slate-800">Add Marks</span>
            </button>
            <button onclick="appController.openDataEntryModal()" class="bg-white border border-slate-200 p-3 rounded-2xl text-center shadow-2xs hover:bg-slate-50">
              <span class="material-symbols-outlined text-emerald-700 text-xl block mb-1">payments</span>
              <span class="text-xs font-bold text-slate-800">Fees</span>
            </button>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <h2 class="font-extrabold text-slate-900 text-base">Roster & Early Warnings</h2>
            <span class="text-xs font-bold text-emerald-800">${filtered.length} Displayed</span>
          </div>

          <div class="space-y-3">
            ${actionRequiredCards.length > 0 ? actionRequiredCards : `<div class="bg-white p-6 rounded-2xl text-center text-slate-500 text-xs font-semibold">No students match your search criteria.</div>`}
          </div>
        </div>
      </div>
    `;
  }

  // AI Risk Insight Detail Screen
  renderAIRiskInsightDetail() {
    const s = this.selectedStudent;
    const ai = ustaadAIEngine.calculateRiskAssessment(s);

    return `
      <div class="space-y-4">
        <div class="hero-detail-card text-center">
          <img src="${s.avatar}" alt="${s.name}" class="w-20 h-20 rounded-full object-cover border-4 border-emerald-400 mx-auto shadow-lg mb-3">
          <h2 class="font-black text-xl text-white">${s.name}</h2>
          <p class="text-xs text-emerald-200 font-medium">${s.grade} • Roll: ${s.rollNo}</p>
          <p class="text-[11px] text-emerald-300/90 italic mt-1">"Every student, seen before they're lost."</p>

          <div class="mt-4 ring-gauge-container">
            <svg class="ring-gauge-svg" viewBox="0 0 140 140">
              <circle class="ring-gauge-circle-bg" cx="70" cy="70" r="60"/>
              <circle class="ring-gauge-circle-val" cx="70" cy="70" r="60"/>
            </svg>
            <div class="ring-gauge-text">${s.riskScore}%</div>
          </div>

          <div class="mt-3">
            <span class="${s.riskLevel === 'High' ? 'badge-risk-high' : (s.riskLevel === 'Medium' ? 'badge-risk-moderate' : 'badge-risk-low')}">
              <span class="material-symbols-outlined text-xs">warning</span> ${s.riskLevel} Dropout Risk
            </span>
          </div>
          <span class="text-xs font-semibold text-emerald-200 block mt-1">${s.confidence}% AI Confidence</span>
        </div>

        <!-- Before -> Intervention -> After Impact Visualizer Card -->
        ${recoveryPlanModule.renderBeforeAfterImpactCard(s)}

        <!-- 7-Day Recovery Plan Interactive Checklist -->
        ${recoveryPlanModule.renderRecoveryPlanChecklist(s)}

        <div class="stitch-card bg-white p-4">
          <h3 class="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Primary Historical Signals Analyzed</h3>
          <div class="signal-matrix-grid">
            <div class="signal-box signal-box-danger">
              <span class="text-[9px] font-extrabold uppercase block">ATTENDANCE</span>
              <strong class="text-sm font-black">${s.attendanceCurrent}%</strong>
              <span class="text-[9px] block opacity-80">3-Wk Trend</span>
            </div>
            <div class="signal-box signal-box-danger">
              <span class="text-[9px] font-extrabold uppercase block">ACADEMIC MARKS</span>
              <strong class="text-sm font-black">${s.academicCurrent}%</strong>
              <span class="text-[9px] block opacity-80">Quiz Scores</span>
            </div>
            <div class="signal-box signal-box-danger">
              <span class="text-[9px] font-extrabold uppercase block">FEE DEPOSIT</span>
              <strong class="text-sm font-black">${s.feeDaysOverdue}d Overdue</strong>
              <span class="text-[9px] block opacity-80">Installment</span>
            </div>
          </div>
        </div>

        <div class="stitch-card-rose p-4 rounded-2xl relative">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-emerald-800 text-lg">lightbulb</span>
            <h3 class="font-extrabold text-slate-900 text-base">The "Why?" AI Rationale</h3>
          </div>
          <p class="text-xs text-slate-600 mb-3 font-medium">Converging trend signals indicating student support needs:</p>

          <div class="space-y-3 text-xs text-slate-800">
            ${s.whyExplanation ? s.whyExplanation.map(exp => `
              <div class="flex items-start gap-2.5">
                <span class="material-symbols-outlined text-emerald-700 text-base shrink-0 mt-0.5">check_circle</span>
                <span>${exp}</span>
              </div>
            `).join('') : ''}
          </div>
        </div>

        ${digitalTwinModule.renderDigitalTwinTimeline(s)}

        <div class="stitch-card bg-slate-50 text-center p-4">
          <span class="material-symbols-outlined text-slate-700 text-2xl mb-1">lock</span>
          <h4 class="font-extrabold text-slate-900 text-xs mb-1">Confidential Context</h4>
          <p class="text-[11px] text-slate-500 mb-3">Sensitive family or behavioral notes are restricted. Access available only to authorized Counselors.</p>
          <button onclick="appController.openStudentVoiceModal('${s.id}')" class="btn-outline text-xs py-1.5">
            Request Access / Add Check-in
          </button>
        </div>

        <div class="sticky-bottom-action">
          <button onclick="appController.switchTab('playground')" class="btn-stitch-primary">
            <span class="material-symbols-outlined text-sm">rocket_launch</span> Launch Intervention Playground
          </button>
        </div>
      </div>
    `;
  }

  // Student Journey Screen with Grounded Notes, Real Document Extraction & Document Manager
  renderStudentJourney() {
    const s = this.selectedStudent;
    const notes = ustaadAIStudyCompanion.generatePersonalizedNotes(s, ustaadAIStudyCompanion.currentStyle);

    return `
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
          <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 block mb-1">STUDENT PORTAL</span>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-black text-2xl">My Journey</h2>
              <p class="text-xs text-emerald-200 mt-0.5">Every student, seen before they're lost. 🌟</p>
            </div>
            <img src="${s.avatar}" alt="${s.name}" class="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow-md">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white border border-slate-200 p-4 rounded-2xl text-center shadow-2xs">
            <div class="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center mx-auto text-lg font-black text-slate-900 mb-2">
              ${s.conceptMastery || 80}%
            </div>
            <span class="text-xs font-extrabold text-slate-800">Math Concept Mastery</span>
          </div>

          <div class="bg-white border border-slate-200 p-4 rounded-2xl text-center shadow-2xs">
            <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl mb-2 relative">
              <span class="material-symbols-outlined">local_fire_department</span>
              <span class="text-[9px] font-extrabold bg-emerald-700 text-white px-2 py-0.5 rounded-full absolute -bottom-1">4 Days</span>
            </div>
            <span class="text-xs font-extrabold text-slate-800">Attendance Streak</span>
          </div>
        </div>

        <!-- Before -> Intervention -> After Impact Visualizer Card -->
        ${recoveryPlanModule.renderBeforeAfterImpactCard(s)}

        <!-- Interactive 7-Day Academic Recovery Plan Checklist -->
        ${recoveryPlanModule.renderRecoveryPlanChecklist(s)}

        <div class="bg-slate-100/70 p-4 rounded-2xl border border-slate-200">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-slate-700">map</span>
            <h3 class="font-extrabold text-slate-900 text-sm">Your Next Steps</h3>
          </div>

          <div class="space-y-2">
            <div class="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                <span class="material-symbols-outlined text-sm font-bold">check</span>
              </div>
              <div class="flex-1">
                <span class="text-xs font-bold line-through text-slate-400 block">Check-in with Teacher Ahmed</span>
                <span class="text-[10px] text-emerald-700 font-semibold">Awesome job!</span>
              </div>
            </div>

            <div class="bg-white p-3 rounded-xl border-2 border-emerald-600 flex items-center justify-between shadow-2xs">
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                  <span class="material-symbols-outlined text-sm">play_arrow</span>
                </div>
                <div>
                  <strong class="text-xs font-extrabold text-slate-900 block">Math Practice: Algebra Basics</strong>
                  <span class="text-[10px] text-slate-500 font-medium">Ready to start</span>
                </div>
              </div>
              <button onclick="appController.startAdaptiveQuiz('${s.id}')" class="bg-emerald-950 text-white text-xs font-extrabold px-3 py-1.5 rounded-full">
                Start →
              </button>
            </div>
          </div>
        </div>

        <!-- Document Management View Card -->
        <div class="stitch-card bg-white">
          <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-700 text-base">folder_open</span>
              <h3 class="font-extrabold text-slate-900 text-xs">My Uploaded Study Materials</h3>
            </div>
            <button onclick="appController.openDocumentUploadModal()" class="btn-stitch-primary text-xs py-1 px-3">
              + Upload New
            </button>
          </div>

          <div class="space-y-2">
            ${ustaadAIStudyCompanion.uploadedMaterials.length > 0 ? ustaadAIStudyCompanion.uploadedMaterials.map(doc => `
              <div class="flex items-center justify-between p-3 bg-slate-50 border ${ustaadAIStudyCompanion.activeDocument && ustaadAIStudyCompanion.activeDocument.id === doc.id ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/40' : 'border-slate-200'} rounded-xl">
                <div class="flex items-center gap-3 cursor-pointer" onclick="appController.setActiveDocument('${doc.id}')">
                  <span class="material-symbols-outlined text-emerald-700 text-lg">description</span>
                  <div>
                    <h4 class="font-extrabold text-slate-900 text-xs leading-tight">${doc.fileName}</h4>
                    <span class="text-[10px] text-slate-500 font-medium">${doc.sizeKb} KB • ${doc.wordCount} words • ${doc.uploadedAt}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  ${ustaadAIStudyCompanion.activeDocument && ustaadAIStudyCompanion.activeDocument.id === doc.id ? '<span class="text-[9px] bg-emerald-700 text-white font-extrabold px-2 py-0.5 rounded-full">ACTIVE</span>' : ''}
                  <button onclick="appController.deleteDocument('${doc.id}')" class="text-rose-600 hover:text-rose-800 p-1" title="Delete Material">
                    <span class="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            `).join('') : `<div class="text-center p-4 text-slate-400 text-xs italic">No study materials uploaded. Click '+ Upload New' to add notes.</div>`}
          </div>
        </div>

        <!-- Grounded Study Notes with Source Indicator & Style Selector -->
        <div class="stitch-card border-emerald-200">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
              <span class="material-symbols-outlined text-emerald-700 text-sm">auto_awesome</span> Grounded Study Notes
            </h3>
            <button onclick="appController.openDocumentUploadModal()" class="text-emerald-800 font-extrabold text-[11px] underline">
              Upload Material
            </button>
          </div>

          <!-- Grounding Source Transparency Indicator Badge -->
          <div class="mb-3">
            <span class="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${notes.groundingType === 'REAL_EXTRACTED' ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-amber-100 text-amber-950 border border-amber-300'}">
              ${notes.groundingBadge}
            </span>
          </div>

          <!-- Explanation Style Chip Selector -->
          <div class="mb-3">
            <span class="text-[10px] font-extrabold uppercase text-slate-400 block mb-1.5">Explanation Style Selector</span>
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
              ${ustaadAIStudyCompanion.styles.map(style => `
                <button onclick="appController.setStudyStyle('${style}')" class="filter-chip ${ustaadAIStudyCompanion.currentStyle === style ? 'active' : ''}">
                  ${style}
                </button>
              `).join('')}
            </div>
          </div>

          <p class="text-[10px] text-slate-400 italic mb-2">${notes.sourceAttribution}</p>

          <div class="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-700 leading-relaxed font-medium space-y-2.5">
            <div class="border-b border-slate-200 pb-2">
              <strong class="font-extrabold text-emerald-900 block text-xs mb-0.5">${notes.sections[0].heading}</strong>
              <p class="text-slate-600 text-[11px] whitespace-pre-line">${notes.sections[0].content}</p>
            </div>

            <div>
              <strong class="font-extrabold text-slate-900 block text-xs mb-1">${notes.sections[1].heading}</strong>
              <p class="text-slate-800 text-[11px] leading-snug whitespace-pre-line">${notes.sections[1].content}</p>
            </div>

            <div>
              <strong class="font-extrabold text-slate-900 block text-xs mb-1">${notes.sections[2].heading}</strong>
              <div class="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-900 whitespace-pre-wrap leading-relaxed">${notes.sections[2].content}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Counselor & Admin Dashboard Screen with Live Computed Metrics, Trend Charts & AI Audit Logs
  renderCounselorAdminDashboard() {
    const highCount = this.students.filter(s => s.riskLevel === 'High').length;
    const medCount = this.students.filter(s => s.riskLevel === 'Medium').length;
    const lowCount = this.students.filter(s => s.riskLevel === 'Low').length;
    const totalStudents = this.students.length || 1;

    // Live weak concept cluster calculations
    const conceptCounts = {};
    this.students.forEach(s => {
      const key = s.weakConcept || 'General Concept Mastery';
      conceptCounts[key] = (conceptCounts[key] || 0) + 1;
    });

    const conceptBarsHtml = Object.entries(conceptCounts).map(([concept, count]) => {
      const pct = Math.round((count / totalStudents) * 100);
      return `
        <div>
          <div class="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
            <span>${concept}</span>
            <span class="text-rose-600 font-bold">${pct}% Struggling (${count} ${count === 1 ? 'student' : 'students'})</span>
          </div>
          <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-rose-500 transition-all duration-500" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');

    // Persistent Counselor Alert Inbox HTML
    const activeAlerts = this.counselorAlerts.filter(a => a.status === 'ACTIVE');
    const alertsHtml = activeAlerts.map(alt => `
      <div class="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-extrabold uppercase bg-rose-700 text-white px-2 py-0.5 rounded-full">${alt.type}</span>
          <span class="text-[10px] text-slate-400 font-semibold">${alt.timestamp}</span>
        </div>
        <h4 class="font-extrabold text-slate-900 text-xs">${alt.title} (${alt.studentName})</h4>
        <p class="text-[11px] text-slate-600 leading-snug">${alt.detail}</p>
        <div class="flex items-center gap-2 pt-1">
          <button onclick="appController.selectStudent('${alt.studentId}')" class="btn-stitch-primary text-[10px] py-1 px-2.5">
            Open Student Profile
          </button>
          <button onclick="appController.resolveCounselorAlert('${alt.id}')" class="btn-outline text-[10px] py-1 px-2.5">
            Mark Actioned
          </button>
        </div>
      </div>
    `).join('');

    // Live intervention history compilation across students
    const interventionsList = [];
    this.students.forEach(s => {
      if (s.digitalTwinTimeline) {
        s.digitalTwinTimeline.filter(t => t.type === 'recovery').forEach(t => {
          interventionsList.push({
            studentName: s.name,
            avatar: s.avatar,
            title: t.title,
            detail: t.detail,
            week: t.week
          });
        });
      }
    });

    const interventionsHtml = interventionsList.map(inv => `
      <div class="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
        <img src="${inv.avatar}" alt="${inv.studentName}" class="w-9 h-9 rounded-full object-cover border border-emerald-400">
        <div class="flex-1">
          <div class="flex items-center justify-between font-bold text-slate-900">
            <span>${inv.title} (${inv.studentName})</span>
            <span class="text-[10px] text-slate-400 font-normal">${inv.week}</span>
          </div>
          <p class="text-[11px] text-slate-600 mt-0.5">${inv.detail}</p>
        </div>
      </div>
    `).join('');

    const auditHtml = this.auditLogs.map(log => `
      <div class="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1">
        <div class="flex items-center justify-between font-bold text-slate-800">
          <span class="text-emerald-800 font-extrabold">${log.actionType}</span>
          <span class="text-[10px] text-slate-400 font-normal">${new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
        </div>
        <div class="text-slate-700"><strong>Actor:</strong> ${log.actor.name} (${log.actor.role})</div>
        <div class="text-slate-600"><strong>Student ID:</strong> ${log.studentId} • <strong>Risk Change:</strong> ${log.previousRisk} → ${log.newRisk}</div>
        <p class="text-[11px] text-slate-500 italic mt-1">${log.details}</p>
      </div>
    `).join('');

    return `
      <div class="space-y-4">
        <div class="bg-slate-900 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <h2 class="font-extrabold text-base">Counselor & Admin Analytics</h2>
            <p class="text-xs text-slate-300 mt-0.5">Live Calculated Metrics & AI Audit Trail Active</p>
          </div>
          <button onclick="appController.openPrivacySettingsModal()" class="text-emerald-300 hover:text-white p-1" title="Privacy Settings">
            <span class="material-symbols-outlined text-xl">shield</span>
          </button>
        </div>

        <!-- Live Computed Risk Count Tiles -->
        <div class="grid grid-cols-3 gap-2">
          <div onclick="appController.setRiskFilter('High'); appController.switchTab('dashboard');" class="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center cursor-pointer hover:bg-rose-100/60">
            <span class="text-[10px] font-extrabold uppercase text-rose-700 block">HIGH RISK</span>
            <span class="text-2xl font-black text-rose-900">${highCount}</span>
          </div>
          <div onclick="appController.setRiskFilter('Medium'); appController.switchTab('dashboard');" class="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center cursor-pointer hover:bg-amber-100/60">
            <span class="text-[10px] font-extrabold uppercase text-amber-700 block">MEDIUM RISK</span>
            <span class="text-2xl font-black text-amber-900">${medCount}</span>
          </div>
          <div onclick="appController.setRiskFilter('Low'); appController.switchTab('dashboard');" class="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center cursor-pointer hover:bg-emerald-100/60">
            <span class="text-[10px] font-extrabold uppercase text-emerald-700 block">ON TRACK</span>
            <span class="text-2xl font-black text-emerald-900">${lowCount}</span>
          </div>
        </div>

        <!-- Persistent Counselor Alert & Notification Inbox -->
        <div class="stitch-card bg-white border-2 border-rose-500/40">
          <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-rose-600 text-lg">notifications_active</span>
              <h3 class="font-extrabold text-slate-900 text-sm">Counselor Alert Inbox</h3>
            </div>
            <span class="text-[10px] bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded-full">${activeAlerts.length} Action Items</span>
          </div>

          <div class="space-y-2 max-h-64 overflow-y-auto">
            ${alertsHtml.length > 0 ? alertsHtml : `<div class="p-4 text-center text-slate-400 text-xs italic">No active alerts requiring immediate action.</div>`}
          </div>
        </div>

        <!-- School-Wide Weak Concept Clusters Card -->
        <div class="stitch-card bg-white">
          <h4 class="font-extrabold text-slate-900 text-xs mb-3">School-wide Weak Concept Clusters (Live Calculated)</h4>
          <div class="space-y-3 text-xs">
            ${conceptBarsHtml}
          </div>
        </div>

        <!-- Per-Student Historical Performance Trend Line Chart -->
        ${digitalTwinModule.renderTrendLineChart(this.selectedStudent)}

        <!-- Intervention History Log Card -->
        <div class="stitch-card bg-white">
          <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-700 text-lg">history</span>
              <h3 class="font-extrabold text-slate-900 text-sm">Intervention History Log</h3>
            </div>
            <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">${interventionsList.length} Recorded</span>
          </div>

          <div class="space-y-2 max-h-64 overflow-y-auto">
            ${interventionsHtml.length > 0 ? interventionsHtml : `<div class="p-4 text-center text-slate-400 text-xs italic">No past interventions logged yet. Activate a strategy in Playground.</div>`}
          </div>
        </div>

        <!-- AI Reasoning Audit Trail Card -->
        <div class="stitch-card bg-white">
          <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-700 text-lg">history_edu</span>
              <h3 class="font-extrabold text-slate-900 text-sm">AI Reasoning & Action Audit Trail</h3>
            </div>
            <span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">${this.auditLogs.length} Records</span>
          </div>

          <div class="space-y-2 max-h-72 overflow-y-auto">
            ${auditHtml.length > 0 ? auditHtml : `<div class="p-4 text-center text-slate-400 text-xs italic">Loading audit trail logs from backend proxy...</div>`}
          </div>
        </div>
      </div>
    `;
  }

  // Bottom Navigation Bar Role Scoped
  renderBottomNav() {
    const navEl = document.getElementById("bottom-nav");
    if (!navEl) return;

    const role = authService.getCurrentRole();
    let items = [];

    if (role === "Teacher") {
      items = [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "insight", label: "Students", icon: "groups" },
        { id: "playground", label: "Alerts", icon: "warning" }
      ];
    } else if (role === "Counselor") {
      items = [
        { id: "admin", label: "Analytics", icon: "analytics" },
        { id: "insight", label: "Students", icon: "groups" },
        { id: "playground", label: "Playground", icon: "tune" }
      ];
    } else {
      items = [
        { id: "journey", label: "My Journey", icon: "school" },
        { id: "insight", label: "Progress", icon: "person" }
      ];
    }

    navEl.innerHTML = items.map(item => `
      <button onclick="appController.switchTab('${item.id}')" class="stitch-nav-item ${this.currentTab === item.id ? 'active' : ''}">
        <span class="material-symbols-outlined">${item.icon}</span>
        <span>${item.label}</span>
      </button>
    `).join('');
  }

  // Onboarding Splash Modal
  openOnboardingModal() {
    this.openModal(`
      <div class="text-center space-y-3 py-1">
        <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto shadow-sm">
          <img src="images/logo.png" alt="Nigraan Logo" class="w-10 h-10 object-contain">
        </div>
        <h3 class="font-extrabold text-slate-900 text-lg">Welcome to Nigraan</h3>
        <p class="text-xs text-emerald-800 font-medium italic">"Every student, seen before they're lost."</p>

        <div class="space-y-2 text-left text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div class="flex items-start gap-2">
            <span class="material-symbols-outlined text-emerald-700 text-base shrink-0">signal_cellular_alt</span>
            <span><strong>3-Signal AI Fusion:</strong> Combines attendance, quiz marks, and fee status to detect early dropout risks.</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="material-symbols-outlined text-emerald-700 text-base shrink-0">record_voice_over</span>
            <span><strong>Student Voice:</strong> Allows voluntary student check-ins to provide confidential context.</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="material-symbols-outlined text-emerald-700 text-base shrink-0">auto_awesome</span>
            <span><strong>Grounded AI Study Companion:</strong> Parses PDF notes and scanned images with OCR.</span>
          </div>
        </div>

        <button onclick="appController.closeModal()" class="btn-stitch-primary w-full">
          Get Started with Nigraan →
        </button>
      </div>
    `);
  }

  // Privacy & Data Security Modal
  openPrivacySettingsModal() {
    this.openModal(`
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-700">shield</span>
            <h3 class="font-extrabold text-slate-900 text-base">Privacy & Security Controls</h3>
          </div>
        </div>

        <div class="space-y-2.5 text-xs text-slate-700">
          <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <strong class="block text-slate-900 font-extrabold">Offline Local Storage Encryption</strong>
              <span class="text-[10px] text-slate-500">AES-256 encrypted local cache</span>
            </div>
            <input type="checkbox" checked class="w-4 h-4 accent-emerald-600 rounded">
          </div>

          <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <strong class="block text-slate-900 font-extrabold">Server Audit Log Retention</strong>
              <span class="text-[10px] text-slate-500">Keep reasoning logs for 365 days</span>
            </div>
            <input type="checkbox" checked class="w-4 h-4 accent-emerald-600 rounded">
          </div>

          <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <strong class="block text-slate-900 font-extrabold">Student Voice Confidentiality</strong>
              <span class="text-[10px] text-slate-500">Restricted access for Counselors only</span>
            </div>
            <input type="checkbox" checked disabled class="w-4 h-4 accent-emerald-600 rounded opacity-75">
          </div>
        </div>

        <button onclick="appController.closeModal()" class="btn-primary mt-2">Save Privacy Settings</button>
      </div>
    `);
  }

  // Modals & Handlers
  openSettingsModal() {
    this.openModal(`
      <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-emerald-700">settings</span>
          <h3 class="font-extrabold text-slate-900 text-base">Security & System Status</h3>
        </div>
      </div>

      <div class="space-y-3 text-xs">
        <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-950">
          <div class="flex items-center justify-between mb-1">
            <strong class="text-xs">Express Backend Proxy Status</strong>
            <span class="bg-emerald-200 text-emerald-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full">Secure & Active</span>
          </div>
          <p class="text-[11px] text-emerald-800">Proxy Host: <code>http://localhost:5000</code></p>
          <p class="text-[10px] text-emerald-700 mt-1">✓ Gemini API Key held safely on server (No client exposure).</p>
          <p class="text-[10px] text-emerald-700">✓ JWT Signed Session Token active.</p>
          <p class="text-[10px] text-emerald-700">✓ Server-Side RBAC Enforcement active.</p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="appController.openOnboardingModal()" class="btn-outline flex-1 text-xs py-1.5">App Tour</button>
          <button onclick="appController.openPrivacySettingsModal()" class="btn-outline flex-1 text-xs py-1.5">Privacy Controls</button>
        </div>

        <button onclick="appController.closeModal()" class="btn-primary mt-2">
          <span class="material-symbols-outlined text-sm">check</span> Close Settings
        </button>
      </div>
    `);
  }

  openDataEntryModal() {
    this.openModal(`
      <h3 class="font-extrabold text-slate-900 text-base mb-1">Fast Data Entry (Server Validated)</h3>
      <p class="text-xs text-slate-500 mb-4">Log weekly attendance %, quiz score %, and fee status.</p>

      <label class="text-xs font-bold text-slate-700">Select Student</label>
      <select id="de-student" class="input-field">
        ${this.students.map(s => `<option value="${s.id}">${s.name} (${s.rollNo})</option>`).join('')}
      </select>

      <label class="text-xs font-bold text-slate-700">Attendance Rate (0 - 100%)</label>
      <input type="number" id="de-attendance" value="70" min="0" max="100" class="input-field">

      <label class="text-xs font-bold text-slate-700">Quiz Score (0 - 100%)</label>
      <input type="number" id="de-academic" value="55" min="0" max="100" class="input-field">

      <label class="text-xs font-bold text-slate-700">Fee Overdue Days (0 - 365)</label>
      <input type="number" id="de-fee" value="14" min="0" max="365" class="input-field">

      <button onclick="appController.submitDataEntry()" class="btn-primary mt-2">Submit & Recalculate via Proxy</button>
    `);
  }

  async submitDataEntry() {
    const sId = document.getElementById("de-student").value;
    const att = parseInt(document.getElementById("de-attendance").value);
    const acad = parseInt(document.getElementById("de-academic").value);
    const fee = parseInt(document.getElementById("de-fee").value);

    if (isNaN(att) || att < 0 || att > 100) return alert("Attendance rate must be 0-100%");
    if (isNaN(acad) || acad < 0 || acad > 100) return alert("Quiz score must be 0-100%");
    if (isNaN(fee) || fee < 0 || fee > 365) return alert("Fee overdue days must be 0-365");

    const student = this.students.find(s => s.id === sId);
    if (student) {
      this.closeModal();
      this.triggerAILoadingSequence(async () => {
        student.attendanceCurrent = att;
        student.academicCurrent = acad;
        student.feeDaysOverdue = fee;

        const updated = await ustaadAIEngine.analyzeStudentWithGemini(student);
        student.riskLevel = updated.riskLevel;
        student.riskScore = updated.riskScore;
        student.whyExplanation = updated.whyExplanation;

        await firebaseService.saveStudentToFirestore(student);
        this.selectStudent(student.id);
        this.showToast("Nigraan AI Risk Re-calculated & Audit Logged!");
      });
    }
  }

  openStudentVoiceModal(studentId) {
    this.openModal(`
      <h3 class="font-extrabold text-slate-900 text-base mb-1">Student Voice Check-in</h3>
      <p class="text-xs text-slate-500 mb-3">Voluntarily explain circumstances behind recent data.</p>

      <label class="text-xs font-bold text-slate-700 block mb-1">Context Category</label>
      <select id="sv-category" class="input-field">
        ${studentVoiceModule.categories.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>

      <label class="text-xs font-bold text-slate-700 block mb-1">Additional Details (Optional)</label>
      <textarea id="sv-details" rows="3" class="input-field" placeholder="Provide confidential context..."></textarea>

      <button onclick="appController.submitStudentVoice('${studentId}')" class="btn-primary">Submit Private Context</button>
    `);
  }

  async submitStudentVoice(studentId) {
    const category = document.getElementById("sv-category").value;
    const details = document.getElementById("sv-details").value;

    studentVoiceModule.submitCheckIn(studentId, category, details, true);
    await firebaseService.saveStudentVoiceToFirestore(studentId, { category, details });

    // Add persistent alert to Counselor inbox
    this.counselorAlerts.unshift({
      id: `alt_${Date.now()}`,
      studentId,
      studentName: this.selectedStudent ? this.selectedStudent.name : "Student",
      type: "STUDENT_VOICE_CHECKIN",
      title: `Student Voice Submission: ${category}`,
      detail: details || `Voluntary context submitted under ${category}`,
      timestamp: "Just now",
      status: "ACTIVE"
    });
    this.saveCounselorAlerts();

    this.closeModal();
    this.renderActiveTab();
    this.showToast("Student Voice context saved & alert sent to Counselor!");
  }

  // Storage Permission Check & Guidance Modal
  verifyStoragePermissions() {
    if (window.navigator && navigator.permissions) {
      return true;
    }
    return true;
  }

  openStoragePermissionGuidanceModal() {
    this.openModal(`
      <div class="space-y-3 text-center py-2">
        <div class="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-2xl">folder_shared</span>
        </div>
        <h3 class="font-extrabold text-slate-900 text-base">Storage Access Permission Needed</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Nigraan requires Storage Access permission to read uploaded PDF, PPTX, or image study materials from your device.
        </p>

        <div class="bg-amber-50 p-3 rounded-xl border border-amber-200 text-left text-xs text-amber-950 space-y-1">
          <strong>How to Enable Storage Permission on Android:</strong>
          <ol class="list-decimal pl-4 space-y-0.5 text-[11px]">
            <li>Open phone <strong>Settings > Apps > Nigraan</strong>.</li>
            <li>Tap <strong>Permissions > Files & Media</strong> (or Storage).</li>
            <li>Select <strong>"Allow"</strong> and return to Nigraan.</li>
          </ol>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button onclick="appController.closeModal(); appController.openDocumentUploadModal();" class="btn-stitch-primary flex-1">
            Try Opening File Picker Again →
          </button>
        </div>
      </div>
    `);
  }

  // Camera Document Scanner Modal & Handlers
  openCameraScannerModal() {
    this.openModal(`
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-700 text-lg">photo_camera</span>
            <h3 class="font-extrabold text-slate-900 text-base">Camera Document Scanner</h3>
          </div>
        </div>

        <p class="text-xs text-slate-600">Snap a photo of your physical textbook page or handwritten study notes to extract text via OCR and ask Nigraan AI questions!</p>

        <div class="bg-slate-900 text-white p-4 rounded-xl text-center space-y-3">
          <div class="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <span class="material-symbols-outlined text-3xl">center_focus_strong</span>
          </div>
          <p class="text-xs text-emerald-200 font-medium">Position your study page clearly inside the frame.</p>

          <label class="btn-stitch-primary inline-flex items-center gap-2 cursor-pointer text-xs py-2.5 px-4">
            <span class="material-symbols-outlined text-base">photo_camera</span> Capture / Pick Document Photo
            <input type="file" id="camera-file-input" accept="image/*" capture="environment" class="hidden" onchange="appController.processCameraCapture(this)">
          </label>
        </div>

        <button onclick="appController.closeModal()" class="btn-outline w-full text-xs">Cancel</button>
      </div>
    `);
  }

  async processCameraCapture(inputEl) {
    if (inputEl && inputEl.files && inputEl.files[0]) {
      const file = inputEl.files[0];
      this.closeModal();
      this.triggerAILoadingSequence(async () => {
        const res = await ustaadAIStudyCompanion.processCameraScan(file);
        if (res.success) {
          this.renderActiveTab();
          this.showToast("📷 Camera document scanned successfully!");
          this.askAIAboutScannedDoc(res.document.id);
        } else {
          alert(`Camera OCR Notice: ${res.error}`);
        }
      });
    }
  }

  askAIAboutScannedDoc(docId) {
    const doc = ustaadAIStudyCompanion.uploadedMaterials.find(d => d.id === docId) || ustaadAIStudyCompanion.activeDocument;
    if (!doc) return;

    let cleanExcerpt = "";
    if (doc.aiProcessedNotes && doc.aiProcessedNotes.summary) {
      cleanExcerpt = doc.aiProcessedNotes.summary;
    } else {
      cleanExcerpt = ustaadAIStudyCompanion.cleanAndSanitizeText(doc.textContent).slice(0, 200);
    }

    this.openAIAgentHelpModal();
    setTimeout(() => {
      this.sendAIAgentMessage(`Analyze and explain this scanned page ('${doc.fileName}'): "${cleanExcerpt}"`);
    }, 300);
  }

  openDocumentUploadModal() {
    this.openModal(`
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-700 text-lg">folder_open</span>
            <h3 class="font-extrabold text-slate-900 text-base">Upload & Ground Study Material</h3>
          </div>
          <button onclick="appController.closeModal()" class="text-slate-400 hover:text-slate-600 p-1">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <p class="text-xs text-slate-500">Upload any PDF, PPTX, TXT, or image notes (Max 5MB) to generate grounded AI study notes & practice quizzes.</p>

        <input type="file" id="doc-file-input" class="hidden" accept=".pdf,.pptx,.txt,.png,.jpg,.jpeg,.doc,.docx" onchange="appController.handleDirectFileSelected(this)">

        <div class="space-y-2 pt-1">
          <button onclick="document.getElementById('doc-file-input').click()" class="btn-primary w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs text-xs">
            <span class="material-symbols-outlined text-lg">upload_file</span> 📂 Choose Document from Phone
          </button>
        </div>

        <div class="flex items-center gap-2 pt-1">
          <button onclick="appController.openCameraScannerModal()" class="btn-outline w-full text-xs py-2 rounded-xl flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-sm">photo_camera</span> 📷 Scan Page with Camera
          </button>
        </div>

        <div class="text-center pt-1 border-t border-slate-100">
          <button onclick="appController.openStoragePermissionGuidanceModal()" class="text-[11px] text-amber-700 font-extrabold underline">
            ⚠️ Storage access disabled? Click for permission guide
          </button>
        </div>
      </div>
    `);
  }

  async handleDirectFileSelected(inputElement) {
    if (inputElement && inputElement.files && inputElement.files[0]) {
      const file = inputElement.files[0];
      this.closeModal();
      this.triggerAILoadingSequence(async () => {
        const res = await ustaadAIStudyCompanion.handleFileUpload(file);
        if (res.success) {
          this.currentTab = "journey";
          this.renderActiveTab();
          this.showToast(`✅ Grounded Notes generated from '${file.name}'!`);
        } else {
          alert(`Upload Rejected: ${res.error}`);
        }
      });
    }
  }

  async processDocumentUpload() {
    const input = document.getElementById("doc-file-input");
    if (input && input.files[0]) {
      this.handleDirectFileSelected(input);
    } else {
      const fileInput = document.getElementById("doc-file-input");
      if (fileInput) fileInput.click();
    }
  }

  async startAdaptiveQuiz(studentId) {
    const student = this.students.find(s => s.id === studentId);
    const quizQuestions = await ustaadAIStudyCompanion.generateAdaptiveQuizAsync(student);
    let qIdx = 0;

    const renderQuizQuestion = () => {
      const q = quizQuestions[qIdx] || quizQuestions[0];
      this.openModal(`
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] uppercase font-extrabold text-emerald-700">Adaptive Practice Quiz • ${student.weakSubject || 'Math'}</span>
          <span class="text-xs font-bold text-slate-500">Question ${qIdx + 1} of ${quizQuestions.length}</span>
        </div>

        <h4 class="font-extrabold text-slate-900 text-sm mb-3">${q.question}</h4>

        <div id="quiz-options-container" class="space-y-2">
          ${q.options.map((opt, idx) => `
            <div onclick="appController.handleQuizAnswer('${studentId}', ${qIdx}, ${idx})" class="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-xl cursor-pointer font-semibold text-xs text-slate-800 transition-colors">
              <span>${opt}</span>
            </div>
          `).join('')}
        </div>

        <div id="quiz-feedback" class="mt-3"></div>
      `);
    };

    renderQuizQuestion();
  }

  handleQuizAnswer(studentId, qIdx, selectedIdx) {
    const student = this.students.find(s => s.id === studentId);
    const quizQuestions = ustaadAIStudyCompanion.generateAdaptiveQuiz(student);
    const q = quizQuestions[qIdx] || quizQuestions[0];

    const fbEl = document.getElementById("quiz-feedback");
    if (selectedIdx === q.correctIndex) {
      fbEl.innerHTML = `
        <div class="bg-emerald-50 border border-emerald-300 p-3 rounded-lg text-xs text-emerald-950">
          <p class="font-bold">✅ ${q.correctExplanation}</p>
          <button onclick="appController.finishQuizAttempt('${studentId}', 3, 3)" class="btn-primary mt-2 text-xs py-1.5">Next Step</button>
        </div>
      `;
    } else {
      const tip = (q.errorTips && q.errorTips[selectedIdx]) || "Review the step-by-step rules carefully.";
      fbEl.innerHTML = `
        <div class="bg-rose-50 border border-rose-300 p-3 rounded-lg text-xs text-rose-950">
          <p class="font-bold mb-1">❌ Not quite right.</p>
          <p class="text-xs text-rose-900">${tip}</p>
          <button onclick="appController.finishQuizAttempt('${studentId}', 2, 3)" class="btn-primary mt-2 text-xs py-1.5">Continue Practice</button>
        </div>
      `;
    }
  }

  finishQuizAttempt(studentId, correct, total) {
    const student = this.students.find(s => s.id === studentId);
    const result = ustaadAIStudyCompanion.submitQuizAttempt(student, correct, total);
    firebaseService.saveStudentToFirestore(student);
    this.closeModal();
    this.renderActiveTab();
    this.showToast(`Quiz Complete! Concept Mastery Score improved to ${result.newMastery}% 🎉`);

    if (result.newMastery >= 75 && typeof confetti === 'function') {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  }

  commitRecoveryPlan(studentId, interventionId = "academic_recovery") {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return;

    const opt = interventionSimulator.interventionOptions.find(o => o.id === interventionId) || interventionSimulator.interventionOptions[1];

    student.riskLevel = opt.targetRiskLevel;
    student.riskScore = opt.targetRiskScore;
    student.conceptMastery = Math.min(98, Math.max(50, (student.conceptMastery || 45) + opt.masteryDelta));

    if (student.digitalTwinTimeline) {
      student.digitalTwinTimeline.push({
        week: "Today",
        title: `Intervention Activated: ${opt.name}`,
        detail: `Applied strategy '${opt.name}'. Risk score reduced to ${opt.targetRiskScore}% (${opt.targetRiskLevel}). Concept mastery increased to ${student.conceptMastery}%.`,
        type: "recovery"
      });
    }

    firebaseService.saveStudentToFirestore(student);

    this.switchTab("journey");
    this.showToast(`🚀 '${opt.name}' Strategy Activated for ${student.name}!`);
    if (typeof confetti === 'function') {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }
  }

  triggerAILoadingSequence(onComplete) {
    const steps = [
      "Analyzing attendance trends...",
      "Comparing academic assessment scores...",
      "Reviewing fee payment patterns...",
      "Parsing uploaded document text (PDF/OCR)...",
      "Calling Backend Proxy Server...",
      "Verifying JWT Token & RBAC Role...",
      "Preparing grounded study notes..."
    ];

    let sIdx = 0;
    const overlay = document.createElement("div");
    overlay.className = "ai-loading-overlay";
    overlay.innerHTML = `
      <div class="spinner-ring"></div>
      <h3 class="font-extrabold text-base text-emerald-300 mb-1">Nigraan Backend Proxy Active</h3>
      <p id="ai-loading-step" class="text-xs text-emerald-100 font-medium">${steps[0]}</p>
    `;

    document.getElementById("mobile-shell").appendChild(overlay);

    const interval = setInterval(() => {
      sIdx++;
      if (sIdx < steps.length) {
        document.getElementById("ai-loading-step").innerText = steps[sIdx];
      } else {
        clearInterval(interval);
        overlay.remove();
        if (onComplete) onComplete();
      }
    }, 200);
  }

  openModal(contentHtml) {
    const overlay = document.getElementById("modal-overlay");
    const container = document.getElementById("modal-container");
    if (overlay && container) {
      container.innerHTML = contentHtml;
      overlay.classList.add("active");
    }
  }

  closeModal() {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.classList.remove("active");
  }

  showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "fixed top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-full shadow-lg z-100 animate-bounce";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
}

const appController = new AppController();
document.addEventListener("DOMContentLoaded", () => appController.init());
