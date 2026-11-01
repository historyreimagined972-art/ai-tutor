import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoards, useClasses, useSubjects, useTopics, useCreateBoard, useUpdateBoard, useDeleteBoard, useCreateClass, useUpdateClass, useDeleteClass, useCreateSubject, useUpdateSubject, useDeleteSubject, useCreateTopic, useUpdateTopic, useDeleteTopic } from '../../features/taxonomy/api';
import { useAuth } from '../../auth/AuthProvider';

export default function TaxonomyPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'boards' | 'classes' | 'subjects' | 'topics'>('boards');

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
            <h1 className="text-xl font-bold text-gray-900">Taxonomy Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container-mobile py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['boards', 'classes', 'subjects', 'topics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="container-mobile pb-8">
        {activeTab === 'boards' && <BoardsTab />}
        {activeTab === 'classes' && <ClassesTab />}
        {activeTab === 'subjects' && <SubjectsTab />}
        {activeTab === 'topics' && <TopicsTab />}
      </main>
    </div>
  );
}

function BoardsTab() {
  const { data, isLoading } = useBoards();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [province, setProvince] = useState('Punjab');
  const [districts, setDistricts] = useState('');
  const createBoard = useCreateBoard();
  const updateBoard = useUpdateBoard();
  const deleteBoard = useDeleteBoard();

  const handleSubmit = async () => {
    if (!name.trim() || !code.trim()) return;
    const districtList = districts.split(',').map(d => d.trim()).filter(Boolean);
    
    if (editId) {
      await updateBoard.mutateAsync({ id: editId, name, code, country, province, districts: districtList });
    } else {
      await createBoard.mutateAsync({ name, code, country, province, districts: districtList });
    }
    
    setShowAdd(false);
    setEditId(null);
    setName('');
    setCode('');
    setCountry('Pakistan');
    setProvince('Punjab');
    setDistricts('');
  };

  const handleEdit = (board: any) => {
    setEditId(board._id);
    setName(board.name);
    setCode(board.code || '');
    setCountry(board.country);
    setProvince(board.province || 'Punjab');
    setDistricts(board.districts?.join(', ') || '');
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this board? This will also delete all related classes, subjects, and topics.')) {
      await deleteBoard.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Boards</h2>
        <button
          onClick={() => {
            setShowAdd(true);
            setEditId(null);
            setName('');
            setCode('');
            setCountry('Pakistan');
            setProvince('Punjab');
            setDistricts('');
          }}
          className="btn-primary text-sm"
        >
          Add Board
        </button>
      </div>

      {showAdd && (
        <div className="card">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Board name (e.g. Lahore Board)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Board code (e.g. BISELAHORE)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="input"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input"
              />
              <input
                type="text"
                placeholder="Province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="input"
              />
            </div>
            <textarea
              placeholder="Districts (comma-separated, e.g. Lahore, Kasur, Sheikhupura)"
              value={districts}
              onChange={(e) => setDistricts(e.target.value)}
              className="input"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={createBoard.isPending || updateBoard.isPending}
                className="btn-primary text-sm"
              >
                {editId ? 'Update' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setEditId(null);
                  setName('');
                  setCode('');
                  setCountry('Pakistan');
                  setProvince('Punjab');
                  setDistricts('');
                }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {data?.data?.map((board: any) => (
          <div key={board._id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{board.name}</p>
                <p className="text-sm text-gray-600">{board.code} • {board.province || board.country}</p>
                {board.districts?.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Districts: {board.districts.join(', ')}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(board)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(board._id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassesTab() {
  const { data: boards } = useBoards();
  const { data, isLoading } = useClasses();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [boardId, setBoardId] = useState('');
  const [grade, setGrade] = useState<number>(9);
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const handleSubmit = async () => {
    if (!name.trim() || !boardId) return;
    
    if (editId) {
      await updateClass.mutateAsync({ id: editId, name, board: boardId, grade });
    } else {
      await createClass.mutateAsync({ name, board: boardId, grade });
    }
    
    setShowAdd(false);
    setEditId(null);
    setName('');
    setBoardId('');
    setGrade(9);
  };

  const handleEdit = (cls: any) => {
    setEditId(cls._id);
    setName(cls.name);
    setBoardId(cls.board?._id || '');
    setGrade(cls.grade);
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this class? This will also delete all related subjects and topics.')) {
      await deleteClass.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Classes</h2>
        <button
          onClick={() => {
            setShowAdd(true);
            setEditId(null);
            setName('');
            setBoardId(boards?.data?.[0]?._id || '');
            setGrade(9);
          }}
          className="btn-primary text-sm"
        >
          Add Class
        </button>
      </div>

      {showAdd && (
        <div className="card">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Class name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
            <select
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              className="input"
            >
              <option value="">Select Board</option>
              {boards?.data?.map((board: any) => (
                <option key={board._id} value={board._id}>{board.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Grade"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              min={1}
              max={12}
              className="input"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={createClass.isPending || updateClass.isPending}
                className="btn-primary text-sm"
              >
                {editId ? 'Update' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setEditId(null);
                  setName('');
                  setBoardId('');
                  setGrade(9);
                }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {data?.data?.map((cls: any) => (
          <div key={cls._id} className="card flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">{cls.name}</p>
              <p className="text-sm text-gray-600">Grade {cls.grade} • {cls.board?.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(cls)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cls._id)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubjectsTab() {
  const { data: classes } = useClasses();
  const { data, isLoading } = useSubjects(undefined, 1, 200);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [code, setCode] = useState('');
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const handleSubmit = async () => {
    if (!name.trim() || !classId) return;
    
    if (editId) {
      await updateSubject.mutateAsync({ id: editId, name, class: classId, code: code || undefined });
    } else {
      await createSubject.mutateAsync({ name, class: classId, code: code || undefined });
    }
    
    setShowAdd(false);
    setEditId(null);
    setName('');
    setClassId('');
    setCode('');
  };

  const handleEdit = (subject: any) => {
    setEditId(subject._id);
    setName(subject.name);
    setClassId(subject.class?._id || '');
    setCode(subject.code || '');
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subject? This will also delete all related topics.')) {
      await deleteSubject.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Subjects</h2>
        <button
          onClick={() => {
            setShowAdd(true);
            setEditId(null);
            setName('');
            setClassId(classes?.data?.[0]?._id || '');
            setCode('');
          }}
          className="btn-primary text-sm"
        >
          Add Subject
        </button>
      </div>

      {showAdd && (
        <div className="card">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Subject name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="input"
            >
              <option value="">Select Class</option>
              {classes?.data?.map((cls: any) => (
                <option key={cls._id} value={cls._id}>{cls.name} (Grade {cls.grade})</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Subject code (optional)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={createSubject.isPending || updateSubject.isPending}
                className="btn-primary text-sm"
              >
                {editId ? 'Update' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setEditId(null);
                  setName('');
                  setClassId('');
                  setCode('');
                }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {(() => {
          const byGrade = new Map<number, Map<string, any>>();
          for (const subject of data?.data || []) {
            const grade = subject.class?.grade || 0;
            if (!byGrade.has(grade)) byGrade.set(grade, new Map());
            const gradeMap = byGrade.get(grade)!;
            if (!gradeMap.has(subject.name)) {
              gradeMap.set(subject.name, { ...subject, count: 1 });
            } else {
              gradeMap.get(subject.name).count++;
            }
          }
          return Array.from(byGrade.entries())
            .sort(([a], [b]) => a - b)
            .map(([grade, subjects]) => (
              <div key={grade}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{grade === 9 ? '9th Class' : grade === 10 ? '10th Class' : `Grade ${grade}`}</h3>
                <div className="space-y-2">
                  {Array.from(subjects.values()).map((subject) => (
                    <div key={subject._id} className="card flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{subject.name}</p>
                        <p className="text-sm text-gray-600">{subject.code || 'No code'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subject._id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ));
        })()}
      </div>
    </div>
  );
}

function TopicsTab() {
  const { data: subjects } = useSubjects(undefined, 1, 200);
  const { data, isLoading } = useTopics();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(0);
  const createTopic = useCreateTopic();
  const updateTopic = useUpdateTopic();
  const deleteTopic = useDeleteTopic();

  const handleSubmit = async () => {
    if (!name.trim() || !subjectId) return;
    
    if (editId) {
      await updateTopic.mutateAsync({ id: editId, name, subject: subjectId, description: description || undefined, order });
    } else {
      await createTopic.mutateAsync({ name, subject: subjectId, description: description || undefined, order });
    }
    
    setShowAdd(false);
    setEditId(null);
    setName('');
    setSubjectId('');
    setDescription('');
    setOrder(0);
  };

  const handleEdit = (topic: any) => {
    setEditId(topic._id);
    setName(topic.name);
    setSubjectId(topic.subject?._id || '');
    setDescription(topic.description || '');
    setOrder(topic.order || 0);
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this topic?')) {
      await deleteTopic.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Topics</h2>
        <button
          onClick={() => {
            setShowAdd(true);
            setEditId(null);
            setName('');
            setSubjectId(subjects?.data?.[0]?._id || '');
            setDescription('');
            setOrder(0);
          }}
          className="btn-primary text-sm"
        >
          Add Topic
        </button>
      </div>

      {showAdd && (
        <div className="card">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Topic name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="input"
            >
              <option value="">Select Subject</option>
              {subjects?.data?.map((subject: any) => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </select>
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={2}
            />
            <input
              type="number"
              placeholder="Order"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="input"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={createTopic.isPending || updateTopic.isPending}
                className="btn-primary text-sm"
              >
                {editId ? 'Update' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setEditId(null);
                  setName('');
                  setSubjectId('');
                  setDescription('');
                  setOrder(0);
                }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {data?.data?.map((topic: any) => (
          <div key={topic._id} className="card flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">{topic.name}</p>
              <p className="text-sm text-gray-600">{topic.subject?.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(topic)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(topic._id)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
