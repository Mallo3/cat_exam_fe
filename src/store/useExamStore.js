import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const API_SECRET = import.meta.env.VITE_API_SECRET || 'cat_prep_secret_2026';

export const useExamStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      examError: null,
      examData: null,
      attemptId: null,
      currentSectionIndex: 0,
      activeQuestionId: null,
      sectionStartTimes: {}, // { VARC: 172300000, DILR: 172302400 }
      responses: {}, // { q1: { selectedAnswer: 'B', status: 'ANSWERED' } }
      currentView: 'DASHBOARD',
      isSubmitted: false,
      finalResult: null,

      // Login
      login: async (mobile, password) => {
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile, password })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            set({ currentUser: data.user });
            return true;
          } else {
            throw new Error(data.error || 'Login failed');
          }
        } catch (err) {
          console.error(err);
          throw err;
        }
      },

      logout: () => {
        set({ currentUser: null, examData: null, attemptId: null, responses: {}, currentView: 'DASHBOARD', isSubmitted: false, finalResult: null, examError: null });
      },

      viewPastResult: (attempt) => {
        set({ finalResult: attempt, currentView: 'RESULT', isSubmitted: true });
      },

      returnToDashboard: () => {
        set({ currentView: 'DASHBOARD', examData: null, attemptId: null, responses: {}, isSubmitted: false, finalResult: null, examError: null });
      },

      // Initialize from backend
      loadExam: async (examId) => {
        const { currentUser } = get();
        const userId = currentUser?.mobile || 'candidate_01';
        set({ examError: null });

        try {
          const examRes = await fetch(`${API_BASE}/exams/${examId}`, {
            headers: { Authorization: `Bearer ${API_SECRET}` }
          });
          const exam = await examRes.json();

          const attemptRes = await fetch(`${API_BASE}/attempts/start`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${API_SECRET}`
            },
            body: JSON.stringify({ userId, examId })
          });
          const attempt = await attemptRes.json();

          if (!attemptRes.ok) {
            set({ examError: attempt.error || 'Failed to start exam' });
            return;
          }

          // If this was a retake, consume the permission locally to keep UI in sync
          if (currentUser?.allowedRetakes?.includes(examId)) {
            set({ 
              currentUser: {
                ...currentUser,
                allowedRetakes: currentUser.allowedRetakes.filter(id => id !== examId)
              }
            });
          }

          const firstSection = exam.sections[0];
          const firstQuestion = firstSection.questionGroups[0].questions[0];

          // Initialize local responses map
          const respMap = {};
          attempt.responses.forEach(r => {
            respMap[r.questionId] = { selectedAnswer: r.selectedAnswer, status: r.status };
          });

          set({
            examData: exam,
            attemptId: attempt.attemptId || attempt._id,
            currentSectionIndex: 0,
            activeQuestionId: firstQuestion.questionId,
            sectionStartTimes: { [firstSection.sectionId]: Date.now() },
            responses: respMap,
            currentView: 'EXAM',
            isSubmitted: false,
            finalResult: null
          });
        } catch (err) {
          console.error('Failed to initialize exam', err);
        }
      },

      // Set active question & mark as NOT_ANSWERED if previously NOT_VISITED
      selectQuestion: (questionId) => {
        const { responses } = get();
        const current = responses[questionId] || { selectedAnswer: null, status: 'NOT_VISITED' };

        if (current.status === 'NOT_VISITED') {
          set({
            activeQuestionId: questionId,
            responses: {
              ...responses,
              [questionId]: { ...current, status: 'NOT_ANSWERED' }
            }
          });
          get().syncToBackend(questionId, current.selectedAnswer, 'NOT_ANSWERED');
        } else {
          set({ activeQuestionId: questionId });
        }
      },

      // Update response locally without triggering API sync
      updateLocalAnswer: (questionId, selectedAnswer, status) => {
        const { responses } = get();
        set({
          responses: {
            ...responses,
            [questionId]: { selectedAnswer, status }
          }
        });
      },

      // Update response & save to DB
      saveAnswer: (questionId, selectedAnswer, status) => {
        const { responses } = get();
        set({
          responses: {
            ...responses,
            [questionId]: { selectedAnswer, status }
          }
        });
        get().syncToBackend(questionId, selectedAnswer, status);
      },

      // Move to Next Section when 40 min timer expires
      advanceSection: () => {
        const { currentSectionIndex, examData, sectionStartTimes } = get();
        const nextIndex = currentSectionIndex + 1;

        if (nextIndex < examData.sections.length) {
          const nextSec = examData.sections[nextIndex];
          const firstQ = nextSec.questionGroups[0].questions[0].questionId;

          set({
            currentSectionIndex: nextIndex,
            activeQuestionId: firstQ,
            sectionStartTimes: {
              ...sectionStartTimes,
              [nextSec.sectionId]: Date.now()
            }
          });
          get().selectQuestion(firstQ);
        } else {
          get().submitExam();
        }
      },

      // Sync with MongoDB
      syncToBackend: async (questionId, selectedAnswer, status) => {
        const { attemptId } = get();
        if (!attemptId) return;

        try {
          await fetch(`${API_BASE}/attempts/${attemptId}/sync`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${API_SECRET}`
            },
            body: JSON.stringify({ questionId, selectedAnswer, status, timeSpentSeconds: 5 })
          });
        } catch (e) {
          console.warn('Sync failed, working offline', e);
        }
      },

      // Submit whole exam
      submitExam: async () => {
        const { attemptId, responses } = get();
        try {
          const res = await fetch(`${API_BASE}/attempts/${attemptId}/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${API_SECRET}`
            },
            body: JSON.stringify({ finalResponses: responses })
          });
          if (res.ok) {
            const finalState = await res.json();
            set({ isSubmitted: true, currentView: 'RESULT', finalResult: finalState.finalScores });
          }
        } catch (err) {
          console.error('Submission failed', err);
        }
      }
    }),
    {
      name: 'cat-exam-storage',
    }
  )
);
