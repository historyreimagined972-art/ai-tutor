import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGenerateTest } from '../features/tests/api';
import { useBoards, useClasses, useSubjects } from '../features/taxonomy/api';
import { useAuth } from '../auth/AuthProvider';

export default function GenerateTestPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topics, setTopics] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<('mcq' | 'short' | 'long')[]>(['mcq', 'short']);

  const { data: boardsData } = useBoards(1, 50);
  const { data: classesData } = useClasses(selectedBoard || undefined, 1, 50);
  const { data: subjectsData } = useSubjects(selectedClass || undefined, 1, 200);
  const generateTest = useGenerateTest();

  const boards = boardsData?.data || [];
  const classes = classesData?.data || [];
  const subjects = (() => {
    const seen = new Map<string, any>();
    for (const s of subjectsData?.data || []) {
      if (!seen.has(s.name)) seen.set(s.name, s);
    }
    return Array.from(seen.values());
  })();

  const selectedClassName = classes.find((c: any) => c._id === selectedClass)?.name || '';
  const selectedSubjectName = subjects.find((s: any) => s._id === selectedSubject)?.name || '';

  const toggleType = (type: 'mcq' | 'short' | 'long') => {
    setQuestionTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    if (!topics.trim()) return;

    const topicList = topics.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const test = await generateTest.mutateAsync({
        topics: topicList,
        difficulty,
        numQuestions,
        questionTypes,
        board: selectedClassName || undefined,
        classLevel: selectedClassName || undefined,
        subject: selectedSubjectName || undefined,
      });
      navigate(`/tests/${test._id}`);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to generate test');
    }
  };

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
            <h1 className="text-xl font-bold text-gray-900">Generate Practice Test</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900">Sign out</button>
          </div>
        </div>
      </header>

      <main className="container-mobile py-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
            <select value={selectedBoard} onChange={e => { setSelectedBoard(e.target.value); setSelectedClass(''); setSelectedSubject(''); }} className="input">
              <option value="">Select Board</option>
              {boards.map((b: any) => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
            </select>
          </div>

          {selectedBoard && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSubject(''); }} className="input">
                <option value="">Select Class</option>
                {classes.map((c: any) => <option key={c._id} value={c._id}>{c.name} (Grade {c.grade})</option>)}
              </select>
            </div>
          )}

          {selectedClass && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="input">
                <option value="">Select Subject</option>
                {subjects.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topics (comma separated)</label>
            <input
              type="text"
              value={topics}
              onChange={e => setTopics(e.target.value)}
              placeholder="e.g. Chemical Bonding, Acids and Bases, Organic Chemistry"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition ${
                    difficulty === d
                      ? d === 'easy' ? 'bg-green-600 text-white' : d === 'medium' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions: {numQuestions}</label>
            <input
              type="range"
              min={5}
              max={30}
              value={numQuestions}
              onChange={e => setNumQuestions(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Types</label>
            <div className="flex gap-2">
              {(['mcq', 'short', 'long'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition ${
                    questionTypes.includes(t)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t === 'mcq' ? 'MCQ' : t === 'short' ? 'Short' : 'Long'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topics.trim() || generateTest.isPending}
            className="btn-primary w-full py-3 text-base"
          >
            {generateTest.isPending ? 'Generating... This may take up to a minute' : 'Generate Test'}
          </button>
          {generateTest.isPending && (
            <p className="text-sm text-gray-500 text-center mt-2">
              AI is creating your questions. Please wait...
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
