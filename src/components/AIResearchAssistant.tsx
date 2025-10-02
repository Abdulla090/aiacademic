import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Brain, 
  BookOpen, 
  FileText, 
  Download, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  Lightbulb,
  Target,
  Zap,
  Clock,
  Star,
  ExternalLink,
  Bookmark,
  Filter,
  RefreshCw,
 Settings2
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { researchQuery } from "@/services/geminiService";
import { LanguageSelection } from './LanguageSelection';

interface ResearchQuery {
  id: string;
  query: string;
  timestamp: Date;
  status: 'processing' | 'completed' | 'error';
  results?: ResearchResult[];
}

interface ResearchResult {
  id: string;
  title: string;
  summary: string;
  sources: Source[];
  credibilityScore: number;
  keyFindings: string[];
  relatedTopics: string[];
  citations: Citation[];
}

interface Source {
  id: string;
  title: string;
  url: string;
  credibilityScore: number;
  type: 'academic' | 'news' | 'government' | 'organization' | 'other';
  publishDate?: string;
  author?: string;
}

interface Citation {
  id: string;
  format: 'APA' | 'MLA' | 'Chicago';
  citation: string;
}

export const AIResearchAssistant: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentQuery, setCurrentQuery] = useState('');
  const [researchQueries, setResearchQueries] = useState<ResearchQuery[]>([]);
  const [activeTab, setActiveTab] = useState('search');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ResearchResult | null>(null);
  const [searchFilters, setSearchFilters] = useState({
    sources: [] as string[],
    dateRange: 'all',
    credibilityThreshold: 70
  });
  const [responseLanguage, setResponseLanguage] = useState('en');

  // Mock research data for demonstration
  const mockResearchResult: ResearchResult = {
    id: '1',
    title: 'Climate Change and Renewable Energy Solutions',
    summary: 'Comprehensive analysis of current climate change trends and the role of renewable energy technologies in mitigation strategies. This research covers solar, wind, and hydroelectric power developments, policy implications, and economic considerations for sustainable energy transition.',
    credibilityScore: 92,
    keyFindings: [
      'Solar energy costs have decreased by 85% over the past decade',
      'Wind power capacity has tripled globally since 2010',
      'Government policies play a crucial role in renewable energy adoption',
      'Job creation in renewable sectors exceeds losses in fossil fuel industries'
    ],
    relatedTopics: [
      'Carbon emissions reduction',
      'Energy storage technologies',
      'Smart grid implementation',
      'Environmental policy',
      'Sustainable development goals'
    ],
    sources: [
      {
        id: '1',
        title: 'International Energy Agency Report 2024',
        url: 'https://iea.org/reports/renewable-energy-2024',
        credibilityScore: 95,
        type: 'government',
        publishDate: '2024-03-15',
        author: 'IEA Research Team'
      },
      {
        id: '2',
        title: 'Nature Climate Change Journal',
        url: 'https://nature.com/climate-solutions',
        credibilityScore: 98,
        type: 'academic',
        publishDate: '2024-02-20',
        author: 'Dr. Sarah Johnson et al.'
      },
      {
        id: '3',
        title: 'World Bank Energy Transition Report',
        url: 'https://worldbank.org/energy-transition',
        credibilityScore: 90,
        type: 'organization',
        publishDate: '2024-01-10',
        author: 'World Bank Group'
      }
    ],
    citations: [
      {
        id: '1',
        format: 'APA',
        citation: 'International Energy Agency. (2024). Renewable Energy Market Update 2024. IEA Publications.'
      },
      {
        id: '2',
        format: 'MLA',
        citation: 'Johnson, Sarah, et al. "Climate Solutions Through Renewable Energy." Nature Climate Change, vol. 14, no. 3, 2024, pp. 45-62.'
      },
      {
        id: '3',
        format: 'Chicago',
        citation: 'World Bank Group. "Global Energy Transition: Progress and Challenges." World Bank, January 10, 2024.'
      }
    ]
  };

  const handleResearch = async () => {
    if (!currentQuery.trim()) {
      toast({
        title: "خاڵی",
        description: "تکایە پرسیارێک بنووسە بۆ گەڕان",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    const newQuery: ResearchQuery = {
      id: Date.now().toString(),
      query: currentQuery,
      timestamp: new Date(),
      status: 'processing'
    };

    setResearchQueries(prev => [newQuery, ...prev]);

    try {
      // Use real AI research
      const result = await researchQuery(currentQuery);
      
      const completedQuery: ResearchQuery = {
        ...newQuery,
        status: 'completed',
        results: [result]
      };

      setResearchQueries(prev => 
        prev.map(q => q.id === newQuery.id ? completedQuery : q)
      );
      setSelectedResult(result);
      setIsProcessing(false);
      setActiveTab('results');

      toast({
        title: "سەرکەوتوو",
        description: "گەڕانەکە تەواو بوو",
      });
    } catch (error) {
      console.error('Research error:', error);
      
      const errorQuery: ResearchQuery = {
        ...newQuery,
        status: 'error'
      };

      setResearchQueries(prev => 
        prev.map(q => q.id === newQuery.id ? errorQuery : q)
      );
      setIsProcessing(false);

      toast({
        title: "هەڵە",
        description: "هەڵەیەک ڕوویدا لە گەڕانەکەدا. تکایە دووبارە هەوڵبدەوە.",
        variant: "destructive"
      });
    }

    setCurrentQuery('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "کۆپی کرا",
      description: "دەقەکە کۆپی کرا بۆ کلیپبۆرد",
    });
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'academic': return <BookOpen className="h-4 w-4" />;
      case 'government': return <Globe className="h-4 w-4" />;
      case 'organization': return <Target className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          🤖 یاریدەدەری تویژینەوەی AI
        </h1>
        <p className="text-lg text-muted-foreground">
          یاریدەدەری پێشکەوتوو بۆ تویژینەوە لەگەڵ پشتڕاستکردنەوەی سەرچاوەکان و پشتگیری تەواو
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            گەڕان
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            ئەنجامەکان
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            سەرچاوەکان
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            مێژوو
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            ڕێکخستنەکان
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-600" />
                گەڕانی تویژینەوە
              </CardTitle>
              <CardDescription>
                پرسیارەکەت بنووسە و AI یەکە ئەنجامە باشترینەکانت بۆ دەهێنێتەوە
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Textarea
                    placeholder="بۆ نموونە: کاریگەری گۆڕانی کەشوهەوا لەسەر وزەی نوێکردنەوە چییە؟"
                    value={currentQuery}
                    onChange={(e) => setCurrentQuery(e.target.value)}
                    className="min-h-[100px] text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleResearch}
                  disabled={isProcessing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      گەڕان...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      دەستپێکردنی گەڕان
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>پالاوتن: سەرچاوە بڕواپێکراوەکان</span>
                </div>
              </div>

              {isProcessing && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>گەڕان لە سەرچاوە بڕواپێکراوەکان...</p>
                      <Progress value={33} className="w-full" />
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                پێشنیارەکانی گەڕان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "کاریگەری AI لەسەر پەروەردە",
                  "ڕێگاکانی چارەسەری گۆڕانی کەشوهەوا",
                  "گەشەسەندنی تەکنەلۆژیای پزیشکی",
                  "کاریگەری میدیا کۆمەڵایەتییەکان لەسەر هەڵسوکەوت"
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start text-right h-auto p-3"
                    onClick={() => setCurrentQuery(suggestion)}
                    dir="rtl"
                  >
                    <span className="text-sm">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {selectedResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {selectedResult.title}
                        </CardTitle>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-green-100 text-green-800">
                            <Star className="h-3 w-3 mr-1" />
                            دڵنیایی: {selectedResult.credibilityScore}%
                          </Badge>
                          <Badge variant="outline">
                            {selectedResult.sources.length} سەرچاوە
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">پوختە:</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {selectedResult.summary}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-3">دۆزینەوە سەرەکییەکان:</h4>
                        <div className="space-y-2">
                          {selectedResult.keyFindings.map((finding, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                              <span className="text-sm">{finding}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      سەرچاوەکان
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedResult.sources.map((source) => (
                        <div key={source.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getSourceTypeIcon(source.type)}
                              <h5 className="font-medium">{source.title}</h5>
                            </div>
                            <Badge className={getCredibilityColor(source.credibilityScore)}>
                              {source.credibilityScore}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{source.author}</span>
                            <span>{source.publishDate}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(source.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              بینین
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      بابەتە پەیوەندیدارەکان
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedResult.relatedTopics.map((topic, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start text-sm h-auto p-2"
                          onClick={() => setCurrentQuery(topic)}
                        >
                          <Zap className="h-3 w-3 mr-2" />
                          {topic}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      سایتەکان
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedResult.citations.map((citation) => (
                        <div key={citation.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{citation.format}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(citation.citation)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">
                            {citation.citation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Download className="h-4 w-4 mr-2" />
                  داگرتنی ڕاپۆرت
                </Button>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">هیچ ئەنجامێک نەدۆزرایەوە</h3>
                <p className="text-muted-foreground text-center">
                  گەڕانێک دەستپێبکە بۆ بینینی ئەنجامەکان
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>سەرچاوە بڕواپێکراوەکان</CardTitle>
              <CardDescription>
                لیستی سەرچاوە ئەکادیمی و بڕواپێکراوەکان
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "گۆڤاری نەیچەر", type: "ئەکادیمی", score: 98 },
                  { name: "ڕێکخراوی وزەی نێودەوڵەتی", type: "حکومی", score: 95 },
                  { name: "زانکۆی هارڤارد", type: "ئەکادیمی", score: 97 },
                  { name: "بانکی جیهانی", type: "ڕێکخراو", score: 90 },
                  { name: "یونێسکۆ", type: "نێودەوڵەتی", score: 93 },
                  { name: "ڕۆیتەرز", type: "هەواڵ", score: 85 }
                ].map((source, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{source.name}</h4>
                        <Badge className={getCredibilityColor(source.score)}>
                          {source.score}%
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {source.type}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مێژووی گەڕان</CardTitle>
              <CardDescription>
                گەڕانە ڕابردووەکانت
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {researchQueries.map((query) => (
                    <div key={query.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium">{query.query}</p>
                        <Badge 
                          variant={query.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {query.status === 'completed' ? 'تەواو' : 'لە کارەدا'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{query.timestamp.toLocaleDateString('ku')}</span>
                        {query.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (query.results?.[0]) {
                                setSelectedResult(query.results[0]);
                                setActiveTab('results');
                              }
                            }}
                          >
                            بینینی ئەنجامەکان
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {researchQueries.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      هیچ گەڕانێک نەکراوە تا ئێستا
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ڕێکخستنەکانی گەڕان</CardTitle>
              <CardDescription>
                هەڵبژاردنەکانی گەڕانەکەت بگۆڕە
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <LanguageSelection
                 selectedLanguage={responseLanguage}
                 onLanguageChange={setResponseLanguage}
               />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
