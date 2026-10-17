/* Nigraan - What-If Intervention Simulator & Playground Module */

class InterventionSimulator {
  constructor() {
    this.selectedInterventionId = "academic_recovery";
    this.interventionOptions = [
      {
        id: "teacher_checkin",
        name: "Teacher Check-in",
        badge: "Low Effort",
        icon: "chat_bubble_outline",
        description: "A brief, informal conversation to gauge well-being and immediate academic blockers.",
        predictedImpact: "+15% engagement",
        simulatedRiskDrop: 15,
        masteryDelta: 15,
        targetRiskScore: 52,
        targetRiskLevel: "Medium",
        targetMastery: 65
      },
      {
        id: "academic_recovery",
        name: "Personalized Academic Recovery Plan",
        badge: "High Impact",
        icon: "menu_book",
        description: "Structured 7-day learning modules targeting pinpointed concept gaps in core subjects.",
        predictedImpact: "+35% concept mastery",
        simulatedRiskDrop: 32,
        masteryDelta: 35,
        targetRiskScore: 14,
        targetRiskLevel: "Low",
        targetMastery: 85
      },
      {
        id: "counselor_meeting",
        name: "Counselor Support Session",
        badge: "Medium Effort",
        icon: "psychology",
        description: "Confidential session with school counselor to address emotional or home stress.",
        predictedImpact: "+20% emotional stability",
        simulatedRiskDrop: 25,
        masteryDelta: 20,
        targetRiskScore: 28,
        targetRiskLevel: "Low",
        targetMastery: 72
      },
      {
        id: "parent_notification",
        name: "Supportive Parent Notification",
        badge: "Home Support",
        icon: "sms",
        description: "Send empathetic SMS/Email update to parent highlighting home support options.",
        predictedImpact: "+12% home cooperation",
        simulatedRiskDrop: 20,
        masteryDelta: 10,
        targetRiskScore: 40,
        targetRiskLevel: "Medium",
        targetMastery: 58
      }
    ];
  }

  selectIntervention(interventionId) {
    this.selectedInterventionId = interventionId;
    if (typeof appController !== 'undefined') {
      appController.renderActiveTab();
    }
  }

  getSelectedIntervention() {
    return this.interventionOptions.find(o => o.id === this.selectedInterventionId) || this.interventionOptions[1];
  }

  renderParentNotificationDraftModal(student) {
    const defaultSms = `Assalam-o-Alaikum! Greetings from Nigraan Support at Ilm ki Roshni School. We would like to share a supportive update regarding ${student.name}'s progress in ${student.weakSubject || 'Class 10'}. We have arranged free personalized practice modules to help ${student.name} excel. Please reply if you have any questions.`;
    const defaultEmail = `Subject: Supportive Update regarding ${student.name}'s Academic Progress\n\nDear Parent/Guardian,\n\nWe hope this message finds you well. As part of our Nigraan Early Dropout Intervention platform ("Every student, seen before they're lost"), we are proactively partnering with families to support student wellbeing and conceptual growth.\n\nStudent: ${student.name} (${student.rollNo})\nGrade: ${student.grade}\nCurrent Focus Area: ${student.weakConcept || 'Mathematics'}\n\nRecommended Support Action: Guided 7-Day Academic Practice & Teacher Check-in.\n\nPlease feel free to reach out to Counselor Fatima at admin@nigraan.edu.pk or call school office.\n\nWarm regards,\nNigraan Educator Team`;

    return `
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-700">sms</span>
            <h3 class="font-extrabold text-slate-900 text-sm">Draft Supportive Parent Notification</h3>
          </div>
        </div>

        <p class="text-xs text-slate-600">Review and edit the pre-filled supportive communication templates before sending:</p>

        <label class="text-xs font-bold text-slate-700 block">SMS Template (Urdu/English)</label>
        <textarea id="draft-parent-sms" rows="3" class="input-field text-xs">${defaultSms}</textarea>

        <label class="text-xs font-bold text-slate-700 block">Email Template (Formal)</label>
        <textarea id="draft-parent-email" rows="5" class="input-field text-xs font-mono">${defaultEmail}</textarea>

        <div class="flex items-center gap-2 pt-2">
          <button onclick="appController.sendParentNotification('${student.id}')" class="btn-stitch-primary flex-1">
            <span class="material-symbols-outlined text-sm">send</span> Dispatch Parent Notification
          </button>
          <button onclick="appController.closeModal()" class="btn-outline">Cancel</button>
        </div>
      </div>
    `;
  }

