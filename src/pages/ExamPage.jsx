import React, { useEffect, useState, useMemo } from 'react';
import { useExamStore } from '../store/useExamStore';
import Header from '../components/Header';
import SectionTabs from '../components/SectionTabs';
import SplitPane from '../components/SplitPane';
import QuestionPalette from '../components/QuestionPalette';
import ActionFooter from '../components/ActionFooter';
import VirtualCalculator from '../components/VirtualCalculator';

export default function ExamPage() {
  const {
    examData,
    currentSectionIndex,
    activeQuestionId,
    responses,
    loadExam,
    selectQuestion,
    saveAnswer,
    submitExam,
    advanceSection,
  } = useExamStore();

  const [calcOpen, setCalcOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Initialize on mount
  useEffect(() => {
    if (!examData) {
      loadExam('CAT2026_MOCK_1', 'user_soumallya');
    }
  }, [examData, loadExam]);

  // Current Question Object lookup
  const { currentQuestion, sharedContext, allQuestions } = useMemo(() => {
    if (!examData) return { currentQuestion: null, sharedContext: null, allQuestions: [] };
    const sec = examData.sections[currentSectionIndex];
    let qObj = null;
    let ctx = null;
    const flat = [];

    sec.questionGroups.forEach((g) => {
      g.questions.forEach((q) => {
        flat.push(q);
        if (q.questionId === activeQuestionId) {
          qObj = q;
          ctx = g.sharedContext;
        }
      });
    });
    return { currentQuestion: qObj || flat[0], sharedContext: ctx, allQuestions: flat };
  }, [examData, currentSectionIndex, activeQuestionId]);

  // Sync internal selected option with Zustand state
  useEffect(() => {
    if (activeQuestionId && responses[activeQuestionId]) {
      setSelectedOption(responses[activeQuestionId].selectedAnswer);
    } else {
      setSelectedOption(null);
    }
  }, [activeQuestionId, responses]);

  const { examError } = useExamStore();

  if (examError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="text-red-500 mb-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 font-medium mb-8 text-sm">{examError}</p>
          <button
            onClick={() => {
              useExamStore.getState().logout();
              localStorage.clear();
              window.location.reload();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95"
          >
            Log Out & Return
          </button>
        </div>
      </div>
    );
  }

  if (!examData || !currentQuestion) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="font-bold text-gray-600">Loading CAT Engine...</p>
      </div>
    );
  }

  const navigateNext = () => {
    const currentIndex = allQuestions.findIndex((q) => q.questionId === currentQuestion.questionId);
    if (currentIndex + 1 < allQuestions.length) {
      selectQuestion(allQuestions[currentIndex + 1].questionId);
    }
  };

  const handleSaveAndNext = () => {
    const status = selectedOption ? 'ANSWERED' : 'NOT_ANSWERED';
    saveAnswer(currentQuestion.questionId, selectedOption, status);
    navigateNext();
  };

  const handleMarkReview = () => {
    const status = selectedOption ? 'ANSWERED_MARKED' : 'MARKED';
    saveAnswer(currentQuestion.questionId, selectedOption, status);
    navigateNext();
  };

  const handleClear = () => {
    setSelectedOption(null);
    saveAnswer(currentQuestion.questionId, null, 'NOT_ANSWERED');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header onOpenCalculator={() => setCalcOpen(!calcOpen)} />
      <SectionTabs />

      <div className="flex flex-1 overflow-hidden">
        <SplitPane
          sharedContext={sharedContext}
          question={currentQuestion}
          response={{ selectedAnswer: selectedOption }}
          onSelectOption={(val) => {
            setSelectedOption(val);
            useExamStore.getState().updateLocalAnswer(currentQuestion.questionId, val, 'ANSWERED');
          }}
          onTextAnswer={(val) => {
            setSelectedOption(val);
            useExamStore.getState().updateLocalAnswer(currentQuestion.questionId, val, 'ANSWERED');
          }}
        />
        <QuestionPalette />
      </div>

      <ActionFooter
        onSaveAndNext={handleSaveAndNext}
        onMarkReview={handleMarkReview}
        onClear={handleClear}
        submitLabel={currentSectionIndex === examData.sections.length - 1 ? 'Submit Exam' : 'Submit Section'}
        onSubmitSection={() => {
          const isLastSection = currentSectionIndex === examData.sections.length - 1;
          if (isLastSection) {
            if (window.confirm('Are you sure you want to submit the complete exam?')) {
              advanceSection();
            }
          } else {
            if (window.confirm('Are you sure you want to submit this section and move to the next one? You cannot return to this section.')) {
              advanceSection();
            }
          }
        }}
      />

      <VirtualCalculator isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </div>
  );
}
