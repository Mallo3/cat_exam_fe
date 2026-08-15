import React, { useState } from 'react';
import { validateExamJSON } from '../utils/examValidator';
import { CheckCircle, AlertTriangle, FileJson, UploadCloud } from 'lucide-react';

export default function ExamUploader({ onSuccess }) {
  const [jsonInput, setJsonInput] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  const API_SECRET = import.meta.env.VITE_API_SECRET || 'cat_prep_secret_2026';

  const handleValidateAndUpload = async () => {
    setValidationErrors([]);
    setUploadError(null);
    setUploadSuccess(false);

    if (!jsonInput.trim()) {
      setValidationErrors(['Input cannot be empty']);
      return;
    }

    const { isValid, errors, parsedExam } = validateExamJSON(jsonInput);

    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    // If valid, upload to backend
    setIsUploading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_SECRET}`
        },
        body: JSON.stringify({ exam: parsedExam })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create exam');

      setUploadSuccess(true);
      setJsonInput('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-8">
      <div className="p-4 border-b bg-indigo-50 flex items-center space-x-2">
        <FileJson className="text-indigo-600 w-5 h-5" />
        <span className="font-bold text-indigo-800 uppercase tracking-wide text-sm">JSON Exam Uploader</span>
      </div>

      <div className="p-6">
        <p className="text-sm text-gray-500 mb-4 font-medium">
          Paste the exam structure below. You can paste standard JSON or directly copy MongoDB shell output 
          (unquoted keys, single quotes, NumberInt, ObjectId, etc. are all perfectly supported).
        </p>

        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="{\n  examId: 'CAT2026_MOCK_2',\n  title: 'CAT 2026 Mock Test 2',\n  sections: [...]\n}"
          className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          spellCheck={false}
        />

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 text-red-700 font-bold mb-3">
              <AlertTriangle className="w-5 h-5" />
              <span>Validation Failed ({validationErrors.length} errors found)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-600 font-mono">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 text-red-700 font-bold mb-1">
              <AlertTriangle className="w-5 h-5" />
              <span>Upload Error</span>
            </div>
            <p className="text-sm text-red-600 font-mono">{uploadError}</p>
          </div>
        )}

        {/* Success State */}
        {uploadSuccess && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-bold text-sm">Exam successfully validated and created!</span>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleValidateAndUpload}
            disabled={isUploading}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all active:scale-95 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <UploadCloud className="w-5 h-5" />
            <span>{isUploading ? 'Validating & Uploading...' : 'Validate & Upload JSON'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
