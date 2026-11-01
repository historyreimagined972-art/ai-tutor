import { Link } from 'react-router-dom';
import { useMyAttempts } from '../features/tests/api';
import { useAuth } from '../auth/AuthProvider';

export default function AttemptsPage() {
  const { user, logout } = useAuth();
  const { data, isLoading } = useMyAttempts(1, 50);

  const attempts = data?.data || [];

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
            <h1 className="text-xl font-bold text-gray-900">My Attempts</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900">Sign out</button>
          </div>
        </div>
      </header>

      <main className="container-mobile py-6">
        {isLoading ? (
          <div className="text-center py-8"><div className="spinner mx-auto"></div></div>
        ) : attempts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You haven't taken any tests yet.</p>
            <Link to="/tests" className="btn-primary">Take a Test</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt: any) => (
              <Link
                key={attempt._id}
                to={`/tests/result/${attempt._id}`}
                className="card block hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{attempt.test?.title || 'Test'}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {attempt.test?.subject || ''} {attempt.test?.classLevel ? `• ${attempt.test.classLevel}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      attempt.percentage >= 80 ? 'text-green-600' :
                      attempt.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {attempt.percentage}%
                    </div>
                    <p className="text-xs text-gray-500">{attempt.totalScore}/{attempt.maxScore}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    attempt.status === 'graded' ? 'bg-green-100 text-green-700' :
                    attempt.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {attempt.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
