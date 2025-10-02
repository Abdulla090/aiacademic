import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Copy, RefreshCw, CheckCircle, Download, Save, X, Upload, AlertCircle, Check, Lightbulb } from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import html2pdf from 'html2pdf.js';
import useIsMobile from '@/hooks/use-is-mobile';
import { ResponsiveLayout, ResponsiveButtonGroup, ResponsiveText } from '@/components/ui/responsive-layout';
import { useResponsive } from '@/hooks/useResponsive';
import { LanguageSelection } from './LanguageSelection';

interface GrammarError {
  id: string;
  start: number;
  end: number;
  text: string;
  message: string;
  suggestions: string[];
  type: 'grammar' | 'spelling' | 'style' | 'punctuation';
  severity: 'error' | 'warning' | 'suggestion';
}

interface GrammarCheckerProps {
}

export const GrammarChecker = ({}: GrammarCheckerProps) => {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [selectedError, setSelectedError] = useState<GrammarError | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { isMobile: isResponsiveMobile, isTablet } = useResponsive();

  // Load saved text from localStorage
  useEffect(() => {
    const savedText = localStorage.getItem('grammarCheckerText');
    if (savedText) {
      setText(savedText);
    }
  }, []);

  // Save text to localStorage
  useEffect(() => {
    if (text) {
      localStorage.setItem('grammarCheckerText', text);
    } else {
      localStorage.removeItem('grammarCheckerText');
    }
  }, [text]);

  const checkGrammar = async () => {
    if (!text.trim()) {
      toast({
        title: 'هەڵە',
        description: 'تکایە نووسینەکەت بنووسە',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setErrors([]);
    
    try {
      const result = await geminiService.checkGrammarDetailed(text, language);
      setErrors(result);
      
      if (result.length === 0) {
        toast({
          title: 'زۆر باش!',
          description: 'هیچ هەڵەیەک نەدۆزرایەوە',
        });
      } else {
        toast({
          title: 'پشکنین تەواو بوو',
          description: `${result.length} هەڵە دۆزرایەوە`,
        });
      }
    } catch (error) {
      console.error('Grammar check error:', error);
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا ڕێزمانەکە پشکنرێت',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = useCallback((error: GrammarError, suggestion: string) => {
    const newText = text.substring(0, error.start) + suggestion + text.substring(error.end);
    setText(newText);
    
    const updatedErrors = errors.filter(e => e.id !== error.id).map(e => {
      if (e.start > error.end) {
        const lengthDiff = suggestion.length - (error.end - error.start);
        return {
          ...e,
          start: e.start + lengthDiff,
          end: e.end + lengthDiff
        };
      }
      return e;
    });
    
    setErrors(updatedErrors);
    setShowPopup(false);
    setSelectedError(null);
    
    toast({
      title: 'گۆڕانکاری جێبەجێ کرا',
      description: 'پێشنیارەکە جێبەجێ کرا',
    });
  }, [text, errors]);

  const handleTextClick = useCallback((event: React.MouseEvent<HTMLTextAreaElement>) => {
    if (!textareaRef.current || errors.length === 0) return;

    const textarea = textareaRef.current;
    const clickPosition = textarea.selectionStart;
    
    const clickedError = errors.find(error => 
      clickPosition >= error.start && clickPosition <= error.end
    );

    if (clickedError) {
      if (isMobile) {
        setSelectedError(clickedError);
        setShowPopup(true);
      } else {
        const rect = textarea.getBoundingClientRect();
        const textBeforeClick = text.substring(0, clickPosition);
        const lines = textBeforeClick.split('\n');
        const lineHeight = 20;
        const charWidth = 8;
        
        const x = rect.left + (lines[lines.length - 1].length * charWidth);
        const y = rect.top + (lines.length - 1) * lineHeight;
        
        setPopupPosition({ x, y });
        setSelectedError(clickedError);
        setShowPopup(true);
      }
    } else {
      setShowPopup(false);
      setSelectedError(null);
    }
  }, [errors, text, isMobile]);

  const getHighlightedText = () => {
    if (errors.length === 0) return text;

    let result = '';
    let lastIndex = 0;

    const sortedErrors = [...errors].sort((a, b) => a.start - b.start);

    for (const error of sortedErrors) {
      result += text.substring(lastIndex, error.start);
      
      const errorText = text.substring(error.start, error.end);
      const colorClass = {
        'error': 'bg-red-200 border-b-2 border-red-500',
        'warning': 'bg-yellow-200 border-b-2 border-yellow-500',
        'suggestion': 'bg-blue-200 border-b-2 border-blue-500'
      }[error.severity];
      
      result += `<span class="${colorClass} cursor-pointer" data-error-id="${error.id}">${errorText}</span>`;
      lastIndex = error.end;
    }
    
    result += text.substring(lastIndex);
    return result;
  };

  const copyToClipboard = async () => {
    if (!text.trim()) return;
    
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'کۆپی کرا',
        description: 'نووسینەکە کۆپی کرا'
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا کۆپی بکرێت',
        variant: 'destructive'
      });
    }
  };

  const saveText = () => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'grammar-checked-text.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: 'سەرکەوتوو بوو',
      description: 'فایلەکە پاشەکەوت کرا'
    });
  };

  const exportToPDF = async () => {
    if (!text.trim()) {
      toast({
        title: 'هەڵە',
        description: 'هیچ نووسینێک نییە بۆ هەناردن',
        variant: 'destructive'
      });
      return;
    }

    try {
      const correctedText = errors.length > 0 ? 
        errors.reduce((acc, error) => {
          if (error.suggestions.length > 0) {
            return acc.replace(error.text, error.suggestions[0]);
          }
          return acc;
        }, text) : text;

      const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Noto Naskh Arabic', serif; line-height: 1.8; direction: rtl; padding: 20px; }
              .container { max-width: 800px; margin: 0 auto; padding: 40px; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #8B5CF6; padding-bottom: 20px; }
              .title { font-size: 28px; font-weight: bold; color: #1F2937; margin-bottom: 10px; }
              .content { font-size: 16px; line-height: 2; color: #374151; text-align: justify; }
              .stats { display: flex; justify-content: space-around; background: #F3F4F6; padding: 20px; border-radius: 8px; margin-top: 30px; }
              .stat-item { text-align: center; }
              .stat-number { font-size: 24px; font-weight: bold; color: #8B5CF6; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="title">ڕاپۆرتی ڕاستکردنەوەی ڕێزمان</div>
              </div>
              <div class="content">${correctedText.replace(/\n/g, '<br>')}</div>
              <div class="stats">
                <div class="stat-item"><div class="stat-number">${text.split(/\s+/).length}</div><div>وشە</div></div>
                <div class="stat-item"><div class="stat-number">${errors.length}</div><div>هەڵە</div></div>
              </div>
            </div>
          </body>
        </html>
      `;

      const opt = {
        margin: 1,
        filename: 'grammar-report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().from(htmlContent).set(opt).save();
      
      toast({
        title: 'سەرکەوتوو بوو',
        description: 'ڕاپۆرتەکە بە PDF هەناردە کرا',
      });

    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا PDF هەناردە بکرێت',
        variant: 'destructive'
      });
    }
  };

  const loadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
      setErrors([]);
      toast({
        title: 'سەرکەوتوو بوو',
        description: 'فایلەکە بارکرا'
      });
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
        setSelectedError(null);
      }
    };

    if (showPopup && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPopup, isMobile]);

  const ErrorPopup = () => {
    if (!showPopup || !selectedError) return null;

    const severityIcon = {
      'error': <AlertCircle className="h-4 w-4 text-red-500" />,
      'warning': <AlertCircle className="h-4 w-4 text-yellow-500" />,
      'suggestion': <Lightbulb className="h-4 w-4 text-blue-500" />
    }[selectedError.severity];

    const severityColor = {
      'error': 'border-red-500 bg-red-50',
      'warning': 'border-yellow-500 bg-yellow-50',
      'suggestion': 'border-blue-500 bg-blue-50'
    }[selectedError.severity];

    if (isMobile) {
      return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className={`bg-white rounded-t-lg p-4 w-full max-w-md border-t-4 ${severityColor} max-h-80 overflow-y-auto`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {severityIcon}
                <span className="font-semibold capitalize">{selectedError.type}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPopup(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">{selectedError.message}</p>
            
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">پێشنیارەکان:</p>
              {selectedError.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-right"
                  onClick={() => applySuggestion(selectedError, suggestion)}
                >
                  <Check className="h-3 w-3 mr-2" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        ref={popupRef}
        className={`absolute z-50 bg-white rounded-lg shadow-lg border-2 p-3 w-64 ${severityColor}`}
        style={{ 
          left: popupPosition.x, 
          top: popupPosition.y - 100,
          transform: 'translateX(-50%)'
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          {severityIcon}
          <span className="font-semibold text-sm capitalize">{selectedError.type}</span>
        </div>
        
        <p className="text-sm text-gray-700 mb-3">{selectedError.message}</p>
        
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-600">پێشنیارەکان:</p>
          {selectedError.suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-auto p-1"
              onClick={() => applySuggestion(selectedError, suggestion)}
            >
              <Check className="h-3 w-3 mr-1" />
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveLayout maxWidth="6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-primary rounded-xl text-primary-foreground">
          <CheckSquare className="h-6 w-6" />
        </div>
        <div>
          <ResponsiveText variant="h1" className="text-foreground sorani-text">
            ڕاستکەرەوەی ڕێزمان
          </ResponsiveText>
          <ResponsiveText variant="caption" className="latin-text">
            Advanced Grammar Checker
          </ResponsiveText>
        </div>
      </div>

      <ResponsiveLayout 
        variant="grid" 
        gridCols={{ mobile: 1, tablet: 1, desktop: 2 }}
        className={isResponsiveMobile ? "gap-6" : "gap-8"}
      >
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              <span className="sorani-text">نووسینەکەت بنووسە</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onClick={handleTextClick}
                placeholder="نووسینەکەت لێرە بنووسە..."
                className={`input-academic sorani-text font-mono ${isResponsiveMobile ? 'min-h-[300px] text-sm' : 'min-h-[400px]'}`}
                style={{ 
                  background: errors.length > 0 ? 'transparent' : undefined,
                  position: errors.length > 0 ? 'absolute' : 'relative',
                  zIndex: errors.length > 0 ? 2 : 'auto',
                  color: errors.length > 0 ? 'transparent' : undefined
                }}
              />
              
              {errors.length > 0 && (
                <div 
                  className="absolute inset-0 p-3 font-mono text-sm pointer-events-none whitespace-pre-wrap break-words"
                  style={{ 
                    zIndex: 1,
                    fontSize: '14px',
                    lineHeight: '1.5',
                    fontFamily: 'monospace'
                  }}
                  dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
                />
              )}
            </div>
            
            <ResponsiveButtonGroup className="mt-4">
              <Button 
                onClick={checkGrammar}
                disabled={loading || !text.trim()}
                className="btn-academic-primary"
                size={isResponsiveMobile ? "lg" : "default"}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckSquare className="h-4 w-4 mr-2" />
                )}
                <span className="sorani-text">پشکنین</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setText('');
                  setErrors([]);
                  setShowPopup(false);
                }}
                className="btn-academic-secondary"
                size={isResponsiveMobile ? "default" : "default"}
              >
                <X className="h-4 w-4 mr-2" />
                <span className="sorani-text">پاککردنەوە</span>
              </Button>

              <Button
                variant="outline"
                onClick={copyToClipboard}
                disabled={!text.trim()}
                className="btn-academic-secondary"
                size={isResponsiveMobile ? "default" : "default"}
              >
                <Copy className="h-4 w-4 mr-2" />
                <span className="sorani-text">کۆپی</span>
              </Button>

              <Button
                variant="outline"
                onClick={saveText}
                disabled={!text.trim()}
                className="btn-academic-secondary"
                size={isResponsiveMobile ? "default" : "default"}
              >
                <Save className="h-4 w-4 mr-2" />
                <span className="sorani-text">پاشەکەوت</span>
              </Button>

              <Button
                variant="outline"
                onClick={exportToPDF}
                disabled={!text.trim()}
                className="btn-academic-secondary"
                size={isResponsiveMobile ? "default" : "default"}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="sorani-text">PDF</span>
              </Button>

              <div className={isResponsiveMobile ? "w-full" : "relative"}>
                <input
                  type="file"
                  accept=".txt"
                  onChange={loadFile}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className={`btn-academic-secondary ${isResponsiveMobile ? "w-full" : ""}`}
                  size={isResponsiveMobile ? "default" : "default"}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="sorani-text">بارکردن</span>
                </Button>
              </div>
            </ResponsiveButtonGroup>

             <LanguageSelection
               selectedLanguage={language}
               onLanguageChange={setLanguage}
             />

            {errors.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 sorani-text">کورتەی هەڵەکان</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(
                    errors.reduce((acc, error) => {
                      acc[error.type] = (acc[error.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <Badge key={type} variant="secondary" className="sorani-text">
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2 sorani-text">
                  لەسەر نووسینەکە کلیک بکە بۆ دیتنی پێشنیارەکان
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="sorani-text">ئەنجامەکان</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground sorani-text">پشکنینی ڕێزمان...</p>
                </div>
              </div>
            ) : errors.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-semibold sorani-text">هیچ هەڵەیەک نەدۆزرایەوە!</p>
                <p className="text-muted-foreground sorani-text">نووسینەکەت زۆر باشە</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground sorani-text">
                  لەسەر هەڵەکان کلیک بکە بۆ دیتنی پێشنیارەکان
                </p>
                
                <div className={`space-y-3 overflow-y-auto ${isResponsiveMobile ? 'max-h-64' : 'max-h-96'}`}>
                  {errors.map((error) => (
                    <div 
                      key={error.id}
                      className={`border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        error.severity === 'error' ? 'border-red-200' :
                        error.severity === 'warning' ? 'border-yellow-200' : 'border-blue-200'
                      }`}
                      onClick={() => {
                        setSelectedError(error);
                        setShowPopup(true);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        {error.severity === 'error' ? (
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        ) : error.severity === 'warning' ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                        ) : (
                          <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant={error.severity === 'error' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {error.type}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium sorani-text">"{error.text}"</p>
                          <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </ResponsiveLayout>

      <ErrorPopup />
    </ResponsiveLayout>
  );
};
