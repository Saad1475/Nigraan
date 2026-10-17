/* Nigraan - AI Recovery Plan & Before -> After Impact Visualizer */

class RecoveryPlanModule {
  // Toggle task completion in 7-day / 14-day plan
  toggleTask(studentId, taskId) {
    const student = INITIAL_STUDENTS_DATA.find(s => s.id === studentId);
    if (!student || !student.recoveryPlan) return null;

    const task = student.recoveryPlan.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
    }

    // Check progress
    const completedCount = student.recoveryPlan.tasks.filter(t => t.completed).length;
    const totalCount = student.recoveryPlan.tasks.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // If 100% completed, trigger "Student Back on Track" state!
    if (pct === 100 && student.riskLevel !== "Low") {
      student.riskLevel = "Low";
      student.riskScore = 14;
      student.responsibleLabel = "Student Back on Track";
      student.conceptMastery = 88;
      student.whyExplanation = [
        "All academic recovery plan milestones successfully completed.",
        "Concept mastery in Quadratic Equations restored to 88%.",
        "Early warning resolved. Student is back on track!"
      ];

      if (student.digitalTwinTimeline) {
        student.digitalTwinTimeline.push({
          week: "Today",
          title: "Recovery Plan Completed",
          detail: "All 5 milestones achieved. Risk status downgraded to Low (On Track).",
          type: "recovery"
        });
      }
    }

    return { student, completedCount, totalCount, pct };
  }

  // Render 7-Day / 14-Day Academic Recovery Plan Checklist with Interactive Checkboxes
  renderRecoveryPlanChecklist(student) {
    if (!student || !student.recoveryPlan || !student.recoveryPlan.tasks) {
      return '';
    }

    const tasks = student.recoveryPlan.tasks;
    const completedCount = tasks.filter(t => t.completed).length;
    const pct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    const checklistHtml = tasks.map(t => `
      <div onclick="appController.handleTaskToggle('${student.id}', ${t.id})" class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-emerald-50/50 transition-colors shadow-2xs">
        <div class="flex items-center gap-3">
          <input type="checkbox" ${t.completed ? 'checked' : ''} onclick="event.stopPropagation(); appController.handleTaskToggle('${student.id}', ${t.id})" class="w-4 h-4 accent-emerald-600 rounded cursor-pointer">
          <span class="text-xs font-bold ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}">${t.title}</span>
        </div>
        <span class="text-[10px] font-extrabold ${t.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'} px-2 py-0.5 rounded-full">
          ${t.completed ? 'DONE' : 'PENDING'}
        </span>
      </div>
    `).join('');

    return `
      <div class="stitch-card bg-white border-2 border-emerald-500/30">
        <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div>
            <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 block">7-DAY RECOVERY PLAN</span>
            <h3 class="font-extrabold text-slate-900 text-sm">Academic Recovery Checklist</h3>
          </div>
          <div class="text-right">
            <span class="text-xs font-black text-emerald-800">${pct}% Complete</span>
            <span class="text-[10px] text-slate-400 block">${completedCount}/${tasks.length} Milestones</span>
          </div>
        </div>

        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div class="h-full bg-emerald-500 transition-all duration-500" style="width: ${pct}%"></div>
        </div>

        <div class="space-y-2">
          ${checklistHtml}
        </div>
      </div>
    `;
  }

  // Render Before -> Intervention -> After Impact Visualizer Card
  renderBeforeAfterImpactCard(student) {
    const isRecovered = student.riskLevel === "Low" && student.conceptMastery >= 75;
    const initialRiskScore = 86;
    const currentRiskScore = student.riskScore;

    return `
      <div class="stitch-card bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl"></div>

        <div class="flex items-center justify-between mb-4 border-b border-emerald-800/60 pb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-400">compare_arrows</span>
            <h3 class="font-bold text-sm tracking-wide">Before → Intervention → After Impact</h3>
          </div>
          <span class="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${isRecovered ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-amber-500/20 text-amber-300'}">
            ${isRecovered ? '🎉 Student Back on Track' : '⚡ Recovery in Progress'}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <!-- BEFORE STATE -->
          <div class="bg-rose-950/40 border border-rose-800/50 p-3 rounded-xl text-center">
            <span class="text-[10px] font-bold uppercase tracking-widest text-rose-400">INITIAL STATE</span>
            <div class="text-2xl font-black text-rose-300 mt-1">High Risk</div>
            <div class="text-xs text-rose-200/80 font-medium">Risk Score: ${initialRiskScore}%</div>
            <div class="mt-2 text-[11px] text-rose-200/70 border-t border-rose-900/60 pt-1">
              • Att: 58% (Declining)<br>
              • Math Quiz: 48%<br>
              • Mastery: 45%
            </div>
          </div>

          <!-- AFTER STATE -->
          <div class="bg-emerald-950/50 border border-emerald-700/60 p-3 rounded-xl text-center">
            <span class="text-[10px] font-bold uppercase tracking-widest text-emerald-400">CURRENT / AFTER STATE</span>
            <div class="text-2xl font-black ${isRecovered ? 'text-emerald-300' : 'text-amber-300'} mt-1">
              ${student.riskLevel} Risk
            </div>
            <div class="text-xs text-emerald-200/80 font-medium">Risk Score: ${currentRiskScore}%</div>
            <div class="mt-2 text-[11px] text-emerald-200/80 border-t border-emerald-900/60 pt-1">
              • Att: Stabilizing<br>
              • Math Quiz: 85%<br>
              • Mastery: <span class="font-bold text-emerald-400">${student.conceptMastery}%</span>
            </div>
          </div>
        </div>

        <!-- Intervention Applied Banner -->
        <div class="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-400 text-sm">auto_awesome</span>
            <span class="text-slate-300">Applied: <strong>Nigraan AI Study Companion + Teacher Check-in</strong></span>
          </div>
          <span class="text-emerald-400 font-bold">-${initialRiskScore - currentRiskScore} pts</span>
        </div>
      </div>
    `;
  }
}

const recoveryPlanModule = new RecoveryPlanModule();
