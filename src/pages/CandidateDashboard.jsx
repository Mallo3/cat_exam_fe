import React, { useState, useEffect } from 'react';
import { useExamStore } from '../store/useExamStore';
import { Play, LogOut, Clock, Activity, CheckCircle, FileText } from 'lucide-react';

export default function CandidateDashboard() {
  const { currentUser, loadExam, logout, viewPastResult, examError } = useExamStore();
  const [attempts, setAttempts] = useState([]);
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const attemptedExamIds = attempts.map(a => a.examId);
  const unattemptedExams = exams.filter(e => !attemptedExamIds.includes(e.examId));

  const latestExam = unattemptedExams.length > 0 ? unattemptedExams[0] : null;
  const olderExams = exams.filter(e => e.examId !== latestExam?.examId);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  const API_SECRET = import.meta.env.VITE_API_SECRET || 'cat_prep_secret_2026';

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch both attempts and exams
      const [attemptsRes, examsRes] = await Promise.all([
        fetch(`${API_BASE}/attempts/user/${currentUser.mobile}`, { headers: { Authorization: `Bearer ${API_SECRET}` } }),
        fetch(`${API_BASE}/exams`, { headers: { Authorization: `Bearer ${API_SECRET}` } })
      ]);

      if (!attemptsRes.ok) throw new Error('Failed to fetch past attempts');
      if (!examsRes.ok) throw new Error('Failed to fetch available exams');

      const attemptsData = await attemptsRes.json();
      const examsData = await examsRes.json();

      setAttempts(attemptsData);
      setExams(examsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Clear any lingering errors from state persistence
    useExamStore.setState({ examError: null });
    fetchDashboardData();
  }, []);

  const handleStartExam = async (examId) => {
    await loadExam(examId);
  };

  const handleLogout = () => {
    logout();
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-16 bg-blue-900 text-white flex items-center justify-between px-6 shadow-md z-10">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-300" />
          <span className="font-bold text-xl tracking-wide">Candidate Portal</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg font-bold transition-all shadow"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </header>

      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">Welcome, {currentUser.name}!</h1>
          <p className="text-gray-500 mt-2 text-lg">Manage your exams and review your past performance.</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}
        
        {examError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
            <p className="text-sm text-red-700 font-medium">{examError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 space-y-6">
            
            {/* Latest Exam */}
            {latestExam && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 p-4 flex items-center space-x-2">
                  <FileText className="text-blue-600 w-5 h-5" />
                  <span className="font-bold text-blue-800 uppercase tracking-wide text-sm">Latest Exam</span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{latestExam.title || latestExam.examId}</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {latestExam.sections ? `${latestExam.sections.length} Sections` : 'Standard Mock Exam'}
                  </p>
                  <button
                    onClick={() => handleStartExam(latestExam.examId)}
                    className="w-full flex justify-center items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md active:scale-95"
                  >
                    <Play size={18} />
                    <span>Start Exam</span>
                  </button>
                </div>
              </div>
            )}

            {/* Previous Exams */}
            {olderExams.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center space-x-2">
                  <Clock className="text-gray-500 w-5 h-5" />
                  <span className="font-bold text-gray-700 uppercase tracking-wide text-sm">Previous Exams</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
                  {olderExams.map(exam => {
                    const isAttempted = attemptedExamIds.includes(exam.examId);
                    const canRetake = currentUser?.allowedRetakes?.includes(exam.examId);
                    
                    let buttonClass = "w-full flex justify-center items-center space-x-2 font-bold py-2 px-4 rounded-lg transition-colors shadow-sm active:scale-95 text-sm border ";
                    let buttonText = "Take Exam";
                    
                    if (isAttempted) {
                      buttonText = "Retake Exam";
                      if (canRetake) {
                        buttonClass += "bg-blue-600 hover:bg-blue-700 text-white border-blue-700";
                      } else {
                        buttonClass += "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200";
                      }
                    } else {
                       buttonClass += "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200";
                    }

                    return (
                      <div key={exam._id || exam.examId} className="p-5 hover:bg-gray-50 transition-colors">
                        <h3 className="text-md font-bold text-gray-800 mb-3">{exam.title || exam.examId}</h3>
                        <button
                          onClick={() => handleStartExam(exam.examId)}
                          className={buttonClass}
                        >
                          <Play size={16} />
                          <span>{buttonText}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!latestExam && !isLoading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-500 font-medium">
                No exams available.
              </div>
            )}

          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full">
              <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="text-gray-500 w-5 h-5" />
                  <span className="font-bold text-gray-700 uppercase tracking-wide text-sm">Past Attempts</span>
                </div>
                <button onClick={fetchDashboardData} className="text-xs font-bold text-blue-600 hover:underline">
                  Refresh
                </button>
              </div>
              
              <div className="divide-y divide-gray-100">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500 font-medium">Loading history...</div>
                ) : attempts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 font-medium">No previous attempts found.</div>
                ) : (
                  attempts.map((attempt) => (
                    <div key={attempt._id} className="p-5 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-bold text-gray-800 text-base">{attempt.examId}</span>
                          {attempt.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          {new Date(attempt.startedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {attempt.status === 'COMPLETED' ? (
                          <button
                            onClick={() => viewPastResult(attempt.finalScores)}
                            className="text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors border border-gray-200 shadow-sm"
                          >
                            View Result
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartExam(attempt.examId)}
                            className="text-sm font-bold bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg transition-colors border border-blue-200 shadow-sm"
                          >
                            Resume
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
