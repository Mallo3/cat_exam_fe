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

  if (!examData || !currentQuestion) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 font-bold text-gray-700">
        Loading CAT Engine...
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
          onSelectOption={(val) => setSelectedOption(val)}
          onTextAnswer={(val) => setSelectedOption(val)}
        />
        <QuestionPalette />
      </div>

      <ActionFooter
        onSaveAndNext={handleSaveAndNext}
        onMarkReview={handleMarkReview}
        onClear={handleClear}
        onSubmitSection={() => {
          if (window.confirm('Are you sure you want to submit the complete exam?')) {
            submitExam();
          }
        }}
      />

      <VirtualCalculator isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </div>
  );
}
