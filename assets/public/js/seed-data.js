/* Seed Data for Ustaad's Eye Demo */

var INITIAL_STUDENTS_DATA = [
  {
    id: "STU-101",
    name: "Zain Ahmed",
    rollNo: "CS-2026-014",
    grade: "Grade 10 - Science",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
    riskLevel: "High",
    riskScore: 86,
    confidence: 91,
    attendanceCurrent: 58,
    attendanceTrend: [88, 72, 58],
    academicCurrent: 48,
    academicTrend: [75, 58, 48],
    feeStatus: "Delayed (2 Unpaid)",
    feeDaysOverdue: 18,
    weakSubject: "Mathematics",
    weakConcept: "Quadratic Equations -> Completing the Square",
    conceptMastery: 45,
    studentVoiceContext: null,
    whyExplanation: [
      "Attendance has declined for 3 consecutive weeks (88% → 72% → 58%).",
      "Recent Mathematics quiz scores have fallen by 18% (75 → 48).",
      "Two fee installment payments overdue by 18 days."
    ],
    digitalTwinTimeline: [
      { week: "Week 1", title: "Baseline Attendance Drop", detail: "Attendance fell from 88% to 72%. No academic alerts yet.", type: "attendance" },
      { week: "Week 2", title: "Math Assessment Score Decline", detail: "Quiz score dropped from 75 to 58 in Quadratic Equations.", type: "academic" },
      { week: "Week 3", title: "Fee Payment Delay Recorded", detail: "Second fee installment missed (18 days overdue).", type: "fee" },
      { week: "Week 3 (Late)", title: "Early Warning Triggered", detail: "Multi-signal AI engine elevated risk level to High (86%).", type: "alert" }
    ],
    uploadedDocument: null,
    recoveryPlan: {
      active: true,
      durationDays: 7,
      currentDay: 2,
      tasks: [
        { id: 1, title: "Upload Chapter 4 PDF to Nigraan AI", completed: false },
        { id: 2, title: "Review AI Simplified Notes on Completing the Square", completed: false },
        { id: 3, title: "Complete Adaptive Practice Quiz (Score > 75%)", completed: false },
        { id: 4, title: "Private Teacher Check-in with Sir Raza", completed: false },
        { id: 5, title: "Submit Fee Installment Waiver Request", completed: false }
      ]
    },
    interventionHistory: []
  },
  {
    id: "STU-102",
    name: "Ayesha Khan",
    rollNo: "CS-2026-022",
    grade: "Grade 10 - General",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    riskLevel: "Medium",
    riskScore: 54,
    confidence: 85,
    attendanceCurrent: 65,
    attendanceTrend: [92, 80, 65],
    academicCurrent: 75,
    academicTrend: [78, 76, 75],
    feeStatus: "Paid",
    feeDaysOverdue: 0,
    weakSubject: "English Literature",
    weakConcept: "Essay Structuring & Thesis Formulation",
    conceptMastery: 62,
    studentVoiceContext: {
      category: "Family & Personal Responsibilities",
      details: "Caring for sick grandmother at home during morning hours. Requesting flexible morning assembly check-ins.",
      date: "2 days ago",
      confidential: true
    },
    whyExplanation: [
      "Attendance dropped to 65% over the past 3 weeks.",
      "Academic test performance remains stable at 75%.",
      "Fee payment is fully up to date.",
      "Context Note: Student Voice check-in filed regarding morning family care duties."
    ],
    digitalTwinTimeline: [
      { week: "Week 1", title: "Morning Attendance Missed", detail: "Missed 3 morning classes due to family duty.", type: "attendance" },
      { week: "Week 2", title: "Student Voice Check-in Submitted", detail: "Privately explained family care situation.", type: "context" },
      { week: "Week 3", title: "AI Re-evaluation", detail: "AI updated assessment to Family Duty Context — Support Recommended.", type: "alert" }
    ],
    uploadedDocument: null,
    recoveryPlan: {
      active: true,
      durationDays: 14,
      currentDay: 4,
      tasks: [
        { id: 1, title: "Morning Schedule Adaptation Request", completed: true },
        { id: 2, title: "Shared Digital Lecture Recording Access", completed: true },
        { id: 3, title: "Weekly Progress Review with Counselor", completed: false }
      ]
    },
    interventionHistory: [
      { date: "Yesterday", action: "Flexible Check-in Granted", by: "Counselor Fatima" }
    ]
  },
  {
    id: "STU-103",
    name: "Bilal Raza",
    rollNo: "CS-2026-009",
    grade: "Grade 10 - Computer Science",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    riskLevel: "Low",
    riskScore: 12,
    confidence: 95,
    attendanceCurrent: 96,
    attendanceTrend: [95, 96, 96],
    academicCurrent: 88,
    academicTrend: [85, 87, 88],
    feeStatus: "Paid",
    feeDaysOverdue: 0,
    weakSubject: "None",
    weakConcept: "Mastery Level High Across Subjects",
    conceptMastery: 92,
    studentVoiceContext: null,
    whyExplanation: [
      "Consistent high attendance (96%).",
      "Strong academic trajectory in Computer Science (88%).",
      "Fee payment prompt and complete."
    ],
    digitalTwinTimeline: [
      { week: "Week 1", title: "Top Quiz Performance", detail: "Scored 90% in Python Basics.", type: "academic" },
      { week: "Week 3", title: "Consistent Attendance", detail: "Maintained 96% class participation.", type: "attendance" }
    ],
    uploadedDocument: null,
    recoveryPlan: { active: false, tasks: [] },
    interventionHistory: []
  },
  {
    id: "STU-104",
    name: "Tariq Mahmood",
    rollNo: "CS-2026-031",
    grade: "Grade 10 - Pre-Engineering",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    riskLevel: "Medium",
    riskScore: 62,
    confidence: 88,
    attendanceCurrent: 92,
    attendanceTrend: [94, 93, 92],
    academicCurrent: 42,
    academicTrend: [78, 55, 42],
    feeStatus: "Paid",
    feeDaysOverdue: 0,
    weakSubject: "Physics",
    weakConcept: "Electromagnetism -> Faraday's Law & Lenz's Law",
    conceptMastery: 40,
    studentVoiceContext: {
      category: "Academic Stress / Difficulty",
      details: "Struggling to visualize magnetic flux concepts in Physics unit test.",
      date: "3 days ago",
      confidential: false
    },
    whyExplanation: [
      "Physics quiz performance declined sharply (78 → 55 → 42).",
      "Attendance is healthy at 92%.",
      "Fee payments are complete.",
      "Isolated academic weakness in Physics Electromagnetism."
    ],
    digitalTwinTimeline: [
      { week: "Week 1", title: "Electromagnetism Quiz", detail: "Scored 42% on Faraday's Law calculation.", type: "academic" },
      { week: "Week 2", title: "Weak Concept Flagged", detail: "Nigraan AI identified formula application gap.", type: "alert" }
    ],
    uploadedDocument: null,
    recoveryPlan: {
      active: true,
      durationDays: 7,
      currentDay: 1,
      tasks: [
        { id: 1, title: "Read Nigraan AI Physics Handout", completed: false },
        { id: 2, title: "Solve 5 Electromagnetism Practice MCQs", completed: false }
      ]
    },
    interventionHistory: []
  },
  {
    id: "STU-105",
    name: "Fatima Zahra",
    rollNo: "CS-2026-045",
    grade: "Grade 10 - Commerce",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
    riskLevel: "Medium",
    riskScore: 58,
    confidence: 89,
    attendanceCurrent: 90,
    attendanceTrend: [92, 91, 90],
    academicCurrent: 82,
    academicTrend: [80, 84, 82],
    feeStatus: "Delayed (2 Unpaid)",
    feeDaysOverdue: 24,
    weakSubject: "Financial Accounting",
    weakConcept: "Ledger Balancing",
    conceptMastery: 75,
    studentVoiceContext: {
      category: "Financial Challenges",
      details: "Family awaiting agricultural harvest payment before clearing tuition balance.",
      date: "1 week ago",
      confidential: true
    },
    whyExplanation: [
      "Fee payments delayed by 24 days across 2 billing cycles.",
      "Attendance remains strong at 90%.",
      "Academic performance is high at 82%.",
      "Financial stress flagged for Counselor assistance."
    ],
    digitalTwinTimeline: [
      { week: "Week 1", title: "Fee Notice Issued", detail: "Tuition installment pending.", type: "fee" },
      { week: "Week 2", title: "Counselor Assistance Tagged", detail: "Flagged for harvest extension program.", type: "context" }
    ],
    uploadedDocument: null,
    recoveryPlan: {
      active: true,
      durationDays: 14,
      currentDay: 5,
      tasks: [
        { id: 1, title: "Fee Payment Deadline Extension Granted", completed: true },
        { id: 2, title: "Counselor Financial Aid Review", completed: true }
      ]
    },
    interventionHistory: [
      { date: "3 days ago", action: "Fee Deferred 30 Days", by: "Admin Principal" }
    ]
  }
];

