import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Wand2, 
  Copy, 
  RefreshCw, 
  Download, 
  Upload, 
  FileText, 
  Eye, 
  EyeOff,
  Settings,
  BookOpen,
  GraduationCap,
  PenTool,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
  Layers,
  Globe,
  Lightbulb
} from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import html2pdf from 'html2pdf.js';
import useIsMobile from '@/hooks/use-is-mobile';
import { useTranslation } from 'react-i18next';
import { TextDiffGenerator } from '../utils/textDiff';
import { PDFTextExtractor } from '@/utils/pdfExtractor';

interface FixingOptions {
  mode: 'basic' | 'advanced' | 'academic' | 'professional';
  language: 'english' | 'kurdish' | 'arabic' | 'auto';
  fixGrammar: boolean;
  fixPunctuation: boolean;
  fixStructure: boolean;
  fixFlow: boolean;
  improveCohesion: boolean;
  enhanceVocabulary: boolean;
  formatParagraphs: boolean;
  fixSpelling: boolean;
}

type FixingMode = FixingOptions['mode'];
type FixingLanguage = FixingOptions['language'];

interface FixingResult {
  originalText: string;
  fixedText: string;
  changes: TextChange[];
  suggestions: string[];
  improvementScore: number;
  processingTime: number;
}

interface TextChange {
  id: string;
  type: 'grammar' | 'punctuation' | 'structure' | 'vocabulary' | 'spelling' | 'flow';
  description: string;
  original: string;
  fixed: string;
  confidence: number;
  position: { start: number; end: number };
}

interface TextStructureFixerProps {
  language: string;
}

