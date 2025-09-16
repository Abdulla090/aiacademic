import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ResponsiveLayout, ResponsiveButtonGroup } from '@/components/ui/responsive-layout';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Copy, Download, RefreshCw, Zap, Eye, Settings2, BarChart3 } from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { analyticsService } from '@/services/analytics';

// AI Detection and Humanization utilities
import { detectAIPatterns, humanizeContent, AIDetectionResult, HumanizationOptions } from '../utils/aiHumanizer';

interface HumanizationSettings {
  tone: 'casual' | 'professional' | 'conversational' | 'friendly' | 'creative';
  formality: number; // 0-100
  personality: number; // 0-100
  creativity: number; // 0-100
  addContractions: boolean;
  addPersonalTouch: boolean;
  varyVocabulary: boolean;
  improveFlow: boolean;
}

const AIContentHumanizer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<AIDetectionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const [settings, setSettings] = useState<HumanizationSettings>({
    tone: 'conversational',
    formality: 40,
    personality: 60,
    creativity: 70,
    addContractions: true,
    addPersonalTouch: true,
    varyVocabulary: true,
    improveFlow: true,
  });

  const handleAnalyzeContent = useCallback(async () => {
    if (!inputText.trim()) {
      toast({
        title: "No Content",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    try {
      analyticsService.trackEvent('ai_content_analysis_started', 'ai_humanizer', 'analysis', 1, {
        textLength: inputText.length,
        wordCount: inputText.split(' ').length,
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await detectAIPatterns(inputText);
      setDetectionResult(result);

      clearInterval(progressInterval);
      setProgress(100);

      analyticsService.trackEvent('ai_content_analysis_completed', 'ai_humanizer', 'analysis', 1, {
        aiScore: result.aiScore,
        patternsDetected: result.patterns.length,
      });

      setTimeout(() => setProgress(0), 1000);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
      analyticsService.trackEvent('ai_content_analysis_failed', 'ai_humanizer', 'analysis', 0, { error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText, toast]);

  const handleHumanizeContent = useCallback(async () => {
    if (!inputText.trim()) {
      toast({
        title: "No Content",
        description: "Please enter some text to humanize.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      analyticsService.trackEvent('ai_content_humanization_started', 'ai_humanizer', 'humanization', 1, {
        textLength: inputText.length,
        settings: settings,
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 80));
      }, 300);

      const options: HumanizationOptions = {
        tone: settings.tone,
        formality: settings.formality,
        personality: settings.personality,
        creativity: settings.creativity,
        addContractions: settings.addContractions,
        addPersonalTouch: settings.addPersonalTouch,
        varyVocabulary: settings.varyVocabulary,
        improveFlow: settings.improveFlow,
      };

      // First apply local humanization
      let humanizedText = await humanizeContent(inputText, options);

      setProgress(85);

      // Then use AI for advanced humanization with improved prompting
      const aiPrompt = `
You are a content humanizer. Your job is to make AI-generated text sound more human and natural while preserving the EXACT same content, structure, and language.

CRITICAL LANGUAGE RULES:
- If the input is in ENGLISH, you MUST respond in ENGLISH only
- If the input is in KURDISH, you MUST respond in KURDISH only  
- If the input is in ARABIC, you MUST respond in ARABIC only
- NEVER translate or change the language - keep it exactly the same
- You are capable of working with any language including Kurdish, English, Arabic

CONTENT PRESERVATION RULES:
1. Keep the SAME language as the input (do not translate)
2. Keep the SAME structure (no bullet points, no reformatting)
3. Keep the SAME meaning and information
4. Only make these subtle changes:
   - Add natural variations in sentence structure
   - Use more conversational language where appropriate
   - Add contractions when suitable
   - Replace overly formal words with natural alternatives
   - Add subtle personality touches
   - Make the flow more natural

Settings to apply:
- Tone: ${settings.tone}
- Formality: ${settings.formality}% (lower = more casual)
- Personality: ${settings.personality}% (higher = more personal)
- Creativity: ${settings.creativity}% (higher = more varied language)

PRESERVE:
- Original language (CRITICAL - do not change)
- Paragraph structure
- Formatting
- Core message and facts
- Length (approximately the same)

INPUT TEXT:
${humanizedText}

OUTPUT: Return the humanized version with the same structure and language, just more natural and human-sounding.`;

      const aiResult = await geminiService.paraphraseText(aiPrompt);
      // Extract only the humanized content, removing any extra formatting
      humanizedText = aiResult.replace(/^(OUTPUT:|HUMANIZED VERSION:|Here's the humanized version:)/i, '').trim();

      setOutputText(humanizedText);
      clearInterval(progressInterval);
      setProgress(100);

      analyticsService.trackEvent('ai_content_humanization_completed', 'ai_humanizer', 'humanization', 1, {
        originalLength: inputText.length,
        humanizedLength: humanizedText.length,
        settings: settings,
      });

      toast({
        title: "Content Humanized!",
        description: "Your content has been successfully humanized.",
      });

      setTimeout(() => setProgress(0), 1000);
    } catch (error) {
      console.error('Humanization error:', error);
      toast({
        title: "Humanization Failed",
        description: "Failed to humanize content. Please try again.",
        variant: "destructive",
      });
      analyticsService.trackEvent('ai_content_humanization_failed', 'ai_humanizer', 'humanization', 0, { error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, settings, toast]);

  const handleCopyResult = useCallback(() => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied!",
        description: "Humanized content copied to clipboard.",
      });
      analyticsService.trackEvent('ai_content_copied', 'ai_humanizer', 'copy', 1);
    }
  }, [outputText, toast]);

  const handleDownload = useCallback(() => {
    if (outputText) {
      const blob = new Blob([outputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'humanized-content.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded!",
        description: "Humanized content saved as text file.",
      });
      analyticsService.trackEvent('ai_content_downloaded', 'ai_humanizer', 'download', 1);
    }
  }, [outputText, toast]);

  const getAIScoreColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAIScoreLabel = (score: number) => {
    if (score >= 80) return 'High AI Detection';
    if (score >= 60) return 'Moderate AI Detection';
    if (score >= 40) return 'Low AI Detection';
    return 'Human-like';
  };

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Content Humanizer
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Transform AI-generated content into natural, human-like text while preserving the original structure, 
            language, and meaning. No bullet points, no reformatting - just subtle humanization.
          </p>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Content Input & Analysis
                </CardTitle>
                <CardDescription>
                  Enter your AI-generated content to analyze and humanize
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your AI-generated content here... (The humanizer will preserve your original structure and language while making it sound more natural)"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={12}
                  className="min-h-[300px] resize-none"
                />
                
                <ResponsiveButtonGroup>
                  <Button
                    onClick={handleAnalyzeContent}
                    disabled={isAnalyzing || !inputText.trim()}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isAnalyzing ? <LoadingSpinner size="sm" /> : <BarChart3 className="h-4 w-4" />}
                    Analyze AI Patterns
                  </Button>
                  <Button
                    onClick={handleHumanizeContent}
                    disabled={isProcessing || !inputText.trim()}
                    className="flex items-center gap-2"
                  >
                    {isProcessing ? <LoadingSpinner size="sm" /> : <Zap className="h-4 w-4" />}
                    Humanize Content
                  </Button>
                </ResponsiveButtonGroup>

                {/* AI Detection Results */}
                {detectionResult && (
                  <Alert>
                    <BarChart3 className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">AI Detection Score:</span>
                          <Badge className={`${getAIScoreColor(detectionResult.aiScore)} text-white`}>
                            {detectionResult.aiScore}% - {getAIScoreLabel(detectionResult.aiScore)}
                          </Badge>
                        </div>
                        
                        {detectionResult.patterns.length > 0 && (
                          <div>
                            <span className="font-medium">Detected Patterns:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {detectionResult.patterns.map((pattern, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {pattern}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground">
                          {detectionResult.suggestions}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Output Section */}
            {outputText && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Humanized Content
                  </CardTitle>
                  <CardDescription>
                    Your content has been transformed to sound more natural and human-like
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={outputText}
                    readOnly
                    rows={12}
                    className="min-h-[300px] resize-none bg-muted/50"
                  />
                  
                  <ResponsiveButtonGroup>
                    <Button
                      onClick={handleCopyResult}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Result
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </ResponsiveButtonGroup>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Humanization Settings
                </CardTitle>
                <CardDescription>
                  Customize how your content should be humanized
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="tone" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tone">Tone & Style</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="tone" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Writing Tone</Label>
                      <Select value={settings.tone} onValueChange={(value: any) => setSettings({...settings, tone: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Formality Level: {settings.formality}%</Label>
                      <Slider
                        value={[settings.formality]}
                        onValueChange={([value]) => setSettings({...settings, formality: value})}
                        max={100}
                        step={10}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Personality Injection: {settings.personality}%</Label>
                      <Slider
                        value={[settings.personality]}
                        onValueChange={([value]) => setSettings({...settings, personality: value})}
                        max={100}
                        step={10}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Creativity Level: {settings.creativity}%</Label>
                      <Slider
                        value={[settings.creativity]}
                        onValueChange={([value]) => setSettings({...settings, creativity: value})}
                        max={100}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="contractions">Add Contractions</Label>
                        <Switch
                          id="contractions"
                          checked={settings.addContractions}
                          onCheckedChange={(checked) => setSettings({...settings, addContractions: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="personal">Personal Touch</Label>
                        <Switch
                          id="personal"
                          checked={settings.addPersonalTouch}
                          onCheckedChange={(checked) => setSettings({...settings, addPersonalTouch: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="vocabulary">Vary Vocabulary</Label>
                        <Switch
                          id="vocabulary"
                          checked={settings.varyVocabulary}
                          onCheckedChange={(checked) => setSettings({...settings, varyVocabulary: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="flow">Improve Flow</Label>
                        <Switch
                          id="flow"
                          checked={settings.improveFlow}
                          onCheckedChange={(checked) => setSettings({...settings, improveFlow: checked})}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Humanization Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Preserves original structure and language</p>
                <p>• No bullet points or reformatting added</p>
                <p>• Subtle word choice improvements only</p>
                <p>• Maintains the same meaning and length</p>
                <p>• Lower formality = more casual language</p>
                <p>• Higher personality = more natural flow</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default AIContentHumanizer;