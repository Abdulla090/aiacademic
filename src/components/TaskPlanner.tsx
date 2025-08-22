import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, Circle, AlertCircle, RefreshCw, Plus, Download } from 'lucide-react';
import { geminiService, type TaskPlan } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from "jspdf";

export const TaskPlanner = () => {
  const [projectTitle, setProjectTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [details, setDetails] = useState('');
  const [tasks, setTasks] = useState<TaskPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    if (!projectTitle.trim() || !deadline || !details.trim()) {
      toast({
        title: 'هەڵە',
        description: 'تکایە هەموو زانیارییەکان تەواو بکە',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await geminiService.generateTaskPlan(projectTitle, deadline, details);
      setTasks(result);
      toast({
        title: 'پلان دروست کرا',
        description: 'پلانی ئەرکەکان بە سەرکەوتوویی دروست کرا'
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا پلانەکە دروست بکرێت',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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
  
  const handleExport = (format: 'text' | 'pdf' = 'text') => {
    if (tasks.length === 0) return;
    
    const taskText = tasks.map((task, index) =>
      `${index + 1}. ${task.title}\n   ${task.description}\n   کاتی کۆتایی: ${task.deadline}\n   گرنگی: ${getPriorityText(task.priority)}\n   دۆخ: ${getStatusText(task.status)}\n`
    ).join('\n');
    
    if (format === 'pdf') {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(16);
      doc.text('پلانی ئەرکەکان', pageWidth / 2, 20, { align: 'center' });
      
      // Add project info
      doc.setFontSize(12);
      doc.text(`ناونیشانی پڕۆژە: ${projectTitle}`, 10, 40);
      doc.text(`کاتی کۆتایی: ${deadline}`, 10, 50);
      
      // Add tasks
      let yPosition = 70;
      doc.setFontSize(10);
      
      tasks.forEach((task, index) => {
        // Add task info
        const taskInfo = [
          `ئەرکی ${index + 1}: ${task.title}`,
          `وەسف: ${task.description}`,
          `کاتی کۆتایی: ${task.deadline}`,
          `گرنگی: ${getPriorityText(task.priority)}`,
          `دۆخ: ${getStatusText(task.status)}`
        ];
        
        taskInfo.forEach((line, lineIndex) => {
          doc.text(line, 10, yPosition + (lineIndex * 7));
        });
        
        yPosition += taskInfo.length * 7 + 10;
        
        // Add page break if needed
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      // Save the PDF
      doc.save('پلانی ئەرکەکان.pdf');
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="sorani-text">زانیاری پڕۆژە</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium sorani-text">ناونیشانی پڕۆژە</label>
              <Input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="ناونیشانی پڕۆژەکەت بنووسە..."
                className="input-academic sorani-text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium sorani-text">کاتی کۆتایی</label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input-academic"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium sorani-text">وردەکارییەکان</label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="وردەکارییەکانی پڕۆژەکە بنووسە..."
                className="min-h-[150px] sorani-text"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleGeneratePlan}
                disabled={loading}
                className="flex-1 btn-academic-primary"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    دروستکردنی پلان...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    دروستکردنی پلان
                  </>
                )}
              </Button>
            </div>
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
            <CardTitle className="sorani-text">پلانی ئەرکەکان</CardTitle>
            {tasks.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {completedTasks} لە {tasks.length} ئەرک تەواو بووە ({Math.round(progressPercentage)}%)
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
                        <p className="text-sm text-muted-foreground sorani-text">{task.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                          گرنگی: {getPriorityText(task.priority)}
                        </Badge>
                        <Badge variant="outline">
                          {getStatusText(task.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(task.deadline).toLocaleDateString('ku')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="sorani-text">پلانی ئەرکەکان لێرە دەردەکەوێت</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};