import { Link, useNavigate } from 'react-router-dom';
import { useTests, useStartAttempt, useDownloadTestPDF } from '../features/tests/api';
import { useAuth } from '../auth/AuthProvider';

export default function TestsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useTests();
  const startAttempt = useStartAttempt();
  const downloadPDF = useDownloadTestPDF();

  const handleStartTest = async (testId: string) => {
    try {
      const attempt = await startAttempt.mutateAsync(testId);
      navigate(`/tests/take/${attempt._id}`);
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-mobile py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Practice Tests</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/tests/generate" className="btn-primary text-sm">Generate Test</Link>
            <Link to="/tests/attempts" className="text-sm text-blue-600 hover:text-blue-700">My Attempts</Link>
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-mobile py-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="spinner mx-auto"></div>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 mb-4">No tests available yet</p>
            <Link to="/tests/generate" className="btn-primary">Generate Your First Test</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.data?.map((test: any) => (
              <div key={test._id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{test.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                    {test.difficulty}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {test.topics?.map((t: any) => t.name).join(', ') || 'Multiple topics'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>{test.questions?.length || 0} questions</span>
                  <span>{test.totalMarks} marks</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartTest(test._id)}
                    disabled={startAttempt.isPending}
                    className="btn-primary flex-1"
                  >
                    {startAttempt.isPending ? 'Starting...' : 'Start Test'}
                  </button>
                  <button
                    onClick={() => downloadPDF.mutate(test._id)}
                    disabled={downloadPDF.isPending}
                    className="btn-secondary"
                  >
                    {downloadPDF.isPending ? 'Generating...' : 'Download PDF'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Attempts Section */}
        <div className="mt-8">
          <Link to="/tests/attempts" className="text-blue-600 hover:text-blue-700 font-medium">
            View My Past Attempts →
          </Link>
        </div>
      </main>
    </div>
  );
}
