import React from 'react';
import { useExamStore } from '../store/useExamStore';

export default function ResultPage() {
  const { finalResult } = useExamStore();

  if (!finalResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Exam Evaluated Yet</h2>
          <p className="text-gray-500 mb-8 text-sm">It looks like your previous session expired or was incomplete.</p>
          <button
            onClick={() => {
              useExamStore.getState().returnToDashboard();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-extrabold text-gray-800 border-b pb-6 mb-8">
          CAT Mock Exam Scorecard
        </h1>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
          <p className="text-sm text-blue-900 uppercase font-bold tracking-wider">Total Score</p>
          <p className="text-4xl font-extrabold text-blue-700">{finalResult.totalScore}</p>
        </div>

        <h2 className="text-base font-bold text-gray-700 mb-3">Sectional Performance:</h2>
        <div className="space-y-4 mb-8">
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

        <h2 className="text-base font-bold text-gray-700 mb-3">Detailed Analysis:</h2>
        <div className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2 border rounded-xl p-4 bg-gray-50">
          {finalResult.detailedResponses?.map((resp, i) => (
            <div key={resp.questionId} className={`p-4 rounded-lg border ${resp.selectedAnswer ? (resp.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50') : 'border-gray-200 bg-white'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm text-gray-700">Q{i + 1} ({resp.sectionId})</span>
                {resp.selectedAnswer ? (
                  <span className={`text-xs font-bold px-2 py-1 rounded ${resp.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {resp.isCorrect ? '+ ' + resp.marksAwarded : resp.marksAwarded} Marks
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-500">Not Attempted</span>
                )}
              </div>
              
              <div className="text-sm text-gray-800 mb-3 line-clamp-2" dangerouslySetInnerHTML={{ __html: resp.questionText }} />
              
              <div className="grid grid-cols-2 gap-4 text-sm mt-3 border-t border-gray-200/60 pt-3">
                <div>
                  <span className="text-gray-500 text-xs block mb-1">Your Answer</span>
                  <span className={`font-semibold ${!resp.selectedAnswer ? 'text-gray-400 italic' : resp.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {resp.selectedAnswer || 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block mb-1">Correct Answer</span>
                  <span className="font-semibold text-green-700">{resp.correctAnswer}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            useExamStore.getState().returnToDashboard();
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
