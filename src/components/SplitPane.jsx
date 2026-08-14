import React from 'react';

export default function SplitPane({ sharedContext, question, response, onSelectOption, onTextAnswer }) {
  if (!question) return <div className="p-4">Loading Question...</div>;

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Left Pane: Passage Context (if exists) */}
      {sharedContext ? (
        <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-300 text-sm leading-relaxed text-gray-800 bg-[#FAFAFA]">
          <div dangerouslySetInnerHTML={{ __html: sharedContext }} />
        </div>
      ) : null}

      {/* Right Pane: Question & Input */}
      <div className={`${sharedContext ? 'w-1/2' : 'w-full'} p-6 overflow-y-auto flex flex-col justify-between`}>
        <div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-300 mb-4">
            <span className="font-bold text-blue-900 text-base">
              Question No. {question.questionNumber}
            </span>
            <span className="text-xs bg-gray-100 border px-2 py-0.5 rounded text-gray-600">
              Type: <strong>{question.type}</strong> | Marks: <span className="text-green-600 font-bold">+{question.positiveMarks}</span> <span className="text-red-600 font-bold">-{question.negativeMarks}</span>
            </span>
          </div>

          <div
            className="text-sm font-medium mb-6 text-gray-900 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question.questionText }}
          />

          {/* Render Options: MCQ vs TITA */}
          {question.type === 'MCQ' ? (
            <div className="space-y-3">
              {question.options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start space-x-3 p-3 border rounded cursor-pointer transition ${
                    response?.selectedAnswer === opt.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question_${question.questionId}`}
                    value={opt.id}
                    checked={response?.selectedAnswer === opt.id}
                    onChange={() => onSelectOption(opt.id)}
                    className="mt-0.5 w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-800 font-normal">{opt.text}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">
                Type your answer using keyboard:
              </label>
              <input
                type="text"
                value={response?.selectedAnswer || ''}
                onChange={(e) => onTextAnswer(e.target.value)}
                placeholder="Enter numbers/text..."
                className="w-64 border-2 border-blue-500 rounded p-2 text-base font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
