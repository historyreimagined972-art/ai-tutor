import { useParams, Link } from 'react-router-dom';
import { useAttempt } from '../features/tests/api';
import { useAuth } from '../auth/AuthProvider';

export default function TestResultPage() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { data: attempt, isLoading } = useAttempt(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Result not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-mobile py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/tests" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Test Result</h1>
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
        {/* Score Card */}
        <div className="card mb-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{attempt.test.title}</h2>
          
          <div className="mb-4">
            <div className="text-5xl font-bold text-blue-600">
              {attempt.percentage.toFixed(1)}%
            </div>
            <p className="text-gray-600 mt-2">
              {attempt.totalScore} / {attempt.maxScore} marks
            </p>
          </div>

          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(attempt.status)}`}>
            {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
          </span>

          {attempt.gradedAt && (
            <p className="text-sm text-gray-500 mt-2">
              Graded on {new Date(attempt.gradedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Answers */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answers</h3>
        <div className="space-y-4">
          {attempt.answers.map((answer: any, index: number) => {
            const question = attempt.test.questions.find((q: any) => q.number === answer.questionNumber);
            return (
              <div key={index} className="card">
                <div className="flex items-start gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    Q{answer.questionNumber}
                  </span>
                  <span className="text-sm text-gray-500">
                    {answer.maxScore} marks
                  </span>
                  {answer.score !== undefined && (
                    <span className={`ml-auto px-2 py-1 rounded text-sm font-medium ${
                      answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {answer.score}/{answer.maxScore}
                    </span>
                  )}
                </div>

                <p className="text-gray-900 mb-2">{question?.question}</p>

                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                  <p className="text-gray-800">{answer.studentAnswer || 'No answer provided'}</p>
                </div>

                {answer.feedback && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-700 mb-1">Feedback:</p>
                    <p className="text-blue-800">{answer.feedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2">
          <Link to="/tests" className="btn-primary block text-center">
            Take Another Test
          </Link>
          <Link to="/" className="btn-secondary block text-center">
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
