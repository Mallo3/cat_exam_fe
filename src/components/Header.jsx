import React, { useState, useEffect } from 'react';
import { useExamStore } from '../store/useExamStore';
import { Calculator, User } from 'lucide-react';

export default function Header({ onOpenCalculator }) {
  const { examData, currentSectionIndex, sectionStartTimes, advanceSection } = useExamStore();
  const [timeLeft, setTimeLeft] = useState('40:00');

  const currentSection = examData?.sections[currentSectionIndex];

  useEffect(() => {
    if (!currentSection) return;
    const startTime = sectionStartTimes[currentSection.sectionId] || Date.now();
    const totalSeconds = currentSection.durationSeconds || 2400;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = totalSeconds - elapsed;

      if (remaining <= 0) {
        clearInterval(timer);
        setTimeLeft('00:00');
        alert(`Time up for section: ${currentSection.title}. Auto-advancing...`);
        advanceSection();
      } else {
        const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
        const secs = String(remaining % 60).padStart(2, '0');
        setTimeLeft(`${mins}:${secs}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSectionIndex, sectionStartTimes, currentSection]);

  return (
    <header className="h-14 bg-tcsHeader text-white flex items-center justify-between px-4 select-none">
      <div className="flex items-center space-x-3">
        <span className="font-bold text-lg tracking-wide">{examData?.title || 'CAT Exam Interface'}</span>
      </div>

      <div className="flex items-center space-x-6">
        <button
          onClick={onOpenCalculator}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-xs uppercase px-3 py-1.5 rounded font-semibold tracking-wider transition"
        >
          <Calculator size={16} />
          <span>Calculator</span>
        </button>

        <div className="bg-red-600 text-white font-mono font-bold text-base px-3 py-1 rounded shadow-inner">
          Time Left: {timeLeft}
        </div>

        <div className="flex items-center space-x-2 text-xs border-l border-gray-500 pl-4">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
            <User size={18} />
          </div>
          <div className="text-left">
            <p className="font-bold">Candidate</p>
            <p className="text-gray-300">Roll: 26019940</p>
          </div>
        </div>
      </div>
    </header>
  );
}
