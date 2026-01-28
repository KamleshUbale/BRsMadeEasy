import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateResolution from './pages/CreateResolution';
import CreateTemplate from './pages/CreateTemplate';
import ResolutionList from './pages/ResolutionList';
import AdminPanel from './pages/AdminPanel';
import ClientProfiles from './pages/ClientProfiles';
import Layout from './components/Layout';

const AppContent: React.FC = () => {
  const { isAuthenticated, isAdmin, canCreateTemplate } = useAuth();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'create' | 'template-builder' | 'list' | 'admin' | 'clients'>('dashboard');

  if (!isAuthenticated) {
    return <Landing />;
  }

  // Route Guards
  if (currentPage === 'admin' && !isAdmin) {
     setCurrentPage('dashboard');
  }

  if (currentPage === 'template-builder' && !canCreateTemplate) {
     setCurrentPage('dashboard');
  }

  return (
    <Layout activePage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
      {currentPage === 'create' && <CreateResolution onComplete={() => setCurrentPage('list')} />}
      {currentPage === 'template-builder' && <CreateTemplate onComplete={() => setCurrentPage('create')} />}
      {currentPage === 'list' && <ResolutionList />}
      {currentPage === 'clients' && <ClientProfiles />}
      {currentPage === 'admin' && isAdmin && <AdminPanel />}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;