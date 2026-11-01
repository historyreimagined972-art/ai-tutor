import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAttempt, useSubmitAttempt, useGradeAttempt } from '../features/tests/api';
import { useAuth } from '../auth/AuthProvider';

export default function TakeTestPage() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: attempt, isLoading } = useAttempt(id || '');
  const submitAttempt = useSubmitAttempt();
  const gradeAttempt = useGradeAttempt();

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    if (attempt?.answers) {
      const initialAnswers: Record<number, string> = {};
      attempt.answers.forEach((a: any) => {
        initialAnswers[a.questionNumber] = a.studentAnswer || '';
      });
      setAnswers(initialAnswers);
    }
  }, [attempt]);

  const handleAnswerChange = (questionNumber: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionNumber]: answer }));
  };

  const handleSubmit = async () => {
    if (!attempt) return;

    const answersArray = Object.entries(answers).map(([num, answer]) => ({
      questionNumber: parseInt(num),
      type: attempt.test.questions.find((q: any) => q.number === parseInt(num))?.type || 'mcq',
      studentAnswer: answer,
    }));

    const answeredCount = answersArray.filter(a => a.studentAnswer.trim() !== '').length;
    const totalCount = answersArray.length;
    const unanswered = totalCount - answeredCount;

    if (answeredCount === 0) {
      if (!confirm('You have not answered any questions. Submit blank test?')) return;
    } else if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`)) return;
    }

    try {
      const result = await submitAttempt.mutateAsync({
        attemptId: attempt._id,
        answers: answersArray,
      });
      // Auto-grade subjective answers if any
      const hasSubjective = answersArray.some(a => a.type === 'short' || a.type === 'long');
      if (hasSubjective) {
        setIsGrading(true);
        try {
          await gradeAttempt.mutateAsync(result._id);
        } catch { /* grading may fail, that's ok */ }
      }
      navigate(`/tests/result/${result._id}`);
    } catch (error: any) {
      setIsGrading(false);
      const msg = error?.response?.data?.error?.message || error?.message || 'Failed to submit test';
      alert(msg);
    }
  };

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
        <p className="text-gray-600">Test not found</p>
      </div>
    );
  }

  const questions = attempt.test.questions || [];
  const question = questions[currentQuestion];

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
            <h1 className="text-xl font-bold text-gray-900">{attempt.test.title}</h1>
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
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{attempt.test.totalMarks} marks</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        {question && (
          <div className="card mb-6">
            <div className="flex items-start gap-2 mb-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                Q{question.number}
              </span>
              <span className="text-sm text-gray-500">({question.marks} marks)</span>
            </div>

            <p className="text-gray-900 mb-4">{question.question}</p>

            {/* Answer Input */}
            {question.type === 'mcq' && question.options ? (
              <div className="space-y-2">
                {question.options.map((option: string, index: number) => (
                  <label
                    key={index}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      answers[question.number] === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.number}`}
                      value={option}
                      checked={answers[question.number] === option}
                      onChange={(e) => handleAnswerChange(question.number, e.target.value)}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[question.number] || ''}
                onChange={(e) => handleAnswerChange(question.number, e.target.value)}
                placeholder="Write your answer here..."
                className="input min-h-[150px]"
                rows={6}
              />
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="btn-secondary flex-1"
          >
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitAttempt.isPending}
              className="btn-primary flex-1"
            >
              {submitAttempt.isPending ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              className="btn-primary flex-1"
            >
              Next
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Questions:</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q: any, index: number) => (
              <button
                key={q.number}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg text-sm font-medium ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[q.number]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {q.number}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Grading overlay */}
      {isGrading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4">
            <div className="spinner mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">AI is grading your answers...</h3>
            <p className="text-sm text-gray-600">This may take up to a minute. Please don't close this page.</p>
          </div>
        </div>
      )}
    </div>
  );
}
