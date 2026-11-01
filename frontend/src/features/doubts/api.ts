import { useMutation } from '@tanstack/react-query';
import { client } from '../../lib/api/client';

// Types
export interface DoubtResponse {
  question: string;
  answer: string;
  isGroundedInTranscript: boolean;
}

// Hooks
export function useAskDoubt() {
  return useMutation({
    mutationFn: (data: { transcript: string; question: string }) =>
      client.post('/doubts/ask', data).then(r => r.data.data),
  });
}