// Sample Chapter text for mock document parsing when user uploads PDF/notes
const MOCK_CHAPTER_MATH_TEXT = `
CHAPTER 4: QUADRATIC EQUATIONS
Section 4.3: Completing the Square Method

A quadratic equation is in the standard form: ax^2 + bx + c = 0 (where a ≠ 0).

Key Steps in Completing the Square:
1. Divide all terms by 'a' so the coefficient of x^2 becomes 1.
2. Rearrange the equation so the constant term 'c/a' is on the right-hand side: x^2 + (b/a)x = -c/a.
3. Take half of the coefficient of x, which is (b/2a), and square it: (b/2a)^2.
4. Add this squared term to BOTH sides of the equation.
5. Factor the left side as a perfect square: (x + b/2a)^2 = (b^2 - 4ac) / 4a^2.
6. Take the square root of both sides and solve for x: x = (-b ± √(b^2 - 4ac)) / 2a.

Common Student Mistakes:
- Forgetting to divide by 'a' when a > 1.
- Adding (b/2a)^2 to only one side of the equation instead of both sides.
- Sign errors when taking the square root.

Practice Problem: Solve 2x^2 + 8x - 10 = 0 using Completing the Square.
Step 1: Divide by 2 -> x^2 + 4x - 5 = 0.
Step 2: Move constant -> x^2 + 4x = 5.
Step 3: Half of 4 is 2. Square of 2 is 4. Add 4 to both sides: x^2 + 4x + 4 = 5 + 4 -> (x + 2)^2 = 9.
Step 4: Square root -> x + 2 = ±3.
Result: x = 1 or x = -5.
`;
