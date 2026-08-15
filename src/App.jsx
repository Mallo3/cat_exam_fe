import React from 'react';
import { useExamStore } from './store/useExamStore';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';

import CandidateDashboard from './pages/CandidateDashboard';

export default function App() {
  const { currentView, currentUser } = useExamStore();
  
  if (!currentUser) return <LoginPage />;
  if (currentUser.isAdmin) return <AdminDashboard />;
  
  if (currentView === 'EXAM') return <ExamPage />;
  if (currentView === 'RESULT') return <ResultPage />;
  
  return <CandidateDashboard />;
}
