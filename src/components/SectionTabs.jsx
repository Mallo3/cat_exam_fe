import React from 'react';
import { useExamStore } from '../store/useExamStore';

export default function SectionTabs() {
  const { examData, currentSectionIndex } = useExamStore();

  return (
    <div className="h-10 bg-gray-200 border-b border-gray-400 flex items-center px-2 space-x-1">
      <span className="text-xs font-bold text-gray-700 mr-2">Sections:</span>
      {examData?.sections.map((section, idx) => {
        const isActive = idx === currentSectionIndex;
        return (
          <div
            key={section.sectionId}
            className={`px-4 h-8 flex items-center justify-center text-xs font-bold rounded-t cursor-default border-t border-x ${
              isActive
                ? 'bg-tcsBlue text-white border-tcsBlue shadow'
                : 'bg-gray-100 text-gray-500 border-gray-300 opacity-60'
            }`}
          >
            {section.sectionId}
          </div>
        );
      })}
    </div>
  );
}
