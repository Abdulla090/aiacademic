import React, { useState } from 'react';
import { KnowledgeGraphGenerator } from '@/components/KnowledgeGraphGenerator';
import { MindMapGenerator } from '@/components/MindMapGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const KnowledgeGraphPage: React.FC = () => {
  const { t } = useTranslation();
  const [graphData, setGraphData] = useState<{ nodes: { id: string; label: string }[]; edges: { from: string; to: string }[] } | null>(null);

  const handleGenerateGraph = (nodes: { id: string; label: string }[], edges: { from: string; to: string }[]) => {
    setGraphData({ nodes, edges });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
        {t('knowledgeGraphPageTitle')}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <KnowledgeGraphGenerator onGenerateGraph={handleGenerateGraph} />
        </div>
        <div>
          {graphData ? (
            <Card className="card-academic h-full">
              <CardHeader>
                <CardTitle>{t('generatedKnowledgeGraph')}</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]"> {/* Adjust height as needed */}
                <MindMapGenerator nodes={graphData.nodes} edges={graphData.edges} />
              </CardContent>
            </Card>
          ) : (
            <Card className="card-academic h-full flex items-center justify-center">
              <CardContent className="text-muted-foreground text-center">
                {t('enterTextToGenerateGraph')}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphPage;
