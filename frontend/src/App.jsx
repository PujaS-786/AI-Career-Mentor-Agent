import React, { useState, useEffect } from 'react';
import './styles/App.css';
import api from './services/api';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import AIMentorDrawer from './components/AIMentorDrawer';
import LandingHeroView from './components/LandingHeroView';
import StudentDashboard from './components/StudentDashboard';
import OnboardingFlow from './components/OnboardingFlow';
import ResumeAnalysisView from './components/ResumeAnalysisView';
import SkillGapDashboard from './components/SkillGapDashboard';
import RoadmapDashboard from './components/RoadmapDashboard';
import ProjectsCertificationsView from './components/ProjectsCertificationsView';
import MockInterviewSuite from './components/MockInterviewSuite';
import ProgressAnalyticsView from './components/ProgressAnalyticsView';

function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState('register');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);

  const handleOpenAuth = (view = 'register') => {
    const targetView = typeof view === 'string' && (view === 'login' || view === 'register') ? view : 'register';
    setAuthView(targetView);
    setIsAuthOpen(true);
    if (window.location.pathname !== `/${targetView}`) {
      window.history.pushState({}, '', `/${targetView}`);
    }
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
    if (activeTab === 'register' || activeTab === 'login') {
      setActiveTab('landing');
    }
    if (window.location.pathname === '/login' || window.location.pathname === '/register') {
      window.history.pushState({}, '', '/');
    }
  };

  useEffect(() => {
    api.auth.me()
      .then((res) => {
        if (res?.user) setUser(res.user);
        else setUser(null);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  useEffect(() => {
    const syncRouteFromUrl = () => {
      const rawPath = window.location.pathname.replace(/^\//, '').toLowerCase();
      const rawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      const path = rawPath || rawHash;

      if (path === 'login') {
        setActiveTab('landing');
        setAuthView('login');
        setIsAuthOpen(true);
      } else if (path === 'register') {
        setActiveTab('landing');
        setAuthView('register');
        setIsAuthOpen(true);
      } else if (['dashboard', 'onboarding', 'analysis', 'skillgap', 'roadmap', 'projects', 'interview', 'progress'].includes(path)) {
        setActiveTab(path);
      }
    };

    syncRouteFromUrl();
    window.addEventListener('popstate', syncRouteFromUrl);
    window.addEventListener('hashchange', syncRouteFromUrl);
    return () => {
      window.removeEventListener('popstate', syncRouteFromUrl);
      window.removeEventListener('hashchange', syncRouteFromUrl);
    };
  }, []);

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    const targetPath = tab === 'landing' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  const handleCompleteOnboarding = (data) => {
    setOnboardingData(data);
    if (data?.user) setUser(data.user);
    handleNavigate('skillgap');
  };

  const handleLogout = () => {
    api.auth.me().catch(() => {});
    setUser(null);
    handleNavigate('landing');
  };

  return (
    <div className="app-container">
      {/* BRAND NAVBAR */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        user={user}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setIsProfileOpen(true)}
        onToggleMentor={() => setIsMentorOpen(!isMentorOpen)}
        isMentorOpen={isMentorOpen}
      />

      {/* MAIN VIEW CANVAS */}
      <main className="main-content">
        {(activeTab === 'landing' || activeTab === 'register' || activeTab === 'login') && (
          <LandingHeroView
            onStartOnboarding={() => setActiveTab('onboarding')}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'dashboard' && (
          <StudentDashboard user={user} onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'onboarding' && (
          <OnboardingFlow user={user} onCompleteOnboarding={handleCompleteOnboarding} />
        )}

        {activeTab === 'analysis' && (
          <ResumeAnalysisView analysisData={onboardingData?.analysis} />
        )}

        {activeTab === 'skillgap' && (
          <SkillGapDashboard user={user} skillGapData={onboardingData?.skill_gap} />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapDashboard user={user} roadmapData={onboardingData?.roadmap} />
        )}

        {activeTab === 'projects' && (
          <ProjectsCertificationsView user={user} />
        )}

        {activeTab === 'interview' && (
          <MockInterviewSuite user={user} />
        )}

        {activeTab === 'progress' && (
          <ProgressAnalyticsView user={user} />
        )}
      </main>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        initialView={authView}
        onClose={handleCloseAuth}
        onAuthSuccess={(u) => {
          setUser(u);
          setActiveTab('onboarding');
          if (window.location.pathname === '/login' || window.location.pathname === '/register') {
            window.history.pushState({}, '', '/');
          }
        }}
      />

      {/* PROFILE SETTINGS MODAL */}
      <ProfileSettingsModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser(updated)}
        onLogout={handleLogout}
      />

      {/* AI MENTOR DRAWER */}
      <AIMentorDrawer
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
        user={user}
      />
    </div>
  );
}

export default App;