import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { geminiService } from '@/services/geminiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw } from 'lucide-react';
import { Suggestion } from './SuggestionMark';
import { ToolHeader } from '@/components/ToolHeader';
import { useAuth } from '@/contexts/AuthContext';
import { CREDIT_COSTS } from '@/config/credits';

export const WritingSupervisor = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Suggestion],
    content: '<p>Enter a topic and start writing. Click the button to get a suggestion.</p>',
  });

  const fetchSuggestion = async () => {
    if (editor && topic) {
      const text = editor.getText();
      setLoading(true);
      try {
        const result = await geminiService.generateNextSentence(topic, text);
        editor.chain().focus().insertContent(` ${result.sentence}`).setSuggestion().run();
      } catch (error) {
        console.error("Failed to fetch next sentence:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const acceptSuggestion = () => {
    if (editor) {
        editor.chain().focus().unsetSuggestion().run();
    }
  };
  
  const rejectSuggestion = () => {
    if (editor) {
        // Remove the suggestion text
        editor.chain().focus().deleteSelection().run();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="sorani-text">سەرپەرشتیاری نووسینی زیرەک</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="بابەتەکەت بنووسە..."
              className="input-academic sorani-text"
            />
            <div className="prose dark:prose-invert max-w-full border border-border rounded-lg p-6 min-h-[80vh] bg-white dark:bg-gray-900">
                <EditorContent editor={editor} className="h-full min-h-[70vh] text-lg leading-relaxed p-4" />
            </div>
            <div className="flex items-center gap-4">
                <Button onClick={fetchSuggestion} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Suggest Next Sentence'}
                </Button>
                <Button onClick={acceptSuggestion} variant="secondary">
                    Accept Suggestion
                </Button>
                <Button
                  onClick={rejectSuggestion}
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                    Reject Suggestion
                </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};