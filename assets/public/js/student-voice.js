/* Ustaad's Eye - Student Voice / "Behind the Numbers" Module */

class StudentVoiceModule {
  constructor() {
    this.categories = [
      "Family & Personal Responsibilities",
      "Financial Difficulties / Fee Issues",
      "Health & Medical Challenges",
      "Transportation & Commute Issues",
      "Academic Stress / Overwhelmed",
      "School Environment / Peer Challenges",
      "Prefer not to say"
    ];
  }

  // Record a voluntary Student Voice Check-in
  submitCheckIn(studentId, category, details, isConfidential = true) {
    const student = INITIAL_STUDENTS_DATA.find(s => s.id === studentId);
    if (!student) return null;

    if (category === "Prefer not to say") {
      student.studentVoiceContext = {
        category: "Prefer not to say",
        details: "Student opted for privacy.",
        date: "Just now",
        confidential: true
      };
    } else {
      student.studentVoiceContext = {
        category,
        details: details || "No additional text provided.",
        date: "Just now",
        confidential: isConfidential
      };
    }

    // Re-evaluate risk with the new context using AI Engine
    const updatedAssessment = ustaadAIEngine.calculateRiskAssessment(student);
    student.riskLevel = updatedAssessment.riskLevel;
    student.riskScore = updatedAssessment.riskScore;
    student.whyExplanation = updatedAssessment.whyExplanation;

    // Add node to Digital Student Progress Twin timeline
    if (student.digitalTwinTimeline) {
      student.digitalTwinTimeline.push({
        week: "Recent",
        title: "Student Voice Check-in Submitted",
        detail: `Voluntary Context added: ${category}. AI updated interpretation to supportive posture.`,
        type: "context"
      });
    }

    return student;
  }

  // Render Student Voice Card inside Student Profile / Counselor View
  renderStudentVoiceCard(student, userRole = "Teacher") {
    if (!student.studentVoiceContext) {
      return `
        <div class="ustaad-card border-dashed border-2 border-emerald-300 bg-emerald-50/50 p-4 rounded-xl text-center">
          <div class="flex justify-center mb-2">
            <span class="material-symbols-outlined text-emerald-700 text-3xl">record_voice_over</span>
          </div>
          <h4 class="font-bold text-emerald-900 text-sm mb-1">Student Voice / Behind the Numbers</h4>
          <p class="text-xs text-emerald-800 mb-3">No voluntary check-in filed yet. Students can privately share circumstances behind attendance or test fluctuations.</p>
          <button onclick="appController.openStudentVoiceModal('${student.id}')" class="btn-outline text-xs py-1.5 px-3">
            <span class="material-symbols-outlined text-sm">add_comment</span> Add Private Check-in
          </button>
        </div>
      `;
    }

    const context = student.studentVoiceContext;
    const isConfidential = context.confidential;
    const isTeacher = userRole === "Teacher";

    return `
      <div class="ustaad-card bg-emerald-50/80 border-l-4 border-emerald-600 p-4 rounded-xl">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-700">lock_reset</span>
            <h4 class="font-bold text-emerald-950 text-sm">Student Voice Context</h4>
          </div>
          <span class="text-xs bg-emerald-200 text-emerald-900 font-medium px-2 py-0.5 rounded-full">
            ${isConfidential ? 'Confidential' : 'Shared'}
          </span>
        </div>
        <p class="text-xs font-semibold text-emerald-900 mb-1">Category: ${context.category}</p>
        <p class="text-xs text-emerald-800 italic mb-2">"${isTeacher && isConfidential ? 'Private context recorded — AI adjusted risk interpretation to avoid false assumptions.' : context.details}"</p>
        <div class="flex items-center gap-1 text-[11px] text-emerald-700">
          <span class="material-symbols-outlined text-xs">schedule</span> Submitted ${context.date}
        </div>
      </div>
    `;
  }
}

const studentVoiceModule = new StudentVoiceModule();
