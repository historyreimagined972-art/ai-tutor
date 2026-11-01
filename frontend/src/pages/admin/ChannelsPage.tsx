import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useChannels, useCreateChannel, useUpdateChannel, useDeleteChannel, useApproveChannel, useResolveYouTubeUrl, useFetchVideosFromYouTube } from '../../features/videos/api';
import { useSubjects, useTopics } from '../../features/taxonomy/api';
import { useAuth } from '../../auth/AuthProvider';

export default function ChannelsPage() {
  const { user, logout } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [youtubeChannelId, setYoutubeChannelId] = useState('');
  const [youtubePlaylistId, setYoutubePlaylistId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [board, setBoard] = useState('');
  const [linkType, setLinkType] = useState<'channel' | 'playlist'>('channel');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [resolving, setResolving] = useState(false);

  // Fetch videos state
  const [showFetch, setShowFetch] = useState<string | null>(null);
  const [fetchTopicId, setFetchTopicId] = useState('');
  const [fetchMaxResults, setFetchMaxResults] = useState(50);

  const { data: channelsData, isLoading } = useChannels(undefined, 1, 100);
  const { data: subjectsData } = useSubjects(undefined, 1, 200);
  const { data: topicsData } = useTopics(subjectId || undefined, 1, 100);
  const createChannel = useCreateChannel();
  const updateChannel = useUpdateChannel();
  const deleteChannel = useDeleteChannel();
  const approveChannel = useApproveChannel();
  const resolveUrl = useResolveYouTubeUrl();
  const fetchVideos = useFetchVideosFromYouTube();

  const channels = channelsData?.data || [];
  const subjects = (() => {
    const seen = new Map<string, any>();
    for (const s of subjectsData?.data || []) {
      if (!seen.has(s.name)) seen.set(s.name, s);
    }
    return Array.from(seen.values());
  })();
  const topics = topicsData?.data || [];

  const resetForm = () => {
    setShowAdd(false);
    setEditId(null);
    setName('');
    setYoutubeChannelId('');
    setYoutubePlaylistId('');
    setSubjectId('');
    setBoard('');
    setLinkType('channel');
    setYoutubeUrl('');
  };

  const handleResolveUrl = async () => {
    if (!youtubeUrl.trim()) return;
    setResolving(true);
    try {
      const result = await resolveUrl.mutateAsync(youtubeUrl);
      setName(result.name || '');
      if (result.type === 'channel') {
        setYoutubeChannelId(result.id);
        setYoutubePlaylistId('');
        setLinkType('channel');
      } else {
        setYoutubePlaylistId(result.id);
        setYoutubeChannelId('');
        setLinkType('playlist');
      }
      setYoutubeUrl('');
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Could not resolve URL. Please check the URL and try again.');
    } finally {
      setResolving(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !subjectId) return;
    if (linkType === 'channel' && !youtubeChannelId.trim()) return;
    if (linkType === 'playlist' && !youtubePlaylistId.trim()) return;

    const payload: any = {
      name,
      subject: subjectId,
      board: board || undefined,
    };

    if (linkType === 'channel') {
      payload.youtubeChannelId = youtubeChannelId;
    } else {
      payload.youtubePlaylistId = youtubePlaylistId;
    }

    if (editId) {
      await updateChannel.mutateAsync({ id: editId, ...payload });
    } else {
      await createChannel.mutateAsync(payload);
    }

    resetForm();
  };

  const handleEdit = (ch: any) => {
    setEditId(ch._id);
    setName(ch.name);
    setYoutubeChannelId(ch.youtubeChannelId || '');
    setYoutubePlaylistId(ch.youtubePlaylistId || '');
    setSubjectId(ch.subject?._id || '');
    setBoard(ch.board || '');
    setLinkType(ch.youtubePlaylistId ? 'playlist' : 'channel');
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this channel? All associated videos will also be deleted.')) {
      await deleteChannel.mutateAsync(id);
    }
  };

  const handleApprove = async (id: string) => {
    await approveChannel.mutateAsync(id);
  };

  const handleFetchVideos = async (channelId: string) => {
    try {
      const result = await fetchVideos.mutateAsync({
        channelId,
        topicId: fetchTopicId || undefined,
        maxResults: fetchMaxResults,
      });
      alert(`Done! ${result.created} videos added, ${result.skipped} already existed (${result.total} total found)`);
      setShowFetch(null);
      setFetchTopicId('');
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to fetch videos');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-mobile py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Channel Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-mobile py-6">
        {/* Add / Edit Form */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">YouTube Channels & Playlists</h2>
          <button
            onClick={() => {
              resetForm();
              setShowAdd(true);
            }}
            className="btn-primary text-sm"
          >
            Add Channel
          </button>
        </div>

        {showAdd && (
          <div className="card mb-6">
            <div className="space-y-3">
              {/* YouTube URL Paste */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Paste YouTube URL (auto-detect channel or playlist)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/channel/UCxxxx or /playlist?list=PLxxxx"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="input flex-1"
                  />
                  <button
                    onClick={handleResolveUrl}
                    disabled={resolving || !youtubeUrl.trim()}
                    className="btn-primary text-sm whitespace-nowrap"
                  >
                    {resolving ? 'Resolving...' : 'Resolve'}
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Channel/Playlist name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />

              {/* Link Type Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setLinkType('channel')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    linkType === 'channel' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  YouTube Channel
                </button>
                <button
                  onClick={() => setLinkType('playlist')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    linkType === 'playlist' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  YouTube Playlist
                </button>
              </div>

              {linkType === 'channel' ? (
                <input
                  type="text"
                  placeholder="YouTube Channel ID (e.g. UCxxxxxxx)"
                  value={youtubeChannelId}
                  onChange={(e) => setYoutubeChannelId(e.target.value)}
                  className="input"
                />
              ) : (
                <input
                  type="text"
                  placeholder="YouTube Playlist ID (e.g. PLxxxxxxx)"
                  value={youtubePlaylistId}
                  onChange={(e) => setYoutubePlaylistId(e.target.value)}
                  className="input"
                />
              )}

              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setFetchTopicId('');
                }}
                className="input"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject: any) => (
                  <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Board code (optional, e.g. BISELAHORE)"
                value={board}
                onChange={(e) => setBoard(e.target.value.toUpperCase())}
                className="input"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={createChannel.isPending || updateChannel.isPending}
                  className="btn-primary text-sm"
                >
                  {editId ? 'Update' : 'Save'}
                </button>
                <button onClick={resetForm} className="btn-secondary text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Channel List */}
        {channels.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-600">No channels or playlists added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {channels.map((ch: any) => (
              <div key={ch._id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{ch.name}</h3>
                      {ch.isApproved ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Approved</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pending</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{ch.subject?.name || 'Unknown Subject'}</p>
                    {ch.youtubeChannelId && (
                      <p className="text-xs text-gray-500 mt-1">Channel: {ch.youtubeChannelId}</p>
                    )}
                    {ch.youtubePlaylistId && (
                      <p className="text-xs text-gray-500 mt-1">Playlist: {ch.youtubePlaylistId}</p>
                    )}
                    {ch.board && (
                      <p className="text-xs text-gray-500">Board: {ch.board}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    {!ch.isApproved && (
                      <button
                        onClick={() => handleApprove(ch._id)}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => setShowFetch(showFetch === ch._id ? null : ch._id)}
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      Fetch Videos
                    </button>
                    <button
                      onClick={() => handleEdit(ch)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ch._id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Fetch Videos Panel */}
                {showFetch === ch._id && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-medium text-purple-800 mb-2">
                      Auto-fetch videos from {ch.youtubePlaylistId ? 'playlist' : 'channel'}
                    </p>
                    <div className="space-y-2">
                      <select
                        value={fetchTopicId}
                        onChange={(e) => setFetchTopicId(e.target.value)}
                        className="input text-sm"
                      >
                        <option value="">No topic (optional)</option>
                        {topics.map((topic: any) => (
                          <option key={topic._id} value={topic._id}>{topic.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Max videos (default 50)"
                        value={fetchMaxResults}
                        onChange={(e) => setFetchMaxResults(Number(e.target.value))}
                        min={1}
                        max={200}
                        className="input text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFetchVideos(ch._id)}
                          disabled={fetchVideos.isPending}
                          className="btn-primary text-sm"
                        >
                          {fetchVideos.isPending ? 'Fetching...' : 'Fetch Now'}
                        </button>
                        <button
                          onClick={() => { setShowFetch(null); setFetchTopicId(''); }}
                          className="btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
