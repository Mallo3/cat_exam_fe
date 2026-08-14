import React from 'react';
import { useExamStore } from './store/useExamStore';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';

export default function App() {
  const { isSubmitted } = useExamStore();
  return isSubmitted ? <ResultPage /> : <ExamPage />;
}
