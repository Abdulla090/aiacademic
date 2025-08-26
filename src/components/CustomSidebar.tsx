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
  Minimize
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

// Define the menu items
const menuItems = [
  {
    title: "home",
    icon: Home,
    url: "/dashboard"
  },
  {
    title: "articleWriter",
    icon: FileText,
    url: "/article-writer"
  },
  {
    title: "grammarChecker",
    icon: BookOpen,
    url: "/grammar-checker"
  },
  {
    title: "mindMapGenerator",
    icon: Brain,
    url: "/mind-map-generator"
  },
  {
    title: "presentationGenerator",
    icon: Presentation,
    url: "/presentation-generator"
  },
  {
    title: "taskPlanner",
    icon: Calendar,
    url: "/task-planner"
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
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 bg-gradient-primary rounded-lg text-primary-foreground">
              <Settings className="h-6 w-6" />
            </div>
            {state === "expanded" && (
              <div>
                <h2 className="text-lg font-semibold">{t('appName')}</h2>
                <p className="text-xs text-muted-foreground">{t('appSubtitle')}</p>
              </div>
            )}
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
            <SidebarGroupLabel>{t('tools')}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/summarizer-paraphraser">
                    <BookOpen />
                    <span>{t('summarizerParaphraser')}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/flashcard-generator">
                    <Brain />
                    <span>{t('flashcardGenerator')}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
               <SidebarMenuButton asChild>
                 <a href="/quiz-generator">
                   <FileText />
                   <span>{t('quizGenerator')}</span>
                 </a>
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton asChild>
                 <a href="/file-converter">
                   <FileUp />
                   <span>گۆڕینی فۆرماتی فایل</span>
                 </a>
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton asChild>
                 <a href="/image-converter">
                   <Image />
                   <span>گۆڕینی فۆرماتی وێنە</span>
                 </a>
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton asChild>
                 <a href="/compressor">
                   <Minimize />
                   <span>پەستانەوە</span>
                 </a>
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton asChild>
                 <a href="/citation-generator">
                   <BookOpen />
                   <span>دروستکەری بەڵگەنامە</span>
                 </a>
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