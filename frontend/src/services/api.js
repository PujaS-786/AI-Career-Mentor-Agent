/**
 * api.js — Frontend API service layer
 * Connects React frontend to Flask backend REST API endpoints.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api/v1';

let authToken = localStorage.getItem('token') || '';

export const setAuthToken = (token) => {
  authToken = token || '';
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const currentToken = localStorage.getItem('token') || authToken;

  const headers = {
    ...options.headers,
  };

  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const timeoutMs = options.timeout || 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds. Please try again.`);
    }
    throw new Error(err.message || 'Network connection failed. Please verify that the backend is running.');
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401) {
    setAuthToken('');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server returned a non-JSON response (HTTP ${response.status}). Please try again.`);
  }

  if (!response.ok) {
    throw new Error(data?.message || `HTTP error ${response.status}: ${response.statusText}`);
  }

  return data;
}

const api = {
  get: (endpoint, options = {}) => request(endpoint, { method: 'GET', ...options }),
  
  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    }),

  // Dedicated API methods
  auth: {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    me: () => {
      const token = localStorage.getItem('token') || authToken;
      if (!token) return Promise.resolve({ user: null });
      return api.get('/auth/me').catch(() => {
        setAuthToken('');
        return { user: null };
      });
    },
    updateProfile: (profileData) => api.patch('/auth/profile', profileData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, new_password: newPassword }),
  },

  assessment: {
    submit: (data) => api.post('/assessment', data),
    get: () => api.get('/assessment'),
  },

  resume: {
    upload: (formDataOrText) => {
      if (formDataOrText instanceof FormData) {
        return api.post('/resume/upload', formDataOrText);
      }
      return api.post('/resume/upload', { resume_text: formDataOrText });
    },
    get: () => api.get('/resume'),
    confirmDetails: (confirmedData) => api.post('/resume/confirm-details', confirmedData),
    improve: (confirmedDetails = null) => api.post('/resume/improve', { confirmed_details: confirmedDetails }),
    getImproved: () => api.get('/resume/improved'),
    updateImprovedText: (text) => api.post('/resume/improved/update-text', { text }),
    downloadPdfUrl: `${BASE_URL}/resume/improved/download`,
    downloadPdf: async (customText = null) => {
      const token = localStorage.getItem('token') || authToken;
      const isPost = Boolean(customText);
      const response = await fetch(`${BASE_URL}/resume/improved/download`, {
        method: isPost ? 'POST' : 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(isPost ? { 'Content-Type': 'application/json' } : {})
        },
        ...(isPost ? { body: JSON.stringify({ text: customText }) } : {})
      });
      if (!response.ok) {
        let errJson;
        try { errJson = await response.json(); } catch { }
        throw new Error(errJson?.message || 'Failed to download improved resume PDF.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ATS_Improved_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  },

  analysis: {
    analyzeResume: () => api.post('/analysis/resume', {}),
    get: () => api.get('/analysis/resume'),
  },

  roles: {
    match: (preferredRoles) => api.post('/roles/match', { preferred_roles: preferredRoles }),
    select: (targetRole, targetCompany = '') =>
      api.post('/roles/select', { target_role: targetRole, target_company: targetCompany }),
  },

  skills: {
    getGaps: () => api.get('/skills/gaps'),
  },

  roadmap: {
    get: () => api.get('/roadmap'),
    toggleMilestone: (id, isCompleted) =>
      api.patch(`/roadmap/milestones/${id}`, { is_completed: isCompleted }),
    toggleProject: (id, isCompleted) =>
      api.patch(`/roadmap/projects/${id}`, { is_completed: isCompleted }),
    toggleCertification: (id, isCompleted) =>
      api.patch(`/roadmap/certifications/${id}`, { is_completed: isCompleted }),
  },

  interview: {
    start: (mode, targetRole) => api.post('/interview/start', { mode, target_role: targetRole }),
    submitAnswer: (interviewId, questionId, answer, speechTranscript = '') =>
      api.post(`/interview/${interviewId}/answer`, {
        question_id: questionId,
        answer,
        speech_transcript: speechTranscript,
      }),
    complete: (interviewId, presentationCues = {}) =>
      api.post(`/interview/${interviewId}/complete`, { presentation_cues: presentationCues }),
    results: (interviewId) => api.get(`/interview/${interviewId}/results`),
    history: () => api.get('/interview/history'),
  },

  progress: {
    get: () => api.get('/progress'),
  },

  mentor: {
    chat: (message) => api.post('/mentor/chat', { message }),
    getHistory: () => api.get('/mentor/history'),
  },
};

export default api;
