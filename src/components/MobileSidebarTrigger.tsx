import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export const MobileSidebarTrigger = () => {
  const isMobile = useIsMobile();
  
  // Only render the trigger on mobile devices
  if (!isMobile) {
    return null;
  }
  
  return <SidebarTrigger />;
};