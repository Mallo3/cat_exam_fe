import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_SECRET = import.meta.env.VITE_API_SECRET || 'cat_prep_secret_2026';

export const useExamStore = create(
  persist(
    (set, get) => ({
      examData: null,
      attemptId: null,
      currentSectionIndex: 0,
      activeQuestionId: null,
      sectionStartTimes: {}, // { VARC: 172300000, DILR: 172302400 }
      responses: {}, // { q1: { selectedAnswer: 'B', status: 'ANSWERED' } }
      isSubmitted: false,
      finalResult: null,

      // Initialize from backend
      loadExam: async (examId, userId = 'candidate_01') => {
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

      // Update response & save
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
        const { attemptId } = get();
        try {
          const res = await fetch(`${API_BASE}/attempts/${attemptId}/submit`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${API_SECRET}` }
          });
          const result = await res.json();
          set({ isSubmitted: true, finalResult: result.finalScores });
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
