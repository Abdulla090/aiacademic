import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Calendar, Clock, CheckCircle, Circle, AlertCircle, RefreshCw, Plus, Download, Brain, Target, Zap, BookOpen, Dumbbell, Briefcase, FlaskConical, Languages, Award, Upload, FileText, X, Eye } from 'lucide-react';
import { geminiService, type TaskPlan } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from "jspdf";
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { LanguageSelection } from './LanguageSelection';

export const TaskPlanner = () => {
  const [projectTitle, setProjectTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [responseLanguage, setResponseLanguage] = useState('en');
  const [details, setDetails] = useState('');
  const [taskType, setTaskType] = useState('study');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [availableHoursPerDay, setAvailableHoursPerDay] = useState([2]);
  const [preferredStudyTimes, setPreferredStudyTimes] = useState<string[]>(['morning']);
  const [subjects, setSubjects] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const handleFileUpload = async (files: FileList) => {
    setIsProcessingFiles(true);
    try {
      const fileArray = Array.from(files);
      setUploadedFiles(fileArray);
      
      const content = await geminiService.extractTextFromMultipleFiles(fileArray);
      setExtractedContent(content);
      
      toast({
        title: "Files processed successfully! 📁",
        description: `Extracted content from ${fileArray.length} file(s). Ready to create your magical plan!`,
      });
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "File processing failed",
        description: "There was an error processing your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    
    if (newFiles.length === 0) {
      setExtractedContent('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };
  const [tasks, setTasks] = useState<TaskPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const taskTypes = [
    { value: 'exam', label: '🎯 امتحان', icon: Target, color: 'text-red-600' },
    { value: 'study', label: '📚 خوێندن', icon: BookOpen, color: 'text-blue-600' },
    { value: 'assignment', label: '📝 ئەرک', icon: Circle, color: 'text-green-600' },
    { value: 'research', label: '🔬 توێژینەوە', icon: FlaskConical, color: 'text-purple-600' },
    { value: 'language', label: '🗣️ زمان', icon: Languages, color: 'text-orange-600' },
    { value: 'workout', label: '💪 وەرزش', icon: Dumbbell, color: 'text-purple-600' },
    { value: 'work', label: '💼 کار', icon: Briefcase, color: 'text-gray-600' },
    { value: 'skill', label: '⭐ شارەزایی', icon: Award, color: 'text-yellow-600' }
  ];

  const studyTimes = [
    { value: 'early-morning', label: '🌅 بەیانی زوو (5-8)' },
    { value: 'morning', label: '☀️ بەیانی (8-12)' },
    { value: 'afternoon', label: '🌤️ دوانیوەڕۆ (12-17)' },
    { value: 'evening', label: '🌇 ئێوارە (17-21)' },
    { value: 'night', label: '🌙 شەو (21-24)' }
  ];

  const levels = [
    { value: 'beginner', label: '🌱 دەستپێکەر' },
    { value: 'intermediate', label: '📈 ناوەند' },
    { value: 'advanced', label: '🎓 پێشکەوتوو' },
    { value: 'expert', label: '⚡ شارەزا' }
  ];

  const handleGeneratePlan = async () => {
    if (!projectTitle.trim() || !deadline || !details.trim()) {
      toast({
        title: 'هەڵە ❌',
        description: 'تکایە هەموو زانیارییەکان تەواو بکە',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await geminiService.generateSmartTaskPlan(
        projectTitle,
        deadline,
        details,
        taskType,
        currentLevel,
        availableHoursPerDay[0],
        preferredStudyTimes.map(id => studyTimes.find(t => t.value === id)?.label).filter(Boolean),
        subjects.split(',').map(s => s.trim()).filter(Boolean),
        extractedContent || undefined
      );
      
      setTasks(result);
      toast({
        title: '✨ پلانی جادووی دروست کرا!',
        description: `${result.length} ئەرک بە شێوەیەکی زیرەکانە ڕێکخرا`,
      });
    } catch (error) {
      console.error('Plan generation error:', error);
      toast({
        title: 'هەڵە ⚠️',
        description: 'نەتوانرا پلانەکە دروست بکرێت. تکایە دووبارە هەوڵ بدەوە',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudyTimeChange = (time: string, checked: boolean) => {
    if (checked) {
      setPreferredStudyTimes([...preferredStudyTimes, time]);
    } else {
      setPreferredStudyTimes(preferredStudyTimes.filter(t => t !== time));
    }
  };

  const handleTaskStatusChange = (taskIndex: number, newStatus: TaskPlan['status']) => {
    setTasks(prev => prev.map((task, index) => 
      index === taskIndex ? { ...task, status: newStatus } : task
    ));
    
    toast({
      title: 'دۆخی ئەرک گۆڕا',
      description: 'دۆخی ئەرکەکە نوێکرایەوە'
    });
  };

  const getPriorityColor = (priority: TaskPlan['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300';
    }
  };

  const getPriorityText = (priority: TaskPlan['priority']) => {
    switch (priority) {
      case 'high': return 'بەرز';
      case 'medium': return 'ناوەند';
      case 'low': return 'کەم';
      default: return 'نادیار';
    }
  };
  
  const handleExport = async (format: 'text' | 'pdf' = 'text') => {
    try {
      if (tasks.length === 0) {
        toast({
          title: 'هەڵە',
          description: 'هیچ ئەرکێک نییە بۆ دەرهێنان',
          variant: 'destructive'
        });
        return;
      }
      
      const taskText = tasks.map((task, index) =>
        `${index + 1}. ${task.title || 'نادیار'}\n   ${task.description || 'نادیار'}\n   کاتی کۆتایی: ${task.deadline || 'نادیار'}\n   گرنگی: ${getPriorityText(task.priority)}\n   دۆخ: ${getStatusText(task.status)}\n`
      ).join('\n');
      
      if (format === 'pdf') {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Add title
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('پلانی ئەرکەکان', pageWidth / 2, 20, { align: 'center' });
        
        // Reset font
        doc.setFont(undefined, 'normal');
        doc.setFontSize(12);
        
        // Add project info
        doc.text(`ناونیشانی پڕۆژە: ${projectTitle || 'نادیار'}`, 10, 40);
        doc.text(`کاتی کۆتایی: ${deadline || 'نادیار'}`, 10, 50);
        
        // Add tasks with better formatting
        let yPosition = 70;
        doc.setFontSize(10);
        
        tasks.forEach((task, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 20;
            doc.setFontSize(10);
          }
          
          // Add task title with bold formatting
          doc.setFont(undefined, 'bold');
          doc.text(`ئەرکی ${index + 1}: ${task.title || 'نادیار'}`, 10, yPosition);
          yPosition += 10;
          
          // Reset font for task details
          doc.setFont(undefined, 'normal');
          
          // Add task details
          const taskDetails = [
            `وەسف: ${task.description || 'نادیار'}`,
            `کاتی کۆتایی: ${task.deadline || 'نادیار'}`,
            `گرنگی: ${getPriorityText(task.priority)}`,
            `دۆخ: ${getStatusText(task.status)}`
          ];
          
          taskDetails.forEach((line, lineIndex) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 20;
              doc.setFontSize(10);
              doc.setFont(undefined, 'normal');
            }
            
            doc.text(line, 15, yPosition);
            yPosition += 7;
          });
          
          yPosition += 15; // Space between tasks
        });
        
        // Save the PDF
        doc.save('پلانی ئەرکەکان.pdf');
        toast({
          title: 'دەرهێنان',
          description: 'پلانی ئەرکەکان دابەزێنرا'
        });
        return;
      }
      
      const blob = new Blob([taskText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'پلانی ئەرکەکان.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'دەرهێنان',
        description: 'پلانی ئەرکەکان دابەزێنرا'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا فایلەکە دابەزێنرێت',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: TaskPlan['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: TaskPlan['status']) => {
    switch (status) {
      case 'completed': return 'تەواو';
      case 'in-progress': return 'لە کاردایە';
      case 'pending': return 'چاوەڕوان';
      default: return 'نادیار';
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-primary rounded-xl text-primary-foreground">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground sorani-text">پلانەری ئەرک و تویژینەوە</h1>
          <p className="text-muted-foreground latin-text">Task & Research Planner</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
        {/* Input Panel */}
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="sorani-text">زانیاری پڕۆژە</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium sorani-text flex items-center gap-2">
                <Target className="h-4 w-4" />
                ناونیشانی پڕۆژە
              </label>
              <Input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="ناونیشانی پڕۆژەکەت بنووسە..."
                className="input-academic sorani-text"
              />
            </div>

            {/* Task Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium sorani-text flex items-center gap-2">
                <Brain className="h-4 w-4" />
                جۆری ئەرک
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {taskTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Button
                      key={type.value}
                      variant={taskType === type.value ? "default" : "outline"}
                      onClick={() => setTaskType(type.value)}
                      className={`justify-start gap-2 h-auto py-3 ${
                        taskType === type.value ? 'bg-purple-600 hover:bg-purple-700' : ''
                      }`}
                    >
                      <IconComponent className={`h-4 w-4 ${type.color}`} />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Current Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium sorani-text flex items-center gap-2">
                <Award className="h-4 w-4" />
                ئاستی ئێستا
              </label>
              <Select value={currentLevel} onValueChange={setCurrentLevel}>
                <SelectTrigger className="sorani-text">
                  <SelectValue placeholder="ئاستەکەت هەڵبژێرە" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Available Hours */}
            <div className="space-y-3">
              <label className="text-sm font-medium sorani-text flex items-center gap-2">
                <Clock className="h-4 w-4" />
                کات لە ڕۆژدا: {availableHoursPerDay[0]} کاتژمێر
              </label>
              <Slider
                value={availableHoursPerDay}
                onValueChange={setAvailableHoursPerDay}
                max={12}
                min={0.5}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>٣٠ خولەک</span>
                <span>١٢ کاتژمێر</span>
              </div>
            </div>

            {/* Preferred Study Times */}
            <div className="space-y-3">
              <label className="text-sm font-medium sorani-text flex items-center gap-2">
                <Zap className="h-4 w-4" />
                کاتی چاک بۆ کار
              </label>
              <div className="grid grid-cols-1 gap-2">
                {studyTimes.map((time) => (
                  <div key={time.value} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={time.value}
                      checked={preferredStudyTimes.includes(time.value)}
                      onCheckedChange={(checked) => handleStudyTimeChange(time.value, !!checked)}
                    />
                    <label
                      htmlFor={time.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sorani-text"
                    >
                      {time.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Subjects/Topics */}
            <div className="space-y-2">
              <label className="text-sm font-medium sorani-text flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                بابەت/موضوعەکان
              </label>
              <Input
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="بیرکاری، فیزیا، کیمیا (بە کۆما جیابکەرەوە)"
                className="input-academic sorani-text"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="text-sm font-medium sorani-text flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                کاتی کۆتایی
              </label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input-academic"
              />
            </div>

            {/* Project Details */}
            <div className="space-y-2">
              <label className="text-sm font-medium sorani-text">وردەکارییەکان</label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="وردەکارییەکانی پڕۆژەکە بنووسە..."
                className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base sorani-text"
              />
            </div>

             <LanguageSelection
               selectedLanguage={responseLanguage}
               onLanguageChange={setResponseLanguage}
             />

            {/* File Upload Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium sorani-text flex items-center gap-2">
                <Upload className="h-4 w-4" />
                دۆکیومێنتەکان بەرزبکەرەوە (PDF, Word, Text)
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100"
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {isProcessingFiles ? (
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
                      <p className="text-sm text-purple-700 sorani-text">دۆکیومێنتەکان دەخوێنرێنەوە...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-purple-600" />
                      <p className="text-sm text-purple-700 sorani-text">
                        دۆکیومێنتەکان ڕاکێشە یان کلیک بکە
                      </p>
                      <p className="text-xs text-purple-500">
                        PDF, Word, Text files supported
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Uploaded Files Display */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-700 sorani-text">
                    دۆکیومێنتە بەرزکراوەکان ({uploadedFiles.length}):
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-purple-100 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-purple-800 truncate max-w-[200px]">
                            {file.name}
                          </span>
                          <span className="text-xs text-purple-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {extractedContent && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // Show preview of extracted content
                                toast({
                                  title: "Content Preview",
                                  description: extractedContent.substring(0, 200) + "...",
                                });
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Status */}
              {extractedContent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 sorani-text">
                      ناوەڕۆک سەرکەوتووانە دەرهێنرا! 🎉
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    AI will create a personalized plan based on your documents
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleGeneratePlan}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span className="sorani-text">جادو لە کاردایە... ✨</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    <span className="sorani-text">جادووی پلان دروستکە! 🪄</span>
                  </>
                )}
              </Button>
            </div>

            {/* AI Insights */}
            {tasks.length === 0 && !loading && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800 sorani-text">زیرەکی دەستکرد</h3>
                </div>
                <p className="text-sm text-purple-700 sorani-text leading-relaxed">
                  پلانەکەت بە زیرەکانەترین شێوە دروست دەکرێت! هوشی دەستکرد:
                </p>
                <ul className="mt-2 text-xs text-purple-600 space-y-1 sorani-text">
                  <li>• 🎯 پلانی تایبەت بۆ جۆری ئەرکەکەت</li>
                  <li>• 🧠 تەکنیکی دووبارەکردنەوەی بۆشایی</li>
                  <li>• ⚡ دابەشکردن بەپێی توانا و کات</li>
                  <li>• 🎉 خاڵی شادکردن و پاداشت</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        
        {tasks.length > 0 && (
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => handleExport('text')}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              دەرهێنانی دەق
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              دەرهێنانی PDF
            </Button>
          </div>
        )}

        {/* Tasks Panel */}
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="sorani-text flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              پلانی جادووی ئەرکەکان
            </CardTitle>
            {tasks.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground sorani-text">
                  {completedTasks} لە {tasks.length} ئەرک تەواو بووە ({Math.round(progressPercentage)}%)
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                {/* Motivation Message */}
                {progressPercentage > 0 && (
                  <div className="text-xs text-purple-600 sorani-text">
                    {progressPercentage === 100 ? '🎉 تۆ هەموو ئەرکەکانت تەواو کرد! بەشت پیرۆزە!' :
                     progressPercentage >= 75 ? '🚀 تۆ لە ڕێگای دروستدایت! بەردەوام بە!' :
                     progressPercentage >= 50 ? '💪 ناوەندی ڕێگا! تۆ دەتوانیت!' :
                     progressPercentage >= 25 ? '🌟 دەستپێکردنی باش! بەردەوام بە!' :
                     '✨ هەنگاوی یەکەم هەڵگیراوە!'
                    }
                  </div>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              const newStatus = task.status === 'completed' ? 'pending' : 
                                             task.status === 'pending' ? 'in-progress' : 'completed';
                              handleTaskStatusChange(index, newStatus);
                            }}
                          >
                            {getStatusIcon(task.status)}
                          </button>
                          <h3 className="font-semibold sorani-text">{task.title}</h3>
                        </div>
                        <div className="sorani-text text-sm text-muted-foreground">
                          <RichTextRenderer
                            content={task.description}
                            showCopyButton={false}
                            className="report-content sorani-text"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Task Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        {task.duration && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="sorani-text">{task.duration}</span>
                          </div>
                        )}
                        {task.category && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <BookOpen className="h-3 w-3" />
                            <span className="sorani-text">{task.category}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {task.dailyTime && task.dailyTime !== 'flexible' && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Zap className="h-3 w-3" />
                            <span className="sorani-text">{task.dailyTime}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(task.deadline).toLocaleDateString('ku')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                          گرنگی: {getPriorityText(task.priority)}
                        </Badge>
                        <Badge variant="outline">
                          {getStatusText(task.status)}
                        </Badge>
                        {task.difficulty && (
                          <Badge variant="outline" className={
                            task.difficulty === 'hard' ? 'border-red-300 text-red-700' :
                            task.difficulty === 'medium' ? 'border-yellow-300 text-yellow-700' :
                            'border-green-300 text-green-700'
                          }>
                            {task.difficulty === 'hard' ? '🔥 سەخت' :
                             task.difficulty === 'medium' ? '⚡ ناوەند' : '🌟 ئاسان'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Resources */}
                    {task.resources && task.resources.length > 0 && (
                      <div className="border-t pt-2">
                        <div className="text-xs text-muted-foreground mb-1 sorani-text">سەرچاوەکان:</div>
                        <div className="flex flex-wrap gap-1">
                          {task.resources.map((resource, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] sm:h-[400px] text-muted-foreground text-sm sm:text-base">
                <div className="text-center">
                  <div className="relative">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <div className="absolute -top-2 -right-2 animate-pulse">
                      <div className="h-4 w-4 bg-purple-400 rounded-full opacity-70"></div>
                    </div>
                  </div>
                  <p className="sorani-text">پلانی جادووی ئەرکەکان لێرە دەردەکەوێت</p>
                  <p className="text-xs text-muted-foreground mt-2 sorani-text">
                    زانیارییەکانت تەواو بکە و جادو دەست پێ بکە! ✨
                  </p>
                </div>
              </div>
            )}
            
            {/* Export Buttons */}
            {tasks.length > 0 && (
              <div className="flex gap-2 mt-4 px-6 pb-6">
                <Button
                  variant="outline"
                  onClick={() => handleExport('text')}
                  className="flex-1 sorani-text"
                >
                  <Download className="h-4 w-4 mr-2" />
                  دەرهێنانی دەق
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('pdf')}
                  className="flex-1 sorani-text"
                >
                  <Download className="h-4 w-4 mr-2" />
                  دەرهێنانی PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};