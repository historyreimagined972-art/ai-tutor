import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoards, useClasses, useSubjects } from '../features/taxonomy/api';
import { useSearchVideos } from '../features/videos/api';
import { useAuth } from '../auth/AuthProvider';

export default function VideosPage() {
  const { user, logout } = useAuth();
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const { data: boardsData, isLoading: boardsLoading } = useBoards(1, 50);
  const { data: classesData, isLoading: classesLoading } = useClasses(selectedBoard || undefined, 1, 50);
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects(selectedClass || undefined, 1, 200);

  const boards = boardsData?.data || [];
  const classes = classesData?.data || [];
  const selectedClassGrade = classes.find((c: any) => c._id === selectedClass)?.grade;
  const { data: searchResults, isLoading: searchLoading, refetch } = useSearchVideos(activeQuery, selectedSubject || undefined, selectedClassGrade);
  const subjects = (() => {
    const seen = new Map<string, any>();
    for (const s of subjectsData?.data || []) {
      if (!seen.has(s.name)) seen.set(s.name, s);
    }
    return Array.from(seen.values());
  })();

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setActiveQuery(searchQuery.trim());
    refetch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (boardsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container-mobile py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Video Lessons</h1>
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
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
            <select
              value={selectedBoard}
              onChange={(e) => {
                setSelectedBoard(e.target.value);
                setSelectedClass('');
                setSelectedSubject('');
              }}
              className="input"
            >
              <option value="">Select Board</option>
              {boards.map((board: any) => (
                <option key={board._id} value={board._id}>{board.name} ({board.code})</option>
              ))}
            </select>
          </div>

          {selectedBoard && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              {classesLoading ? (
                <div className="text-sm text-gray-500 py-2">Loading classes...</div>
              ) : (
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSubject('');
                  }}
                  className="input"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls: any) => (
                    <option key={cls._id} value={cls._id}>{cls.name} (Grade {cls.grade})</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {selectedClass && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              {subjectsLoading ? (
                <div className="text-sm text-gray-500 py-2">Loading subjects...</div>
              ) : (
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="input"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject: any) => (
                    <option key={subject._id} value={subject._id}>{subject.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {selectedSubject && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What do you want to learn?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. What is equilibrium?"
                  className="input flex-1"
                />
                <button onClick={handleSearch} className="btn-primary">
                  Search
                </button>
              </div>
            </div>
          )}
        </div>

        {searchLoading && (
          <div className="text-center py-8">
            <div className="spinner mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Searching videos...</p>
          </div>
        )}

        {!searchLoading && activeQuery && searchResults && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {searchResults.length} video(s) found for "{activeQuery}"
            </h2>

            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No videos found. Try a different search term.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((video: any) => (
                  <div key={video._id}>
                    {playingVideoId === video.youtubeVideoId ? (
                      <div className="card p-0 overflow-hidden">
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${video.youtubeVideoId}?autoplay=1`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900">{video.title}</h3>
                          <p className="text-sm text-gray-600">{video.channel?.name}</p>
                          <button
                            onClick={() => setPlayingVideoId(null)}
                            className="mt-2 text-sm text-gray-600 hover:text-gray-900"
                          >
                            Close video
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="card cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setPlayingVideoId(video.youtubeVideoId)}
                      >
                        <div className="flex gap-4">
                          <div className="w-40 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                            {video.thumbnailUrl ? (
                              <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 line-clamp-2">{video.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{video.channel?.name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!activeQuery && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600">Select board, class, and subject, then type your question to find videos</p>
          </div>
        )}
      </main>
    </div>
  );
}
