import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/admin/Dashboard';
import { LandingPage } from './components/landing/LandingPage';
import { TestWizard } from './components/admin/TestWizard';
import { TestAnalyticsModal } from './components/admin/TestAnalyticsModal';
import { StudentPortal } from './components/student/StudentPortal';
import { MockTest } from './types';

const MainApp: React.FC = () => {
  const { mode, tests, attempts, currentUser } = useApp();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<MockTest | null>(null);

  const [analyticsTest, setAnalyticsTest] = useState<MockTest | null>(null);

  const handleOpenCreateWizard = () => {
    setEditingTest(null);
    setIsWizardOpen(true);
  };

  const handleEditTest = (test: MockTest) => {
    setEditingTest(test);
    setIsWizardOpen(true);
  };

  const handleViewAnalytics = (test: MockTest) => {
    setAnalyticsTest(test);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      <Navbar onOpenCreateWizard={handleOpenCreateWizard} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {mode === 'student' ? (
          <StudentPortal />
        ) : currentUser ? (
          <Dashboard
            onOpenCreateWizard={handleOpenCreateWizard}
            onEditTest={handleEditTest}
            onViewAnalytics={handleViewAnalytics}
          />
        ) : (
          <LandingPage />
        )}
      </main>


      {/* Admin Test Wizard Modal */}
      {isWizardOpen && (
        <TestWizard
          initialTest={editingTest}
          onClose={() => {
            setIsWizardOpen(false);
            setEditingTest(null);
          }}
        />
      )}

      {/* Admin Analytics Modal */}
      {analyticsTest && (
        <TestAnalyticsModal
          test={analyticsTest}
          attempts={attempts}
          isOpen={Boolean(analyticsTest)}
          onClose={() => setAnalyticsTest(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
