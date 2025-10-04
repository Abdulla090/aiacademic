import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Clock, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Award,
  Brain,
  FileText,
  CheckCircle,
  AlertCircle,
  Users,
  Lightbulb
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StudySession {
  id: string;
  toolName: string;
  duration: number;
  date: Date;
  tasksCompleted: number;
  quality: 'excellent' | 'good' | 'average' | 'needs_improvement';
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  category: string;
  isCompleted: boolean;
}

interface ToolUsageStats {
  toolName: string;
  usageCount: number;
  totalTime: number;
  averageSession: number;
  lastUsed: Date;
  completionRate: number;
}

const StudyAnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [toolStats, setToolStats] = useState<ToolUsageStats[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  // Sample data - in a real app, this would come from localStorage or API
  useEffect(() => {
    const sampleSessions: StudySession[] = [
      {
        id: '1',
        toolName: 'Article Writer',
        duration: 45,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tasksCompleted: 2,
        quality: 'excellent'
      },
      {
        id: '2',
        toolName: 'Grammar Checker',
        duration: 20,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tasksCompleted: 5,
        quality: 'good'
      },
      {
        id: '3',
        toolName: 'Kurdish Dialect Translator',
        duration: 30,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        tasksCompleted: 10,
        quality: 'excellent'
      },
      {
        id: '4',
        toolName: 'Mind Map Generator',
        duration: 35,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        tasksCompleted: 3,
        quality: 'good'
      },
      {
        id: '5',
        toolName: 'Report Generator',
        duration: 60,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tasksCompleted: 1,
        quality: 'excellent'
      }
    ];

    const sampleGoals: LearningGoal[] = [
      {
        id: '1',
        title: 'Complete 10 Articles',
        description: 'Write 10 academic articles using the Article Writer tool',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        progress: 60,
        category: 'Writing',
        isCompleted: false
      },
      {
        id: '2',
        title: 'Master Kurdish Translation',
        description: 'Practice Kurdish dialect translation daily for 2 weeks',
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        progress: 85,
        category: 'Language',
        isCompleted: false
      },
      {
        id: '3',
        title: 'Grammar Proficiency',
        description: 'Achieve 90% accuracy in grammar checking',
        targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        progress: 100,
        category: 'Grammar',
        isCompleted: true
      }
    ];

    const sampleToolStats: ToolUsageStats[] = [
      {
        toolName: 'Article Writer',
        usageCount: 15,
        totalTime: 720,
        averageSession: 48,
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completionRate: 85
      },
      {
        toolName: 'Grammar Checker',
        usageCount: 25,
        totalTime: 380,
        averageSession: 15,
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completionRate: 92
      },
      {
        toolName: 'Kurdish Dialect Translator',
        usageCount: 20,
        totalTime: 450,
        averageSession: 22,
        lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completionRate: 88
      },
      {
        toolName: 'Mind Map Generator',
        usageCount: 8,
        totalTime: 240,
        averageSession: 30,
        lastUsed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        completionRate: 75
      }
    ];

    setStudySessions(sampleSessions);
    setLearningGoals(sampleGoals);
    setToolStats(sampleToolStats);
  }, []);

  // Calculate analytics
  const totalStudyTime = studySessions.reduce((acc, session) => acc + session.duration, 0);
  const averageSessionLength = studySessions.length > 0 ? totalStudyTime / studySessions.length : 0;
  const completedGoals = learningGoals.filter(goal => goal.isCompleted).length;
  const overallProgress = learningGoals.length > 0 ? 
    learningGoals.reduce((acc, goal) => acc + goal.progress, 0) / learningGoals.length : 0;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'average': return 'bg-yellow-500';
      case 'needs_improvement': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getQualityText = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'نایاب';
      case 'good': return 'باش';
      case 'average': return 'ناوەند';
      case 'needs_improvement': return 'پێویستی بە باشترکردن';
      default: return 'نادیار';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ک ${mins}خ` : `${mins}خ`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ku', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <BarChart3 className="text-indigo-600" />
            داشبۆردی شیکاری خوێندن
          </h1>
          <p className="text-gray-700">
            بەدواداچوون و شیکاری پێشکەوتنی ئەکادیمی تۆ
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">کۆی کاتی خوێندن</p>
                  <p className="text-xl sm:text-2xl font-bold">{formatTime(totalStudyTime)}</p>
                </div>
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">ئامانجە تەواوکراوەکان</p>
                  <p className="text-xl sm:text-2xl font-bold">{completedGoals}/{learningGoals.length}</p>
                </div>
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">ناوەندی دانیشتن</p>
                  <p className="text-2xl font-bold">{formatTime(Math.round(averageSessionLength))}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">گشتی پێشکەوتن</p>
                  <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">گشتی</span>
              <span className="sm:hidden">📊</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="text-xs sm:text-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">ئامانجەکان</span>
              <span className="sm:hidden">🎯</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs sm:text-sm">
              <Brain className="w-4 h-4 ml-2" />
              ئامرازەکان
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Calendar className="w-4 h-4 ml-2" />
              دانیشتنەکان
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Weekly Progress Chart */}
              <Card className="bg-white/80 backdrop-blur border-indigo-200">
                <CardHeader>
                  <CardTitle className="text-gray-800">پێشکەوتنی حەفتانە</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە', 'یەکشەممە'].map((day, index) => (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{day}</span>
                        <div className="flex items-center gap-2 flex-1 max-w-xs">
                          <Progress value={Math.random() * 100} className="flex-1" />
                          <span className="text-sm text-gray-500">{Math.floor(Math.random() * 120)}خ</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card className="bg-white/80 backdrop-blur border-indigo-200">
                <CardHeader>
                  <CardTitle className="text-gray-800 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    دەستکەوتە نوێیەکان
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Award className="w-6 h-6 text-yellow-500" />
                      <div>
                        <p className="font-semibold text-gray-800">شارەزای ڕێزمان</p>
                        <p className="text-sm text-gray-600">٩٠٪ وردی لە پشکنینی ڕێزمان</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                      <div>
                        <p className="font-semibold text-gray-800">نووسەری بەرهەمهێنەر</p>
                        <p className="text-sm text-gray-600">١٠ بابەت لە ماوەی ١ حەفتە</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Lightbulb className="w-6 h-6 text-purple-500" />
                      <div>
                        <p className="font-semibold text-gray-800">خاوەنی بیرۆکە</p>
                        <p className="text-sm text-gray-600">٥ نەخشەی مێشک دروستکراو</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <Card className="bg-white/80 backdrop-blur border-indigo-200">
              <CardHeader>
                <CardTitle className="text-gray-800">ئامانجەکانی فێربوون</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningGoals.map((goal) => (
                    <div key={goal.id} className="p-4 border border-indigo-200 rounded-lg bg-indigo-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            {goal.isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-orange-500" />
                            )}
                            {goal.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        </div>
                        <Badge variant={goal.isCompleted ? "default" : "secondary"}>
                          {goal.category}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>پێشکەوتن: {goal.progress}%</span>
                          <span>بەرواری ئامانج: {formatDate(goal.targetDate)}</span>
                        </div>
                        <Progress value={goal.progress} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools">
            <Card className="bg-white/80 backdrop-blur border-indigo-200">
              <CardHeader>
                <CardTitle className="text-gray-800">ئامارەکانی ئامرازەکان</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {toolStats.map((tool, index) => (
                    <div key={index} className="p-4 border border-indigo-200 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                      <h3 className="font-semibold text-gray-800 mb-3">{tool.toolName}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ژمارەی بەکارهێنان:</span>
                          <span className="font-semibold">{tool.usageCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">کۆی کات:</span>
                          <span className="font-semibold">{formatTime(tool.totalTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ناوەندی دانیشتن:</span>
                          <span className="font-semibold">{formatTime(tool.averageSession)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ڕێژەی تەواوکردن:</span>
                          <span className="font-semibold text-green-600">{tool.completionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">دواجار بەکارهێنراو:</span>
                          <span className="font-semibold">{formatDate(tool.lastUsed)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card className="bg-white/80 backdrop-blur border-indigo-200">
              <CardHeader>
                <CardTitle className="text-gray-800">دانیشتنە نوێیەکانی خوێندن</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studySessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border border-indigo-200 rounded-lg bg-indigo-50/30">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getQualityColor(session.quality)}`}></div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{session.toolName}</h4>
                          <p className="text-sm text-gray-600">
                            {session.tasksCompleted} ئەرک تەواو کراوە - {formatTime(session.duration)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{getQualityText(session.quality)}</Badge>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(session.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudyAnalyticsDashboard;
