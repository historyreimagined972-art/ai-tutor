import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../../lib/api/client';

// Types
export interface Board {
  _id: string;
  name: string;
  code: string;
  country: string;
  province: string;
  districts: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  _id: string;
  name: string;
  board: Board;
  grade: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  _id: string;
  name: string;
  class: Class;
  code?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  _id: string;
  name: string;
  subject: Subject;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Board hooks
export function useBoards(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['boards', page, limit],
    queryFn: () => client.get('/taxonomy/boards', { params: { page, limit } }).then(r => r.data),
  });
}

export function useCreateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code: string; country?: string; province?: string; districts?: string[] }) =>
      client.post('/taxonomy/boards', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['boards'] }),
  });
}

export function useUpdateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; code?: string; country?: string; province?: string; districts?: string[]; isActive?: boolean }) =>
      client.patch(`/taxonomy/boards/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['boards'] }),
  });
}

export function useDeleteBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/taxonomy/boards/${id}`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['boards'] }),
  });
}

// Class hooks
export function useClasses(boardId?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['classes', boardId, page, limit],
    queryFn: () => client.get('/taxonomy/classes', { params: { board: boardId, page, limit } }).then(r => r.data),
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; board: string; grade: number }) =>
      client.post('/taxonomy/classes', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; board?: string; grade?: number; isActive?: boolean }) =>
      client.patch(`/taxonomy/classes/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/taxonomy/classes/${id}`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });
}

// Subject hooks
export function useSubjects(classId?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['subjects', classId, page, limit],
    queryFn: () => client.get('/taxonomy/subjects', { params: { class: classId, page, limit } }).then(r => r.data),
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; class: string; code?: string }) =>
      client.post('/taxonomy/subjects', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; class?: string; code?: string; isActive?: boolean }) =>
      client.patch(`/taxonomy/subjects/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/taxonomy/subjects/${id}`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  });
}

// Topic hooks
export function useTopics(subjectId?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['topics', subjectId, page, limit],
    queryFn: () => client.get('/taxonomy/topics', { params: { subject: subjectId, page, limit } }).then(r => r.data),
  });
}

export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; subject: string; description?: string; order?: number }) =>
      client.post('/taxonomy/topics', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['topics'] }),
  });
}

export function useUpdateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; subject?: string; description?: string; order?: number; isActive?: boolean }) =>
      client.patch(`/taxonomy/topics/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['topics'] }),
  });
}

export function useDeleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/taxonomy/topics/${id}`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['topics'] }),
  });
}

// Taxonomy tree
export function useTaxonomyTree(boardId?: string, classId?: string, subjectId?: string) {
  return useQuery({
    queryKey: ['taxonomyTree', boardId, classId, subjectId],
    queryFn: () => client.get('/taxonomy/tree', { params: { board: boardId, class: classId, subject: subjectId } }).then(r => r.data.data),
  });
}
