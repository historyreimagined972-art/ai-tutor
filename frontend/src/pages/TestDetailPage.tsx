import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTest, useStartAttempt } from '../features/tests/api';
import { useAuth } from '../auth/AuthProvider';

export default function TestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: test, isLoading } = useTest(id || '');
  const startAttempt = useStartAttempt();

  const handleStart = async () => {
    if (!test) return;
    try {
      const attempt = await startAttempt.mutateAsync(test._id);
      navigate(`/tests/take/${attempt._id}`);
    } catch {
      alert('Failed to start test');
    }
  };

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Test not found</p>
        <Link to="/tests" className="btn-primary">Back to Tests</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container-mobile py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/tests" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Test Ready</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900">Sign out</button>
          </div>
        </div>
      </header>

      <main className="container-mobile py-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-800 font-medium">Your test has been generated successfully!</p>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-lg font-bold text-gray-900">{test.title}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(test.difficulty)}`}>
              {test.difficulty}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{test.instructions}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {test.topics?.map((t: any, i: number) => (
              <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {typeof t === 'string' ? t : t.name}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">{test.questions?.length || 0}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">{test.totalMarks}</div>
              <div className="text-sm text-gray-600">Total Marks</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">
                {test.questions?.filter((q: any) => q.type === 'mcq').length || 0}
              </div>
              <div className="text-sm text-gray-600">MCQs</div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Question Breakdown</h3>
            <div className="flex gap-4 text-sm">
              {test.questions?.some((q: any) => q.type === 'mcq') && (
                <span className="text-gray-600">
                  MCQ: {test.questions.filter((q: any) => q.type === 'mcq').length} questions
                </span>
              )}
              {test.questions?.some((q: any) => q.type === 'short') && (
                <span className="text-gray-600">
                  Short: {test.questions.filter((q: any) => q.type === 'short').length} questions
                </span>
              )}
              {test.questions?.some((q: any) => q.type === 'long') && (
                <span className="text-gray-600">
                  Long: {test.questions.filter((q: any) => q.type === 'long').length} questions
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={startAttempt.isPending}
            className="btn-primary w-full py-3 text-base"
          >
            {startAttempt.isPending ? 'Starting...' : 'Start Test'}
          </button>
        </div>
      </main>
    </div>
  );
}