export function TextStructureFixer({ language }: TextStructureFixerProps) {
  const [inputText, setInputText] = useState('');
  const [fixedText, setFixedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [fixingOptions, setFixingOptions] = useState<FixingOptions>({
    mode: 'advanced',
    language: 'auto',
    fixGrammar: true,
    fixPunctuation: true,
    fixStructure: true,
    fixFlow: true,
    improveCohesion: true,
    enhanceVocabulary: false,
    formatParagraphs: true,
    fixSpelling: true
  });
  const [fixingResult, setFixingResult] = useState<FixingResult | null>(null);
  const [activeTab, setActiveTab] = useState('input');
  const [showComparison, setShowComparison] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Load saved text from localStorage
  useEffect(() => {
    const savedText = localStorage.getItem('textStructureFixerInput');
    const savedOptions = localStorage.getItem('textStructureFixerOptions');
    if (savedText) {
      setInputText(savedText);
    }
    if (savedOptions) {
      setFixingOptions(JSON.parse(savedOptions));
    }
  }, []);

  // Save text and options to localStorage
  useEffect(() => {
    if (inputText) {
      localStorage.setItem('textStructureFixerInput', inputText);
    }
  }, [inputText]);

  useEffect(() => {
    localStorage.setItem('textStructureFixerOptions', JSON.stringify(fixingOptions));
  }, [fixingOptions]);

  const generateFixingPrompt = useCallback((text: string, options: FixingOptions): string => {
    const modeInstructions = {
      basic: "Apply basic corrections focusing on grammar, spelling, and simple punctuation fixes.",
      advanced: "Provide comprehensive text improvement including structure, flow, coherence, and advanced grammar corrections.",
      academic: "Apply academic writing standards with formal tone, proper citations format preparation, and scholarly language enhancement.",
      professional: "Enhance text for professional communication with clear, concise, and business-appropriate language."
    };

    const languageInstructions = {
      english: "Process as English text following English grammar and style rules.",
      kurdish: "Process as Kurdish text (Sorani/Kurmanji) following Kurdish grammar and writing conventions.",
      arabic: "Process as Arabic text following Arabic grammar and writing conventions.",
      auto: "Automatically detect the language and apply appropriate grammar rules."
    };

    let prompt = `You are an expert text editor and writing assistant. Your task is to fix and improve the following text according to these specifications:

**Mode**: ${options.mode.toUpperCase()} - ${modeInstructions[options.mode]}
**Language**: ${options.language.toUpperCase()} - ${languageInstructions[options.language]}

**Corrections to Apply**:`;

    if (options.fixGrammar) prompt += "\n- ✅ Grammar: Fix all grammatical errors and improve sentence construction";
    if (options.fixPunctuation) prompt += "\n- ✅ Punctuation: Correct punctuation marks, add missing commas, periods, and proper punctuation";
    if (options.fixSpelling) prompt += "\n- ✅ Spelling: Fix all spelling mistakes and typos";
    if (options.fixStructure) prompt += "\n- ✅ Structure: Improve sentence and paragraph structure for better readability";
    if (options.fixFlow) prompt += "\n- ✅ Flow: Enhance text flow and transitions between sentences and paragraphs";
    if (options.improveCohesion) prompt += "\n- ✅ Cohesion: Improve logical connections and coherence throughout the text";
    if (options.enhanceVocabulary) prompt += "\n- ✅ Vocabulary: Enhance vocabulary with more appropriate and sophisticated terms";
    if (options.formatParagraphs) prompt += "\n- ✅ Formatting: Properly format paragraphs and ensure consistent spacing";

    prompt += `

**Instructions**:
1. Maintain the original meaning and intent of the text
2. Preserve any technical terms or proper nouns unless they contain errors
3. Apply improvements according to the selected mode and language
4. Ensure the output is well-structured and professionally formatted
5. Keep the same general length unless significant restructuring is needed
6. For academic mode: Use formal academic language and prepare text for potential citation formatting
7. For professional mode: Use clear, business-appropriate language
8. If text contains multiple languages, handle each appropriately

**Original Text**:
${text}

**Please provide ONLY the corrected and improved text without any explanations or meta-commentary:**`;

    return prompt;
  }, []);

  // Text metrics calculation utilities
  const calculateTextMetrics = useCallback((text: string) => {
    if (!text.trim()) return {
      readabilityScore: 0,
      avgSentenceLength: 0,
      sentenceCount: 0,
      wordCount: 0,
      grammarIssues: 0,
      spellingIssues: 0,
      structuralMarkers: 0
    };

    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    // Basic readability score (simplified Flesch-like calculation)
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    const avgSyllablesPerWord = words.reduce((sum, word) => {
      // Simple syllable estimation: count vowel groups
      const syllables = word.toLowerCase().match(/[aeiouy]+/g)?.length || 1;
      return sum + Math.max(1, syllables);
    }, 0) / (words.length || 1);
    
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    ));

    // Estimate grammar issues (common patterns)
    const grammarPatterns = [
      /\s+,/g, // Space before comma
      /\.\s*\./g, // Double periods
      /\s{2,}/g, // Multiple spaces
      /[a-z]\.[A-Z]/g, // Missing space after period
      /\b(a|an)\s+(a|an)\b/gi, // Double articles
    ];
    const grammarIssues = grammarPatterns.reduce((count, pattern) => 
      count + (text.match(pattern)?.length || 0), 0
    );

    // Estimate spelling issues (very basic - repeated characters, common typos)
    const spellingPatterns = [
      /\b\w*(.)\1{2,}\w*\b/g, // Words with 3+ repeated characters
      /\b(teh|adn|nad|hte|recieve|seperate|occured)\b/gi, // Common typos
    ];
    const spellingIssues = spellingPatterns.reduce((count, pattern) => 
      count + (text.match(pattern)?.length || 0), 0
    );

    // Count structural markers (transition words, conjunctions)
    const structuralWords = [
      'however', 'therefore', 'furthermore', 'moreover', 'consequently',
      'additionally', 'meanwhile', 'nevertheless', 'thus', 'hence',
      'because', 'since', 'although', 'whereas', 'despite', 'unless'
    ];
    const structuralMarkers = structuralWords.reduce((count, word) => 
      count + (text.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g'))?.length || 0), 0
    );

    return {
      readabilityScore: Math.round(readabilityScore),
      avgSentenceLength: Math.round(avgWordsPerSentence * 10) / 10,
      sentenceCount: sentences.length,
      wordCount: words.length,
      grammarIssues,
      spellingIssues,
      structuralMarkers
    };
  }, []);

  const calculateImprovementScore = useCallback((originalText: string, fixedText: string) => {
    const originalMetrics = calculateTextMetrics(originalText);
    const fixedMetrics = calculateTextMetrics(fixedText);

    // If no meaningful content, return minimal score
    if (originalMetrics.wordCount < 3 || fixedMetrics.wordCount < 3) {
      return 5;
    }

    // Calculate improvements with weights
    const metrics = [
      {
        name: 'readability',
        original: originalMetrics.readabilityScore,
        fixed: fixedMetrics.readabilityScore,
        weight: 0.25,
        isHigherBetter: true
      },
      {
        name: 'grammar',
        original: originalMetrics.grammarIssues,
        fixed: fixedMetrics.grammarIssues,
        weight: 0.30,
        isHigherBetter: false // Fewer issues is better
      },
      {
        name: 'spelling',
        original: originalMetrics.spellingIssues,
        fixed: fixedMetrics.spellingIssues,
        weight: 0.25,
        isHigherBetter: false
      },
      {
        name: 'structure',
        original: originalMetrics.structuralMarkers,
        fixed: fixedMetrics.structuralMarkers,
        weight: 0.20,
        isHigherBetter: true
      }
    ];

    let totalWeightedImprovement = 0;
    let totalWeight = 0;

    metrics.forEach(metric => {
      const { original, fixed, weight, isHigherBetter } = metric;
      
      let improvement = 0;
      if (isHigherBetter) {
        // Higher values are better (readability, structural markers)
        improvement = fixed - original;
      } else {
        // Lower values are better (grammar/spelling issues)
        improvement = original - fixed;
      }

      // Normalize improvement to percentage scale
      const maxExpectedChange = Math.max(1, Math.abs(original) || 10);
      const normalizedImprovement = (improvement / maxExpectedChange) * 100;
      
      totalWeightedImprovement += normalizedImprovement * weight;
      totalWeight += weight;
    });

    // Calculate final score
    const baseScore = 50; // Baseline score for no change
    const improvementBonus = totalWeightedImprovement / (totalWeight || 1);
    const finalScore = Math.round(baseScore + improvementBonus);

    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, finalScore));
  }, [calculateTextMetrics]);

  const simulateProgressSteps = useCallback((duration: number) => {
    const steps = [
      { progress: 10, message: "Analyzing text structure..." },
      { progress: 25, message: "Detecting grammar issues..." },
      { progress: 40, message: "Fixing punctuation and spelling..." },
      { progress: 60, message: "Improving sentence flow..." },
      { progress: 75, message: "Enhancing vocabulary and style..." },
      { progress: 90, message: "Finalizing improvements..." },
      { progress: 100, message: "Completed!" }
    ];

    const stepDuration = duration / steps.length;
    
    steps.forEach((step, index) => {
      setTimeout(() => {
        setProgress(step.progress);
        setCurrentStep(step.message);
      }, stepDuration * index);
    });
  }, []);

  const fixTextStructure = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to fix or upload a file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setCurrentStep("Preparing text analysis...");
    
    const startTime = Date.now();
    simulateProgressSteps(8000); // 8 seconds for progress simulation

    try {
      const prompt = generateFixingPrompt(inputText, fixingOptions);
      const response = await geminiService.fixTextStructure(prompt);
      
      const processingTime = Date.now() - startTime;
      
      // Parse the response to extract the fixed text
      const fixedTextResult = response.text.trim();
      
      setFixedText(fixedTextResult);
      
      // Calculate deterministic improvement score based on text metrics
      const improvementScore = calculateImprovementScore(inputText, fixedTextResult);
      
      // Create result with calculated metrics
      const result: FixingResult = {
        originalText: inputText,
        fixedText: fixedTextResult,
        changes: [], // Would be populated by analyzing differences
        suggestions: [
          "Consider adding more transitional phrases for better flow",
          "Some sentences could be split for improved readability",
          "Consider using more formal vocabulary in academic contexts"
        ],
        improvementScore: improvementScore,
        processingTime: processingTime
      };
      
      setFixingResult(result);
      setActiveTab('result');
      setProgress(100);
      setCurrentStep("Text improvement completed!");
      
      toast({
        title: t('processingComplete'),
        description: t('textProcessedSuccess'),
      });
      
    } catch (error) {
      console.error('Error fixing text:', error);
      toast({
        title: t('processingError'),
        description: t('processingErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setCurrentStep("Processing uploaded file...");
    setIsLoading(true);

    try {
      if (file.type === 'application/pdf') {
        // Validate PDF file
        const validation = PDFTextExtractor.validatePDFFile(file);
        if (!validation.isValid) {
          toast({
            title: "PDF Error",
            description: validation.error,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        setCurrentStep("Extracting text from PDF...");
        const pdfResult = await PDFTextExtractor.extractTextFromFile(file);
        const cleanedText = PDFTextExtractor.formatExtractedText(pdfResult.text);
        
        setInputText(cleanedText);
        setExtractedText(cleanedText);
        
        toast({
          title: t('pdfUploadSuccess'),
          description: t('pdfExtractedSuccess'),
        });
      } else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        // Text file handling
        setCurrentStep("Reading text file...");
        const text = await file.text();
        setInputText(text);
        setExtractedText(text);
        toast({
          title: "File uploaded",
          description: `Successfully loaded ${file.name}`,
        });
      } else {
        toast({
          title: "Unsupported file type",
          description: "Please upload a text file (.txt, .md) or PDF file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to read the uploaded file.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentStep("");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t('copiedToClipboard'),
        description: t('textCopiedSuccess'),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text.",
        variant: "destructive",
      });
    }
  };

  const downloadAsFile = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    if (!fixedText) return;

    // Create container div with safe DOM manipulation
    const element = document.createElement('div');
    element.style.cssText = 'font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;';

    // Create title
    const title = document.createElement('h1');
    title.style.cssText = 'color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;';
    title.textContent = 'Fixed Text Document';
    element.appendChild(title);

    // Create processing details section
    const detailsDiv = document.createElement('div');
    detailsDiv.style.cssText = 'margin: 20px 0;';
    
    const detailsTitle = document.createElement('h3');
    detailsTitle.style.cssText = 'color: #666;';
    detailsTitle.textContent = 'Processing Details:';
    detailsDiv.appendChild(detailsTitle);

    // Create mode paragraph
    const modePara = document.createElement('p');
    const modeStrong = document.createElement('strong');
    modeStrong.textContent = 'Mode: ';
    modePara.appendChild(modeStrong);
    modePara.appendChild(document.createTextNode(String(fixingOptions.mode)));
    detailsDiv.appendChild(modePara);

    // Create language paragraph
    const langPara = document.createElement('p');
    const langStrong = document.createElement('strong');
    langStrong.textContent = 'Language: ';
    langPara.appendChild(langStrong);
    langPara.appendChild(document.createTextNode(String(fixingOptions.language)));
    detailsDiv.appendChild(langPara);

    // Create date paragraph
    const datePara = document.createElement('p');
    const dateStrong = document.createElement('strong');
    dateStrong.textContent = 'Date: ';
    datePara.appendChild(dateStrong);
    datePara.appendChild(document.createTextNode(new Date().toLocaleDateString()));
    detailsDiv.appendChild(datePara);

    element.appendChild(detailsDiv);

    // Create fixed text section
    const textDiv = document.createElement('div');
    textDiv.style.cssText = 'background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;';
    
    const textTitle = document.createElement('h3');
    textTitle.style.cssText = 'color: #666; margin-top: 0;';
    textTitle.textContent = 'Fixed Text:';
    textDiv.appendChild(textTitle);

    const textContent = document.createElement('div');
    textContent.style.cssText = 'white-space: pre-wrap; font-size: 14px;';
    textContent.textContent = fixedText; // Safe text content assignment
    textDiv.appendChild(textContent);

    element.appendChild(textDiv);

    const opt = {
      margin: 1,
      filename: 'fixed-text.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'basic': return <PenTool className="h-4 w-4" />;
      case 'academic': return <GraduationCap className="h-4 w-4" />;
      case 'professional': return <BookOpen className="h-4 w-4" />;
      case 'advanced': return <Sparkles className="h-4 w-4" />;
      default: return <Wand2 className="h-4 w-4" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Wand2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('textStructureFixerTitle')}
            </h1>
            <p className="text-gray-600">
              {t('textStructureFixerSubtitle')}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={`${getModeColor(fixingOptions.mode)} flex items-center gap-1`}>
            {getModeIcon(fixingOptions.mode)}
            {fixingOptions.mode.charAt(0).toUpperCase() + fixingOptions.mode.slice(1)} Mode
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {fixingOptions.language.charAt(0).toUpperCase() + fixingOptions.language.slice(1)}
          </Badge>
          {fixingResult && (
            <Badge variant="outline" className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              {fixingResult.improvementScore}% Improved
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('fixingOptions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('fixingMode')}</label>
              <Select
                value={fixingOptions.mode}
                onValueChange={(value: FixingMode) => setFixingOptions(prev => ({ ...prev, mode: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    <div className="flex items-center gap-2">
                      <PenTool className="h-4 w-4" />
                      {t('basicFixing')}
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {t('advanced')}
                    </div>
                  </SelectItem>
                  <SelectItem value="academic">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {t('academicStyle')}
                    </div>
                  </SelectItem>
                  <SelectItem value="professional">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {t('professional')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('language')}</label>
              <Select
                value={fixingOptions.language}
                onValueChange={(value: FixingLanguage) => setFixingOptions(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">{t('autoDetect')}</SelectItem>
                  <SelectItem value="english">{t('english')}</SelectItem>
                  <SelectItem value="kurdish">{t('kurdish')}</SelectItem>
                  <SelectItem value="arabic">{t('arabic')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium block">{t('correctionsToApply')}</label>
              
              {[
                { key: 'fixGrammar', label: t('grammarPunctuation'), icon: '📝' },
                { key: 'fixPunctuation', label: t('punctuation'), icon: '❓' },
                { key: 'fixSpelling', label: t('spelling'), icon: '📖' },
                { key: 'fixStructure', label: t('sentenceStructure'), icon: '🏗️' },
                { key: 'fixFlow', label: t('textFlow'), icon: '🌊' },
                { key: 'improveCohesion', label: t('cohesion'), icon: '🔗' },
                { key: 'formatParagraphs', label: t('paragraphOrganization'), icon: '📄' },
                { key: 'enhanceVocabulary', label: t('vocabularyEnhancement'), icon: '💭' }
              ].map(({ key, label, icon }) => (
                <div key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={key}
                    checked={fixingOptions[key as keyof FixingOptions] as boolean}
                    onChange={(e) => setFixingOptions(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={key} className="text-sm flex items-center gap-2">
                    <span>{icon}</span>
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="input" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('inputTab')}
              </TabsTrigger>
              <TabsTrigger value="result" disabled={!fixedText} className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {t('fixedText')}
              </TabsTrigger>
              <TabsTrigger value="comparison" disabled={!fixedText} className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                {t('comparisonTab')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t('textInput')}</CardTitle>
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.pdf,.md"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {t('uploadFile')}
                      </Button>
                    </div>
                  </div>
                  {selectedFile && (
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {selectedFile.name}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t('pasteOrTypeText')}
                    className="min-h-[400px] text-base leading-relaxed"
                  />
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>{inputText.length} {t('characters')}</span>
                    <span>{inputText.split(/\s+/).filter(word => word.length > 0).length} {t('words')}</span>
                  </div>
                </CardContent>
              </Card>

              {isLoading && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Processing Text</span>
                        <span className="text-sm text-gray-500">{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 animate-pulse" />
                        {currentStep}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center gap-3">
                <Button
                  onClick={fixTextStructure}
                  disabled={!inputText.trim() || isLoading}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <Wand2 className="h-5 w-5" />
                  {isLoading ? t('processing') : t('fixText')}
                </Button>
                
                {inputText && (
                  <Button
                    variant="outline"
                    onClick={() => setInputText('')}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t('clear')}
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="result" className="space-y-4">
              {fixedText && (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          {t('fixedText')}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(fixedText)}
                            className="flex items-center gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            {t('copyText')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAsFile(fixedText, 'fixed-text.txt')}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            {t('downloadText')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={exportToPDF}
                            className="flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            {t('exportPdf')}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <pre className="whitespace-pre-wrap text-base leading-relaxed font-sans text-gray-900">
                          {fixedText}
                        </pre>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>{fixedText.length} {t('characters')}</span>
                        <span>{fixedText.split(/\s+/).filter(word => word.length > 0).length} {t('words')}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {fixingResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t('improvementSummary')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {fixingResult.improvementScore}%
                            </div>
                            <div className="text-sm text-gray-500">Improvement</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {(fixingResult.processingTime / 1000).toFixed(1)}s
                            </div>
                            <div className="text-sm text-gray-500">Process Time</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {fixingResult.changes.length}
                            </div>
                            <div className="text-sm text-gray-500">Changes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {fixingOptions.mode}
                            </div>
                            <div className="text-sm text-gray-500">Mode</div>
                          </div>
                        </div>
                        
                        {fixingResult.suggestions.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              Additional Suggestions
                            </h4>
                            <ul className="space-y-1">
                              {fixingResult.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-yellow-500 mt-1">•</span>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              {fixedText && inputText && (
                <>
                  {/* Unified Diff View */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        {t('textChangesHighlighted')}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-3 h-3 bg-green-100 border border-green-200 rounded"></span>
                          {t('addedText')}
                        </span>
                        <span className="inline-flex items-center gap-1 ml-4">
                          <span className="w-3 h-3 bg-red-100 border border-red-200 rounded"></span>
                          {t('removedText')}
                        </span>
                        <span className="inline-flex items-center gap-1 ml-4">
                          <span className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></span>
                          {t('changedText')}
                        </span>
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                        <div 
                          className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-gray-900"
                          dangerouslySetInnerHTML={{
                            __html: TextDiffGenerator.renderDiffAsHTML(
                              TextDiffGenerator.generateDiff(inputText, fixedText)
                            )
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Side-by-Side Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        {t('sideBySideComparison')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {t('originalText')}
                          </h4>
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200 max-h-96 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-red-900">
                              {inputText}
                            </pre>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3 text-green-600 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {t('fixedText')}
                          </h4>
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200 max-h-96 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-green-900">
                              {fixedText}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default TextStructureFixer;