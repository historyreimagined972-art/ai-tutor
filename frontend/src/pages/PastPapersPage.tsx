import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTaxonomyTree } from '../features/taxonomy/api';
import { usePastPapers } from '../features/pastpapers/api';
import { useAuth } from '../auth/AuthProvider';

export default function PastPapersPage() {
  const { user, logout } = useAuth();
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | undefined>();

  const { data: taxonomy, isLoading: taxonomyLoading } = useTaxonomyTree();
  const { data: papers, isLoading: papersLoading } = usePastPapers({
    board: selectedBoard || undefined,
    class: selectedClass || undefined,
    subject: selectedSubject || undefined,
    year: selectedYear,
  });

  const boards = taxonomy || [];
  const classes = boards.find((b: any) => b._id === selectedBoard)?.classes || [];
  const subjects = classes.find((c: any) => c._id === selectedClass)?.subjects || [];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  if (taxonomyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const backLink = user?.role === 'admin' ? '/admin' : '/';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-mobile py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to={backLink} className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Past Papers</h1>
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
        {/* Filters */}
        <div className="space-y-4 mb-6">
          {/* Board Selector */}
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
              <option value="">All Boards</option>
              {boards.map((board: any) => (
                <option key={board._id} value={board._id}>{board.name}</option>
              ))}
            </select>
          </div>

          {/* Class Selector */}
          {selectedBoard && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSubject('');
                }}
                className="input"
              >
                <option value="">All Classes</option>
                {classes.map((cls: any) => (
                  <option key={cls._id} value={cls._id}>{cls.name} (Grade {cls.grade})</option>
                ))}
              </select>
            </div>
          )}

          {/* Subject Selector */}
          {selectedClass && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject: any) => (
                  <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Year Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : undefined)}
              className="input"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Papers List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {papersLoading ? 'Loading papers...' : `${papers?.data?.length || 0} paper(s) found`}
          </h2>

          {papersLoading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
            </div>
          ) : papers?.data?.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <p className="text-gray-600">No past papers found for the selected filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {papers?.data?.map((paper: any) => (
                <div key={paper._id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{paper.title}</h3>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                      {paper.year}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                    {paper.board?.name && <span>{paper.board.name}</span>}
                    {paper.class?.name && <span>• {paper.class.name}</span>}
                    {paper.subject?.name && <span>• {paper.subject.name}</span>}
                  </div>

                  <a
                    href={paper.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm inline-block"
                  >
                    Download PDF
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
