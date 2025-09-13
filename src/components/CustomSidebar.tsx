import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider,
  useSidebar
} from "@/components/ui/sidebar";
import {
  Settings,
  User,
  Home,
  FileText,
  BookOpen,
  Brain,
  Presentation,
  Calendar,
  Moon,
  Sun,
  Languages,
  HelpCircle,
  Info,
  LogOut,
  FileUp,
  Image,
  Minimize,
  PenTool,
  CheckSquare,
  BrainCircuit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useState, useEffect } from "react";

// Define the menu items - organized by categories
const menuItems = [
  {
    title: "home",
    icon: Home,
    url: "/dashboard"
  },
  {
    title: "writing",
    icon: PenTool,
    url: "/dashboard?category=writing",
    description: "Article writing, reports, supervision"
  },
  {
    title: "editing",
    icon: CheckSquare,
    url: "/dashboard?category=editing", 
    description: "Grammar check, summarizer, paraphraser"
  },
  {
    title: "study",
    icon: BookOpen,
    url: "/dashboard?category=study",
    description: "Flashcards, quizzes, analytics"
  },
  {
    title: "tools",
    icon: FileUp,
    url: "/dashboard?category=tools",
    description: "Converters, compressors, utilities"
  },
  {
    title: "planning",
    icon: Brain,
    url: "/dashboard?category=planning",
    description: "Mind maps, task planner"
  },
  {
    title: "presentation",
    icon: Presentation,
    url: "/dashboard?category=presentation",
    description: "Presentation generator"
  }
];

export function CustomSidebar() {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(true);
  const { state } = useSidebar();

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Set initial theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    // Default to dark theme if no saved preference
    const initialTheme = savedTheme ? savedTheme === 'dark' : true;
    
    setIsDark(initialTheme);
    if (initialTheme) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center justify-between p-4">
            {state === "expanded" && (
              <div>
                <h2 className="text-lg font-semibold">{t('appName')}</h2>
                <p className="text-xs text-muted-foreground">{t('appSubtitle')}</p>
              </div>
            )}
            <SidebarTrigger className="h-8 w-8" />
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t('navigation')}</SidebarGroupLabel>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{t(item.title)}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel>{t('quickActions')}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/article-writer">
                    <PenTool />
                    <span>{t('newArticle')}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/grammar-checker">
                    <CheckSquare />
                    <span>{t('checkGrammar')}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/mind-map-generator">
                    <Brain />
                    <span>{t('createMindMap')}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/task-planner">
                    <Calendar />
                    <span>{t('planTasks')}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel>{t('recentFiles')}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <FileText />
                  <span className="text-muted-foreground">{t('noRecentFiles')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupLabel>{t('settings')}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      <Settings />
                      <span>{t('settings')}</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background">
                    <DropdownMenuItem onClick={toggleTheme}>
                      {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                      <span>{t(isDark ? 'lightMode' : 'darkMode')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Languages className="mr-2 h-4 w-4" />
                      <LanguageSwitcher />
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/help">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>{t('help')}</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/about">
                        <Info className="mr-2 h-4 w-4" />
                        <span>{t('about')}</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          
          {state === "expanded" && (
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sidebar-accent rounded-full">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">User Name</span>
                  <span className="text-xs text-muted-foreground">user@example.com</span>
                </div>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
  );
}