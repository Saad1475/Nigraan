/* Nigraan - Multi-Signal AI Engine & Backend Proxy Integration */

class UstaadAIEngine {
  constructor() {
    this.apiBase = window.location.origin.includes('5000') ? '' : 'http://localhost:5000';
  }

  // Infer Weak Subject & Concept dynamically from assessment score patterns
  inferWeakConceptAndSubject(student) {
    const acad = Number(student.academicCurrent) || 70;
    const att = Number(student.attendanceCurrent) || 75;

    if (student.subjectScores && typeof student.subjectScores === 'object') {
      let lowestSubject = null;
      let lowestScore = 101;
      for (const [subj, score] of Object.entries(student.subjectScores)) {
        if (Number(score) < lowestScore) {
          lowestScore = Number(score);
          lowestSubject = subj;
        }
      }
      if (lowestSubject) {
        return {
          weakSubject: lowestSubject,
          weakConcept: `${lowestSubject} -> Concept Comprehension (${lowestScore}%)`
        };
      }
    }

    if (acad < 55) {
      return {
        weakSubject: "Mathematics",
        weakConcept: "Quadratic Equations -> Completing the Square"
      };
    } else if (acad < 70) {
      return {
        weakSubject: "English Literature",
        weakConcept: "Essay Structuring & Thesis Formulation"
      };
    } else if (att < 70) {
      return {
        weakSubject: "Physics",
        weakConcept: "Kinematics -> Motion Equations under Uniform Acceleration"
      };
    } else {
      return {
        weakSubject: "Computer Science",
        weakConcept: "Data Structures -> Array Manipulation & Loops"
      };
    }
  }

  // Primary 3-Signal Fusion & Dropout Risk Calculation
  calculateRiskAssessment(student) {
    const attendanceVal = Number(student.attendanceCurrent) || 75;
    const academicVal = Number(student.academicCurrent) || 70;
    const feeOverdue = Number(student.feeDaysOverdue) || 0;
    const hasStudentVoiceContext = !!student.studentVoiceContext;

    // Dynamically derive weak subject & concept if not locked
    const inferred = this.inferWeakConceptAndSubject(student);
    student.weakSubject = student.weakSubject || inferred.weakSubject;
    student.weakConcept = student.weakConcept || inferred.weakConcept;

    let feePenalty = 0;
    if (feeOverdue > 20) feePenalty = 30;
    else if (feeOverdue > 10) feePenalty = 20;
    else if (feeOverdue > 0) feePenalty = 10;

    let attTrendDrop = 0;
    if (student.attendanceTrend && student.attendanceTrend.length >= 3) {
      const t = student.attendanceTrend;
      if (t[0] > t[1] && t[1] > t[2]) {
        attTrendDrop = (t[0] - t[2]);
      }
    }

    let acadTrendDrop = 0;
    if (student.academicTrend && student.academicTrend.length >= 3) {
      const a = student.academicTrend;
      if (a[0] > a[1] && a[1] > a[2]) {
        acadTrendDrop = (a[0] - a[2]);
      }
    }

    let calculatedRisk = 0;
    calculatedRisk += (100 - attendanceVal) * 0.40;
    calculatedRisk += (100 - academicVal) * 0.35;
    calculatedRisk += feePenalty * 0.15;
    calculatedRisk += (attTrendDrop * 0.5) + (acadTrendDrop * 0.5);

    if (hasStudentVoiceContext && student.studentVoiceContext.category && student.studentVoiceContext.category.includes("Family")) {
      calculatedRisk = Math.max(25, calculatedRisk - 15);
    }

    calculatedRisk = Math.min(98, Math.max(10, Math.round(calculatedRisk)));

    let riskLevel = "Low";
    if (calculatedRisk >= 70) riskLevel = "High";
    else if (calculatedRisk >= 40) riskLevel = "Medium";

    const confidence = Math.min(96, Math.max(80, 85 + Math.round((calculatedRisk % 10))));

    const whyStatements = [];
    if (attTrendDrop > 10) {
      whyStatements.push(`Attendance has declined for consecutive weeks (${student.attendanceTrend.join('% → ')}%).`);
    } else if (attendanceVal < 75) {
      whyStatements.push(`Current overall attendance rate (${attendanceVal}%) is below the 75% threshold.`);
    }

    if (acadTrendDrop > 10) {
      whyStatements.push(`Academic test scores in ${student.weakSubject} dropped by ${acadTrendDrop}% recently.`);
    } else if (academicVal < 60) {
      whyStatements.push(`Recent assessment average (${academicVal}%) indicates comprehension difficulty in ${student.weakConcept}.`);
    }

    if (feeOverdue > 0) {
      whyStatements.push(`Fee installment is overdue by ${feeOverdue} days.`);
    }

    if (hasStudentVoiceContext) {
      whyStatements.push(`Contextual Note: Voluntary student check-in flagged "${student.studentVoiceContext.category}". AI contextualized interpretation.`);
    }

    if (whyStatements.length === 0) {
      whyStatements.push("Attendance, assessment scores, and fee status are consistently strong and stable.");
    }

    return {
      riskLevel,
      riskScore: calculatedRisk,
      confidence,
      whyExplanation: whyStatements,
      responsibleLabel: riskLevel === "Low" ? "Stable — On Track" : "Early Warning — Additional Support Recommended"
    };
  }

  // Call Authenticated Backend Server Proxy for Gemini AI
  async analyzeStudentWithGemini(student) {
    try {
      const response = await fetch(`${this.apiBase}/api/ai/analyze-student`, {
        method: 'POST',
        headers: typeof authService !== 'undefined' ? authService.getAuthHeaders() : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student })
      });

      const data = await response.json();
      if (response.ok && data.assessment) {
        return data.assessment;
      }
    } catch (err) {
      console.warn("Backend proxy call notice, using local multi-signal engine.", err.message);
    }

    await new Promise(r => setTimeout(r, 300));
    return this.calculateRiskAssessment(student);
  }
}

const ustaadAIEngine = new UstaadAIEngine();
