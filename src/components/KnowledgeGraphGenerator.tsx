import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface KnowledgeGraphGeneratorProps {
  onGenerateGraph: (nodes: { id: string; label: string }[], edges: { from: string; to: string }[]) => void;
}

export const KnowledgeGraphGenerator: React.FC<KnowledgeGraphGeneratorProps> = ({ onGenerateGraph }) => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState<string>('');

  // Define a list of common English stop words
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with'
  ]);

  const generateGraph = () => {
    if (!inputText.trim()) return;

    // Simplified concept extraction: words appearing more than once, excluding stop words
    const words = (inputText.toLowerCase().match(/\b\w+\b/g) || []).filter(word => !stopWords.has(word));
    
    // Generate bigrams
    const bigrams: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      // Only add bigrams if neither word is a stop word (already filtered) and the bigram itself isn't too common/generic
      if (!stopWords.has(words[i]) && !stopWords.has(words[i+1])) {
        bigrams.push(bigram);
      }
    }

    const allConceptsRaw = [...words, ...bigrams];

    const wordCounts: { [key: string]: number } = {};
    allConceptsRaw.forEach(concept => {
      wordCounts[concept] = (wordCounts[concept] || 0) + 1;
    });

    const concepts = Object.keys(wordCounts).filter(concept => wordCounts[concept] > 1);

    const nodes = concepts.map(concept => ({ id: concept, label: concept }));
    const edges: { from: string; to: string }[] = [];

    // More sophisticated relationship inference: co-occurrence within a sliding window
    const allTokens = (inputText.toLowerCase().match(/\b\w+\b/g) || []).filter(token => !stopWords.has(token));
    const windowSize = 5; // Define the sliding window size

    for (let i = 0; i < allTokens.length; i++) {
      const window = allTokens.slice(Math.max(0, i - windowSize + 1), i + 1);
      
      // Also add bigrams within the current window to the window concepts
      const windowConcepts: string[] = [...window];
      for (let j = 0; j < window.length - 1; j++) {
        windowConcepts.push(`${window[j]} ${window[j + 1]}`);
      }

      const conceptsInWindow = concepts.filter(concept => windowConcepts.includes(concept));

      for (let j = 0; j < conceptsInWindow.length; j++) {
        for (let k = j + 1; k < conceptsInWindow.length; k++) {
          const concept1 = conceptsInWindow[j];
          const concept2 = conceptsInWindow[k];

          // Add edge if not already present
          if (!edges.some(e => (e.from === concept1 && e.to === concept2) || (e.from === concept2 && e.to === concept1))) {
            edges.push({ from: concept1, to: concept2 });
          }
        }
      }
    }

    onGenerateGraph(nodes, edges);
  };

  return (
    <Card className="card-academic">
      <CardHeader>
        <CardTitle>{t('knowledgeGraphGeneratorTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder={t('knowledgeGraphGeneratorPlaceholder')}
          value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
          rows={10}
          className="mb-4 input-academic"
        />
        <Button onClick={generateGraph} className="btn-academic-primary">
          {t('generateKnowledgeGraph')}
        </Button>
      </CardContent>
    </Card>
  );
};
