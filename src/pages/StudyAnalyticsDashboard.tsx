import React from 'react';
import { BackButton } from '@/components/BackButton';
import StudyAnalyticsDashboard from '../components/StudyAnalyticsDashboard';
import { useNavigate } from "react-router-dom";

const StudyAnalyticsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-subtle bg-purple-grid">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <BackButton />
        </div>
        <StudyAnalyticsDashboard />
      </main>
    </div>
  );
};

export default StudyAnalyticsDashboardPage;
