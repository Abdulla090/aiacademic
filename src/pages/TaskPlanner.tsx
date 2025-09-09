import { TaskPlanner as TaskPlannerComponent } from "@/components/TaskPlanner";
import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";

const TaskPlanner = () => {
  const { t } = useTranslation();
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      
      <main className="container mx-auto px-4 py-8">
        <PageHeader />
        <TaskPlannerComponent />
      </main>
    </div>
  );
};

export default TaskPlanner;