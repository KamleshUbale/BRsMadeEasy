
import React, { useState } from 'react';
import { WorkspaceProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import CreateResolution from './pages/CreateResolution';
import CreateTemplate from './pages/CreateTemplate';
import ResolutionList from './pages/ResolutionList';
import ClientProfiles from './pages/ClientProfiles';
import AdminPanel from './pages/AdminPanel';
import Layout from './components/Layout';
import { ResolutionData } from './types';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'create' | 'template-builder' | 'list' | 'clients' | 'admin'>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editingResolution, setEditingResolution] = useState<ResolutionData | null>(null);

  const navigateToCreate = (clientId?: string) => {
    setSelectedClientId(clientId || null);
    setEditingResolution(null);
    setCurrentPage('create');
  };

  const handleEditResolution = (res: ResolutionData) => {
    setEditingResolution(res);
    setCurrentPage('create');
  };

  return (
    <Layout activePage={currentPage} onNavigate={(page) => { 
      setCurrentPage(page); 
      setSelectedClientId(null); 
      setEditingResolution(null);
    }}>
      {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
      {currentPage === 'create' && (
        <CreateResolution 
          initialClientId={selectedClientId} 
          editResolution={editingResolution}
          onComplete={() => { 
            setCurrentPage('list'); 
            setSelectedClientId(null); 
            setEditingResolution(null);
          }} 
        />
      )}
      {currentPage === 'template-builder' && <CreateTemplate onComplete={() => setCurrentPage('create')} />}
      {currentPage === 'list' && <ResolutionList onEdit={handleEditResolution} />}
      {currentPage === 'clients' && <ClientProfiles onDraftResolution={navigateToCreate} />}
      {currentPage === 'admin' && <AdminPanel />}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
};

export default App;
