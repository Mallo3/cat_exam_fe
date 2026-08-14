import React from 'react';
import { useExamStore } from '../store/useExamStore';

export default function QuestionPalette() {
  const { examData, currentSectionIndex, activeQuestionId, responses, selectQuestion } = useExamStore();

  const currentSection = examData?.sections[currentSectionIndex];
  const allQuestions = currentSection
    ? currentSection.questionGroups.flatMap((g) => g.questions)
    : [];

  const getStatusBadge = (qId) => {
    const status = responses[qId]?.status || 'NOT_VISITED';

    // Official TCS iON Shape mapping
    switch (status) {
      case 'ANSWERED':
        return 'bg-green-600 text-white rounded-t-xl'; // Green Arch
      case 'NOT_ANSWERED':
        return 'bg-red-600 text-white rounded-b-xl'; // Red Bowl
      case 'MARKED':
        return 'bg-purple-700 text-white rounded-full'; // Purple Circle
      case 'ANSWERED_MARKED':
        return 'bg-purple-700 text-white rounded-full ring-2 ring-green-500'; // Marked + Green ring
      default:
        return 'bg-white text-gray-800 border border-gray-400'; // Gray/White square
    }
  };

  return (
    <div className="w-80 bg-[#E5F6FD] border-l border-gray-400 flex flex-col h-full select-none">
      {/* Legend */}
      <div className="p-3 bg-white border-b border-gray-300 text-[11px] grid grid-cols-2 gap-2">
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-4 bg-green-600 text-white rounded-t-lg flex items-center justify-center font-bold text-[9px]">A</span>
          <span>Answered</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-4 bg-red-600 text-white rounded-b-lg flex items-center justify-center font-bold text-[9px]">NA</span>
          <span>Not Answered</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-4 bg-white border border-gray-400 flex items-center justify-center font-bold text-[9px]">NV</span>
          <span>Not Visited</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-4 bg-purple-700 text-white rounded-full flex items-center justify-center font-bold text-[9px]">M</span>
          <span>Marked</span>
        </div>
      </div>

      <div className="bg-tcsBlue text-white text-xs font-bold px-3 py-1.5">
        Section: {currentSection?.sectionId}
      </div>

      {/* Grid Palette */}
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-xs font-bold text-gray-700 mb-3">Choose a Question:</p>
        <div className="grid grid-cols-4 gap-2.5">
          {allQuestions.map((q, idx) => {
            const isActive = q.questionId === activeQuestionId;
            return (
              <button
                key={q.questionId}
                onClick={() => selectQuestion(q.questionId)}
                className={`h-10 w-10 flex items-center justify-center text-xs font-bold transition shadow-sm ${getStatusBadge(
                  q.questionId
                )} ${isActive ? 'ring-2 ring-black scale-105' : ''}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
