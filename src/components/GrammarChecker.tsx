import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Copy, RefreshCw, CheckCircle, Download } from 'lucide-react';
import { geminiService, type GrammarCorrection } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from "jspdf";

export const GrammarChecker = () => {
  const [text, setText] = useState('');
  const [correction, setCorrection] = useState<GrammarCorrection | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!text.trim()) {
      toast({
        title: 'هەڵە',
        description: 'تکایە نووسینەکەت بنووسە',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await geminiService.checkGrammar(text);
      setCorrection(result);
      toast({
        title: 'پشکنین تەواو بوو',
        description: 'ڕێزمانەکە پشکنرا'
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا ڕێزمانەکە پشکنرێت',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (correction) {
      setText(correction.corrected);
      toast({
        title: 'گۆڕانکارییەکان جێبەجێ کران',
        description: 'نووسینەکە ڕاست کرایەوە'
      });
    }
  };

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'کۆپی کرا',
        description: 'نووسینەکە بۆ کلیپبۆرد کۆپی کرا'
      });
    } catch {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا کۆپی بکرێت',
        variant: 'destructive'
      });
    }
  };
  
  const handleDownload = (text: string, format: 'text' | 'pdf' = 'text') => {
    if (format === 'pdf') {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(16);
      doc.text('نووسینی ڕاستکراوە', pageWidth / 2, 20, { align: 'center' });
      
      // Add content
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(text, pageWidth - 20);
      doc.text(splitText, 10, 40);
      
      // Save the PDF
      doc.save('نووسینی ڕاستکراوە.pdf');
      return;
    }
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'نووسینی ڕاستکراوە.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
 };

  const hasCorrections = correction && correction.original !== correction.corrected;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-primary rounded-xl text-primary-foreground">
          <CheckSquare className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground sorani-text">پشکنەری ڕێزمان</h1>
          <p className="text-muted-foreground latin-text">Grammar Checker</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <Card className="card-academic">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="sorani-text">نووسینی سەرەتایی</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleCopy(text)} disabled={!text}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDownload(text, 'pdf')} disabled={!text}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="نووسینەکەت لێرە بنووسە بۆ پشکنینی ڕێزمان و ستایل..."
              className="min-h-[400px] sorani-text text-base leading-relaxed"
            />
            
            <Button 
              onClick={handleCheck}
              disabled={loading || !text.trim()}
              className="btn-academic-primary w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  پشکنین...
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  پشکنینی ڕێزمان
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="card-academic">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="sorani-text">نووسینی ڕاستکراوە</CardTitle>
            {correction && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleCopy(correction.corrected)}>
                  <Copy className="h-4 w-4" />
                </Button>
                {hasCorrections && (
                  <Button size="sm" onClick={handleAccept} className="btn-academic-primary">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    جێبەجێکردن
                  </Button>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {correction ? (
              <div className="space-y-6">
                {hasCorrections ? (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                    گۆڕانکارییەکان هەن
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    هیچ گۆڕانکارییەک پێویست نییە
                  </Badge>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-2 sorani-text">نووسینی ڕاستکراوە:</h3>
                    <Textarea
                      value={correction.corrected}
                      readOnly
                      className="min-h-[300px] sorani-text text-base leading-relaxed bg-secondary/50"
                    />
                  </div>

                  {correction.suggestions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-foreground mb-2 sorani-text">پێشنیارەکان:</h3>
                      <div className="space-y-2">
                        {correction.suggestions.map((suggestion, index) => (
                          <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                            <p className="text-sm sorani-text">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="sorani-text">ئەنجامی پشکنین لێرە دەردەکەوێت</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};