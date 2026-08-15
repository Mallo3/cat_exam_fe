import React from 'react';

export default function ActionFooter({ onSaveAndNext, onMarkReview, onClear, onSubmitSection, submitLabel }) {
  return (
    <footer className="h-14 bg-gray-200 border-t border-gray-300 flex items-center justify-between px-4 select-none">
      <div className="flex space-x-3">
        <button
          onClick={onMarkReview}
          className="bg-white border border-gray-400 hover:bg-gray-100 text-gray-800 text-xs font-bold px-4 py-2 rounded shadow-sm"
        >
          Mark for Review & Next
        </button>
        <button
          onClick={onClear}
          className="bg-white border border-gray-400 hover:bg-gray-100 text-gray-800 text-xs font-bold px-4 py-2 rounded shadow-sm"
        >
          Clear Response
        </button>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onSaveAndNext}
          className="bg-tcsGreen hover:bg-green-700 text-white text-xs font-bold px-6 py-2 rounded shadow transition uppercase tracking-wider"
        >
          Save & Next
        </button>
        <button
          onClick={onSubmitSection}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded shadow transition uppercase tracking-wider"
        >
          {submitLabel || 'Submit'}
        </button>
      </div>
    </footer>
  );
}
