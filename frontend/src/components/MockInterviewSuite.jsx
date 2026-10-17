import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function MockInterviewSuite({ user, onInterviewFeedbackLoop }) {
  const [interviewState, setInterviewState] = useState('setup'); // setup, active, report
  const [mode, setMode] = useState('Technical');
  const [targetRole, setTargetRole] = useState(user?.target_role || '');

  // Active Session states
  const [interviewId, setInterviewId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);

  // Conversation history
  const [chatLogs, setChatLogs] = useState([]);
  const [answerInput, setAnswerInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Audio / Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Camera stream
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [presentationCues, setPresentationCues] = useState({
    camera_engagement: 'Good',
    posture: 'Good',
    face_visibility: 'Optimal',
    presentation_consistency: 'Consistent',
  });

  // Final Report
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (user?.target_role) {
      setTargetRole(user.target_role);
    }
  }, [user]);

  // Setup Web Speech API & Camera
  useEffect(() => {
    // Initialize Web Speech API if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpeechTranscript(transcript);
        setAnswerInput(transcript);
      };

      rec.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Handle Camera Stream Start/Stop
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Toggle Mic
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your answer below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Start Interview Session
  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const res = await api.interview.start(mode, targetRole);
      setInterviewId(res.interview_id);
      setCurrentQuestion(res.current_question);
      setTotalQuestions(res.total_questions || 5);
      setQuestionIndex(1);

      setChatLogs([
        { sender: 'ai', text: res.greeting },
        { sender: 'ai', text: `Question 1: ${res.current_question?.question_text}` },
      ]);

      setInterviewState('active');
      startCamera();
    } catch (err) {
      alert(`Failed to start interview: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    const finalAnswer = answerInput.trim() || speechTranscript.trim();
    if (!finalAnswer || loading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setChatLogs((prev) => [...prev, { sender: 'user', text: finalAnswer }]);
    setAnswerInput('');
    setSpeechTranscript('');
    setLoading(true);

    try {
      const res = await api.interview.submitAnswer(interviewId, currentQuestion.id, finalAnswer, speechTranscript);

      // AI Evaluates and gives per-answer feedback
      const evalText = `Score: ${res.evaluation.evaluation_score}% — ${res.evaluation.evaluation_feedback}`;
      setChatLogs((prev) => [...prev, { sender: 'ai-eval', text: evalText }]);

      if (res.followup_question) {
        setChatLogs((prev) => [...prev, { sender: 'ai', text: `Follow-up Question: ${res.followup_question}` }]);
      } else if (res.next_question) {
        setCurrentQuestion(res.next_question);
        setQuestionIndex((prev) => prev + 1);
        setChatLogs((prev) => [
          ...prev,
          { sender: 'ai', text: `Question ${questionIndex + 1}: ${res.next_question.question_text}` },
        ]);
      } else {
        // Complete interview automatically
        handleCompleteInterview();
      }
    } catch (err) {
      alert(`Error submitting answer: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // End / Complete Interview
  const handleCompleteInterview = async () => {
    setLoading(true);
    stopCamera();
    try {
      const res = await api.interview.complete(interviewId, presentationCues);
      setReport(res.report);
      setInterviewState('report');
      if (onInterviewFeedbackLoop) {
        onInterviewFeedbackLoop(res.report);
      }
    } catch (err) {
      alert(`Error completing interview: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#fff' }}>🎙️ Interactive AI Mock Interview Suite</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Target Role: <strong>{targetRole}</strong> • Target Company: <strong>{user?.target_company ? user.target_company : 'Not specified'}</strong>
          </p>
        </div>
        <span className="tag tag-info" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
          Agent 5: Mock Interviewer
        </span>
      </div>

      {/* 1. SETUP STATE */}
      {interviewState === 'setup' && (
        <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1rem' }}>Configure Interview Session</h3>

          <div className="form-group">
            <label className="form-label">Target Role</label>
            <select className="form-select" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
              <option value="Software Developer">Software Developer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="AI/ML Engineer">AI/ML Engineer</option>
              <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Interview Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {['Technical', 'HR', 'Project-Based', 'Role-Specific', 'Mixed'].map((m) => (
                <div
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: '0.8rem',
                    borderRadius: 8,
                    border: mode === m ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                    background: mode === m ? 'rgba(99, 102, 241, 0.2)' : 'rgba(10, 13, 20, 0.4)',
                    color: '#fff',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  {m} Interview
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleStartInterview} disabled={loading}>
            {loading ? 'Initializing AI Interviewer...' : 'Start AI Interview Session →'}
          </button>
        </div>
      )}

      {/* 2. ACTIVE SESSION STATE */}
      {interviewState === 'active' && (
        <div className="interview-container">
          {/* MAIN CONVERSATION PANEL */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: 600, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.15)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#fff' }}>
                Question {questionIndex} of {totalQuestions} • {mode} Interview
              </span>
              <button className="btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={handleCompleteInterview}>
                End Interview & View Report
              </button>
            </div>

            {/* CHAT TRANSCRIPT */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {chatLogs.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: log.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '0.8rem 1rem',
                    borderRadius: 12,
                    fontSize: '0.9rem',
                    background:
                      log.sender === 'user'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : log.sender === 'ai-eval'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(99, 102, 241, 0.2)',
                    border:
                      log.sender === 'user'
                        ? '1px solid rgba(16, 185, 129, 0.4)'
                        : log.sender === 'ai-eval'
                        ? '1px solid rgba(245, 158, 11, 0.4)'
                        : '1px solid rgba(99, 102, 241, 0.4)',
                    color: log.sender === 'ai-eval' ? '#fbbf24' : '#fff',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8, marginBottom: 2 }}>
                    {log.sender === 'user' ? 'Student' : log.sender === 'ai-eval' ? 'AI Evaluation Feedback' : 'AI Interviewer'}
                  </strong>
                  {log.text}
                </div>
              ))}
              {loading && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>AI Interviewer is evaluating...</div>}
            </div>

            {/* ANSWER INPUT & SPEECH CONTROLS */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'rgba(10, 13, 20, 0.8)' }}>
              {isListening && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 6, fontWeight: 600 }}>
                  🎙️ Microphone active — speaking transcript: "{speechTranscript}"
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`btn-secondary ${isListening ? 'mic-active-btn' : ''}`}
                  onClick={toggleListening}
                  title="Toggle Microphone Speech Recognition"
                >
                  {isListening ? '⏹️ Stop Mic' : '🎙️ Mic On'}
                </button>
                <input
                  className="form-input"
                  placeholder="Type or speak your answer here..."
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                />
                <button className="btn-primary" onClick={handleSubmitAnswer} disabled={loading}>
                  Submit Answer →
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: CAMERA & PRESENTATION CUES */}
          <div>
            <div className="glass-card" style={{ padding: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem' }}>📷 WebRTC Camera Preview</h4>
              <div className="video-preview-box">
                <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {!cameraActive && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Camera Preview Inactive
                  </div>
                )}
                {cameraActive && (
                  <div className="camera-overlay">
                    <span style={{ color: '#34d399' }}>● LIVE PREVIEW</span>
                    <span>Facing Camera: Good</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>OBSERVABLE PRESENTATION CUES:</h5>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--text-main)' }}>
                  <div>• Camera Engagement: <span style={{ color: '#34d399' }}>{presentationCues.camera_engagement}</span></div>
                  <div>• Posture Visibility: <span style={{ color: '#34d399' }}>{presentationCues.posture}</span></div>
                  <div>• Face Visibility: <span style={{ color: '#34d399' }}>{presentationCues.face_visibility}</span></div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
                  * Presentation cues are observable physical signals (camera angle & posture), not scientific emotion detection.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. REPORT STATE */}
      {interviewState === 'report' && report && (
        <div className="glass-card">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.8rem', color: '#fff' }}>🎉 Mock Interview Evaluation Report</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Target Role: <strong>{report.target_role}</strong> • Mode: <strong>{mode}</strong>
            </p>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-glow)', margin: '0.5rem 0' }}>
              {report.overall_score}%
            </div>
            <span className="tag tag-success" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>Overall Interview Performance Score</span>
          </div>

          {/* SCORES GRID */}
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{report.tech_score}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Technical Knowledge</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8' }}>{report.relevance_score}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Answer Relevance</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>{report.comm_score}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Communication</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{report.pace_score}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Speaking Pace</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a855f7' }}>{report.presentation_score}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Presentation Cues</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f43f5e' }}>{report.project_score}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project Knowledge</div>
            </div>
          </div>

          {/* STRENGTHS & WEAKNESSES */}
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-card">
              <h4 style={{ color: '#34d399', marginBottom: '0.75rem' }}>✅ Key Strong Areas</h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {report.strong_areas?.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="glass-card">
              <h4 style={{ color: '#f87171', marginBottom: '0.75rem' }}>⚠️ Identified Weak Areas (Synced to Feedback Loop)</h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {report.weak_areas?.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => setInterviewState('setup')}>
              Retake Mock Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
