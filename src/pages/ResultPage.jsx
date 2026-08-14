import React from 'react';
import { useExamStore } from '../store/useExamStore';

export default function ResultPage() {
  const { finalResult } = useExamStore();

  if (!finalResult) return <div className="p-8">No exam evaluated yet.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">
          CAT Mock Exam Scorecard
        </h1>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
          <p className="text-sm text-blue-900 uppercase font-bold tracking-wider">Total Score</p>
          <p className="text-4xl font-extrabold text-blue-700">{finalResult.totalScore}</p>
        </div>

        <h2 className="text-base font-bold text-gray-700 mb-3">Sectional Performance:</h2>
        <div className="space-y-4">
          {Object.entries(finalResult.sectionBreakdown).map(([secId, stats]) => (
            <div key={secId} className="border rounded p-4 bg-gray-50 flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-gray-800">{secId}</p>
                <p className="text-xs text-gray-500">
                  Attempted: {stats.attempted} | Correct: {stats.correct} | Incorrect: {stats.incorrect}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-400 uppercase">Score</span>
                <p className="text-2xl font-bold text-gray-800">{stats.score}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded shadow transition"
        >
          Retake Exam
        </button>
      </div>
    </div>
  );
}