  // Render Intervention Playground Screen
  renderInterventionPlayground(student) {
    const selected = this.getSelectedIntervention();

    const optsHtml = this.interventionOptions.map(o => {
      const isSelected = o.id === this.selectedInterventionId;
      return `
        <div onclick="interventionSimulator.selectIntervention('${o.id}')" class="bg-white border-2 ${isSelected ? 'border-emerald-600 ring-2 ring-emerald-500 bg-emerald-50/30' : 'border-slate-200'} p-4 rounded-2xl min-w-[260px] flex-1 space-y-2 relative shadow-2xs cursor-pointer transition-all">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-full ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'} flex items-center justify-center font-bold">
              <span class="material-symbols-outlined">${o.icon}</span>
            </div>
            <span class="text-[10px] font-extrabold ${isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'} px-2.5 py-1 rounded-full uppercase tracking-wider">${o.badge}</span>
          </div>
          <h4 class="font-extrabold text-slate-900 text-sm">${o.name}</h4>
          <p class="text-xs text-slate-600 leading-snug">${o.description}</p>
          
          <div class="bg-slate-100/80 p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-900 mt-2">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">trending_up</span> ${o.predictedImpact}</span>
            <span class="text-rose-700">-${o.simulatedRiskDrop} pts risk</span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="space-y-4">
        <!-- Top Centered Header -->
        <div class="text-center space-y-1">
          <img src="${student.avatar}" alt="${student.name}" class="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 mx-auto shadow-md">
          <h2 class="font-extrabold text-slate-900 text-lg">Intervention Playground</h2>
          <p class="text-xs text-slate-500 font-medium">Select intervention strategy for ${student.name}</p>
        </div>

        <!-- Simulator Options Carousel -->
        <div>
          <div class="flex items-center justify-between text-xs font-extrabold text-slate-800 mb-2">
            <span>Choose Strategy (${selected.name})</span>
            <span class="text-[11px] text-slate-400 font-semibold">Tap to select</span>
          </div>
          <div class="flex gap-3 overflow-x-auto pb-2">
            ${optsHtml}
          </div>
        </div>

        <!-- 'What-If' Trajectory Card with Selected Intervention Projection -->
        <div class="stitch-card bg-white border-2 border-emerald-600/40">
          <div class="flex items-center justify-between mb-2">
            <div>
              <span class="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">SIMULATED PROJECTED OUTCOME</span>
              <h3 class="font-extrabold text-slate-900 text-base">${selected.name}</h3>
            </div>
            <span class="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">arrow_downward</span> -${selected.simulatedRiskDrop} pts Risk
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 my-3 text-center text-xs">
            <div class="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <span class="text-[9px] uppercase font-extrabold text-slate-500 block">TARGET RISK</span>
              <strong class="text-sm font-black text-slate-900">${selected.targetRiskLevel} (${selected.targetRiskScore}%)</strong>
            </div>
            <div class="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
              <span class="text-[9px] uppercase font-extrabold text-emerald-800 block">CONCEPT MASTERY</span>
              <strong class="text-sm font-black text-emerald-900">${selected.targetMastery}%</strong>
            </div>
            <div class="bg-indigo-50 border border-indigo-200 p-2.5 rounded-xl">
              <span class="text-[9px] uppercase font-extrabold text-indigo-800 block">MASTERY GAIN</span>
              <strong class="text-sm font-black text-indigo-900">+${selected.masteryDelta}%</strong>
            </div>
          </div>

          <!-- Trajectory Graph Representation -->
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 relative my-2">
            <div class="flex justify-between items-end h-20 text-[10px] font-bold text-slate-400 pt-2 border-b border-slate-200">
              <span>Baseline (${student.riskScore}%)</span>
              <span>Wk 1 (-${Math.round(selected.simulatedRiskDrop * 0.4)}pts)</span>
              <span>Wk 2 (-${Math.round(selected.simulatedRiskDrop * 0.7)}pts)</span>
              <span class="text-emerald-700 font-extrabold flex items-center gap-1">Projected (${selected.targetRiskScore}%) <span class="w-2 h-2 rounded-full bg-emerald-600"></span></span>
            </div>
          </div>

          <p class="text-[11px] text-slate-500 text-center italic">Specific outcome derived from selected strategy '${selected.name}'.</p>
        </div>

        <!-- Bottom Sticky Action Button -->
        <div class="sticky-bottom-action">
          ${selected.id === 'parent_notification' ? `
            <button onclick="appController.openParentNotificationDraftModal('${student.id}')" class="btn-stitch-primary">
              <span class="material-symbols-outlined text-sm">edit_note</span> Edit & Dispatch Parent SMS/Email →
            </button>
          ` : `
            <button onclick="appController.commitRecoveryPlan('${student.id}', '${selected.id}')" class="btn-stitch-dark">
              <span class="material-symbols-outlined text-sm">rocket_launch</span> Activate '${selected.name}' Strategy
            </button>
          `}
        </div>
      </div>
    `;
  }
}

const interventionSimulator = new InterventionSimulator();
