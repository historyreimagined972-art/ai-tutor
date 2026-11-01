import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../../lib/api/client';

// Types
export interface PastPaper {
  _id: string;
  title: string;
  board: {
    _id: string;
    name: string;
    country: string;
  };
  class: {
    _id: string;
    name: string;
    grade: number;
  };
  subject: {
    _id: string;
    name: string;
    code?: string;
  };
  year: number;
  fileUrl: string;
  fileName: string;
  createdAt: string;
}

// Hooks
export function usePastPapers(params: {
  board?: string;
  class?: string;
  subject?: string;
  year?: number;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['pastPapers', params],
    queryFn: () => client.get('/past-papers', { params }).then(r => r.data),
  });
}

export function usePastPaper(id: string) {
  return useQuery({
    queryKey: ['pastPaper', id],
    queryFn: () => client.get(`/past-papers/${id}`).then(r => r.data.data),
    enabled: !!id,
  });
}

export function useUploadPastPaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      board: string;
      class: string;
      subject: string;
      year: number;
      fileUrl: string;
      fileName: string;
    }) => client.post('/past-papers', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pastPapers'] }),
  });
}

export function useUpdatePastPaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: {
      id: string;
      title?: string;
      board?: string;
      class?: string;
      subject?: string;
      year?: number;
    }) => client.patch(`/past-papers/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pastPapers'] }),
  });
}

export function useDeletePastPaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/past-papers/${id}`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pastPapers'] }),
  });
}
