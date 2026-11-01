import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../../lib/api/client';

// Types
export interface Test {
  _id: string;
  title: string;
  instructions: string;
  topics: { _id: string; name: string }[];
  difficulty: 'easy' | 'medium' | 'hard';
  questions: {
    number: number;
    type: 'mcq' | 'short' | 'long';
    question: string;
    marks: number;
    options?: string[];
    correctAnswer?: string;
    rubric?: string;
  }[];
  totalMarks: number;
  board?: string;
  classLevel?: string;
  subject?: string;
  createdAt: string;
}

export interface Attempt {
  _id: string;
  test: Test;
  student: string;
  answers: {
    questionNumber: number;
    type: 'mcq' | 'short' | 'long';
    studentAnswer: string;
    isCorrect?: boolean;
    score?: number;
    maxScore: number;
    feedback?: string;
  }[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: 'in_progress' | 'submitted' | 'graded';
  startedAt: string;
  submittedAt?: string;
  gradedAt?: string;
}

// Test hooks
export function useTests(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['tests', page, limit],
    queryFn: () => client.get('/tests', { params: { page, limit } }).then(r => r.data),
  });
}

export function useTest(id: string) {
  return useQuery({
    queryKey: ['test', id],
    queryFn: () => client.get(`/tests/${id}`).then(r => r.data.data),
    enabled: !!id,
  });
}

export function useGenerateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      topics: string[];
      difficulty: 'easy' | 'medium' | 'hard';
      numQuestions?: number;
      questionTypes?: ('mcq' | 'short' | 'long')[];
      board?: string;
      classLevel?: string;
      subject?: string;
    }) => client.post('/tests/generate', data, { timeout: 120_000 }).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tests'] }),
  });
}

// Attempt hooks
export function useStartAttempt() {
  return useMutation({
    mutationFn: (testId: string) =>
      client.post('/tests/attempts/start', { testId }).then(r => r.data.data),
  });
}

export function useSubmitAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string; answers: { questionNumber: number; type: string; studentAnswer: string }[] }) =>
      client.post('/tests/attempts/submit', { attemptId, answers }).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attempts'] }),
  });
}

export function useGradeAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: string) =>
      client.post('/tests/attempts/grade', { attemptId }).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attempts'] }),
  });
}

export function useAttempt(id: string) {
  return useQuery({
    queryKey: ['attempt', id],
    queryFn: () => client.get(`/tests/attempts/${id}`).then(r => r.data.data),
    enabled: !!id,
  });
}

export function useMyAttempts(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['myAttempts', page, limit],
    queryFn: () => client.get('/tests/attempts', { params: { page, limit } }).then(r => r.data),
  });
}

export function useDownloadTestPDF() {
  return useMutation({
    mutationFn: async (testId: string) => {
      const response = await client.get(`/tests/${testId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `test_${testId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
