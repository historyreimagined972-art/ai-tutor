import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAskDoubt } from '../features/doubts/api';
import { useAuth } from '../auth/AuthProvider';

export default function DoubtsPage() {
  const { user, logout } = useAuth();
  const [transcript, setTranscript] = useState('');
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    question: string;
    answer: string;
    isGroundedInTranscript: boolean;
  }>>([]);

  const askDoubt = useAskDoubt();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim() || !question.trim()) return;

    const result = await askDoubt.mutateAsync({ transcript, question });
    setChatHistory(prev => [...prev, result]);
    setQuestion(''); // Clear question but keep transcript
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
            <h1 className="text-xl font-bold text-gray-900">Doubt Clearing</h1>
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
        {/* Transcript Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste Video Transcript
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste the transcript from a video lesson here..."
            className="input min-h-[150px]"
            rows={6}
          />
          <p className="mt-1 text-sm text-gray-500">
            Copy the transcript from a video lesson to ask questions about it
          </p>
        </div>

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Questions & Answers</h2>
            {chatHistory.map((item, index) => (
              <div key={index} className="space-y-3">
                {/* Question */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[85%]">
                    <p className="text-sm">{item.question}</p>
                  </div>
                </div>
                {/* Answer */}
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 max-w-[85%]">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.answer}</p>
                    {!item.isGroundedInTranscript && (
                      <p className="mt-2 text-xs text-amber-600">
                        ⚠️ This answer includes general knowledge not found in the transcript
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Question Input */}
        <div className="sticky bottom-0 bg-gray-50 pt-4 pb-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the transcript..."
              className="input flex-1"
              disabled={!transcript.trim() || askDoubt.isPending}
            />
            <button
              type="submit"
              disabled={!transcript.trim() || !question.trim() || askDoubt.isPending}
              className="btn-primary"
            >
              {askDoubt.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="spinner w-4 h-4"></div>
                  Asking...
                </span>
              ) : (
                'Ask'
              )}
            </button>
          </form>
        </div>

        {/* Empty State */}
        {chatHistory.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600">Paste a transcript and ask your first question</p>
          </div>
        )}
      </main>
    </div>
  );
}
