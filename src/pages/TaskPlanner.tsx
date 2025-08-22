import { AcademicHeader } from "@/components/AcademicHeader";
import { TaskPlanner as TaskPlannerComponent } from "@/components/TaskPlanner";
import { useState } from "react";

const TaskPlanner = () => {
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AcademicHeader />
      
      <main className="container mx-auto px-4 py-8">
        <TaskPlannerComponent />
      </main>
    </div>
  );
};

export default TaskPlanner;