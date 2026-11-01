import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../../lib/api/client';

// Types
export interface Channel {
  _id: string;
  name: string;
  youtubeChannelId?: string;
  youtubePlaylistId?: string;
  subject: {
    _id: string;
    name: string;
  };
  board?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Video {
  _id: string;
  youtubeVideoId: string;
  title: string;
  topic: {
    _id: string;
    name: string;
  };
  channel: {
    _id: string;
    name: string;
    youtubeChannelId: string;
  };
  transcript?: string;
  duration?: number;
  thumbnailUrl?: string;
  isApproved: boolean;
  createdAt: string;
}

// Channel hooks
export function useChannels(subjectId?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['channels', subjectId, page, limit],
    queryFn: () => client.get('/content/channels', { params: { subject: subjectId, page, limit } }).then(r => r.data),
  });
}

export function useCreateChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; youtubeChannelId?: string; youtubePlaylistId?: string; subject: string; board?: string }) =>
      client.post('/content/channels', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['channels'] }),
  });
}

export function useUpdateChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; subject?: string; isApproved?: boolean; youtubeChannelId?: string; youtubePlaylistId?: string; board?: string }) =>
      client.patch(`/content/channels/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['channels'] }),
  });
}

export function useDeleteChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/content/channels/${id}`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['channels'] }),
  });
}

export function useApproveChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.patch(`/content/channels/${id}/approve`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['channels'] }),
  });
}

// Video hooks
export function useVideos(topicId?: string, channelId?: string, subjectId?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['videos', topicId, channelId, subjectId, page, limit],
    queryFn: () => client.get('/content/videos', { params: { topic: topicId, channel: channelId, subject: subjectId, page, limit } }).then(r => r.data),
  });
}

export function useCreateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      youtubeVideoId: string;
      title: string;
      topic: string;
      channel: string;
      transcript?: string;
      duration?: number;
      thumbnailUrl?: string;
    }) => client.post('/content/videos', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['videos'] }),
  });
}

export function useUpdateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; topic?: string; transcript?: string; isApproved?: boolean }) =>
      client.patch(`/content/videos/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['videos'] }),
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/content/videos/${id}`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['videos'] }),
  });
}

export function useApproveVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.patch(`/content/videos/${id}/approve`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['videos'] }),
  });
}

// Student hooks
export function useVideosForStudent(topicId: string) {
  return useQuery({
    queryKey: ['studentVideos', topicId],
    queryFn: () => client.get(`/content/student/videos/${topicId}`).then(r => r.data.data),
    enabled: !!topicId,
  });
}

export function useSearchVideos(query: string, subjectId?: string, grade?: number) {
  return useQuery({
    queryKey: ['searchVideos', query, subjectId, grade],
    queryFn: () => client.get('/content/search', { params: { q: query, subject: subjectId, grade } }).then(r => r.data.data),
    enabled: false,
  });
}

export function useVideoTranscript(videoId: string) {
  return useQuery({
    queryKey: ['videoTranscript', videoId],
    queryFn: () => client.get(`/content/videos/${videoId}/transcript`).then(r => r.data.data),
    enabled: !!videoId,
  });
}

// YouTube auto-fetch hooks
export function useResolveYouTubeUrl() {
  return useMutation({
    mutationFn: (url: string) => client.post('/content/resolve-url', { url }).then(r => r.data.data),
  });
}

export function useFetchVideosFromYouTube() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { channelId: string; topicId?: string; maxResults?: number }) =>
      client.post('/content/fetch-videos', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['videos'] }),
  });
}
