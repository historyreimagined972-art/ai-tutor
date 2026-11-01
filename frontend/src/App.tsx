import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthProvider';
import { RequireAuth, RequireAdmin } from './components/RequireAuth';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TaxonomyPage from './pages/admin/TaxonomyPage';
import ChannelsPage from './pages/admin/ChannelsPage';
import VideosPage from './pages/VideosPage';
import DoubtsPage from './pages/DoubtsPage';
import TestsPage from './pages/TestsPage';
import GenerateTestPage from './pages/GenerateTestPage';
import AttemptsPage from './pages/AttemptsPage';
import TakeTestPage from './pages/TakeTestPage';
import TestResultPage from './pages/TestResultPage';
import TestDetailPage from './pages/TestDetailPage';
import PastPapersPage from './pages/PastPapersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected student routes */}
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <DashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/videos"
                element={
                  <RequireAuth>
                    <VideosPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/doubts"
                element={
                  <RequireAuth>
                    <DoubtsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/tests"
                element={
                  <RequireAuth>
                    <TestsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/tests/generate"
                element={
                  <RequireAuth>
                    <GenerateTestPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/tests/:id"
                element={
                  <RequireAuth>
                    <TestDetailPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/tests/attempts"
                element={
                  <RequireAuth>
                    <AttemptsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/tests/take/:id"
                element={
                  <RequireAuth>
                    <TakeTestPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/tests/result/:id"
                element={
                  <RequireAuth>
                    <TestResultPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/past-papers"
                element={
                  <RequireAuth>
                    <PastPapersPage />
                  </RequireAuth>
                }
              />

              {/* Protected admin routes */}
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminDashboardPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/taxonomy"
                element={
                  <RequireAdmin>
                    <TaxonomyPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/channels"
                element={
                  <RequireAdmin>
                    <ChannelsPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/past-papers"
                element={
                  <RequireAdmin>
                    <PastPapersPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RequireAdmin>
                    <div className="min-h-screen bg-gray-50">
                      <header className="bg-white shadow-sm">
                        <div className="container-mobile py-4 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                              </svg>
                            </Link>
                            <h1 className="text-xl font-bold text-gray-900">User Management</h1>
                          </div>
                        </div>
                      </header>
                      <main className="container-mobile py-6">
                        <p className="text-gray-600">User management coming soon.</p>
                      </main>
                    </div>
                  </RequireAdmin>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
