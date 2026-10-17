/* Nigraan - Secure JWT Authentication & Session Manager */

class AuthService {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('nigraan_auth_user')) || null;
    this.token = localStorage.getItem('nigraan_jwt_token') || null;
    this.apiBase = window.location.origin.includes('5000') ? '' : 'http://localhost:5000';
  }

  getDemoCredentials() {
    return {
      teacher: { email: "teacher@nigraan.edu.pk", pass: "teacher123" },
      admin: { email: "admin@nigraan.edu.pk", pass: "admin123" },
      student: { email: "zainab@student.nigraan.edu.pk", pass: "student123" }
    };
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const data = await response.json();
      if (response.ok && data.token) {
        this.token = data.token;
        this.currentUser = data.user;
        localStorage.setItem('nigraan_jwt_token', data.token);
        localStorage.setItem('nigraan_auth_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Authentication failed' };
      }
    } catch (err) {
      console.warn("Backend auth unavailable, fallback offline verification active.", err);
      // Fallback for standalone offline mode
      const demos = this.getDemoCredentials();
      let matched = null;
      if (email === demos.teacher.email && password === demos.teacher.pass) {
        matched = { userId: "usr_teacher_1", email: email, role: "Teacher", name: "Teacher Ahmed", title: "Class 10-A Lead Educator" };
      } else if (email === demos.admin.email && password === demos.admin.pass) {
        matched = { userId: "usr_admin_1", email: email, role: "Counselor", name: "Counselor Fatima", title: "Head of Student Wellbeing" };
      } else if (email === demos.student.email && password === demos.student.pass) {
        matched = { userId: "usr_student_1", email: email, role: "Student", name: "Zainab Bibi", title: "Grade 10 - Science Track" };
      }

      if (matched) {
        this.currentUser = matched;
        this.token = `offline_mock_token_${Date.now()}`;
        localStorage.setItem('nigraan_jwt_token', this.token);
        localStorage.setItem('nigraan_auth_user', JSON.stringify(matched));
        return { success: true, user: matched };
      }
      return { success: false, error: "Invalid credentials." };
    }
  }

  logout() {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('nigraan_jwt_token');
    localStorage.removeItem('nigraan_auth_user');
  }

  isLoggedIn() {
    return !!this.currentUser && !!this.token;
  }

  getCurrentRole() {
    return this.currentUser ? this.currentUser.role : null;
  }

  getToken() {
    return this.token;
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token || ''}`
    };
  }
}

const authService = new AuthService();
