import { AIResearchAssistant } from "@/components/AIResearchAssistant";
import { BackButton } from "@/components/BackButton";
import { useNavigate } from "react-router-dom";

export default function AIResearchAssistantPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-subtle bg-purple-grid">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <BackButton />
        </div>
        <AIResearchAssistant />
      </main>
    </div>
  );
}
