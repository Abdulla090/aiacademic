import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Type, 
  List, 
  Bold, 
  Italic, 
  Code,
  Quote,
  Link,
  Hash,
  Minus,
  Info
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FormattingControlsProps {
  showFormatting: boolean;
  onToggleFormatting: (show: boolean) => void;
  className?: string;
}

export const FormattingControls: React.FC<FormattingControlsProps> = ({
  showFormatting,
  onToggleFormatting,
  className = ''
}) => {
  const [showGuide, setShowGuide] = useState(false);

  const formatExamples = [
    { icon: Bold, label: 'Bold', syntax: '**text**', example: '**important concept**' },
    { icon: Italic, label: 'Italic', syntax: '*text*', example: '*emphasis*' },
    { icon: Hash, label: 'Headers', syntax: '## Header', example: '## Introduction' },
    { icon: List, label: 'Lists', syntax: '- item', example: '- Key point' },
    { icon: Code, label: 'Code', syntax: '`code`', example: '`terminology`' },
    { icon: Quote, label: 'Quote', syntax: '> quote', example: '> Important definition' },
    { icon: Link, label: 'Link', syntax: '[text](url)', example: '[Reference](url)' },
    { icon: Minus, label: 'Line', syntax: '---', example: 'Horizontal line' },
  ];

  return (
    <div className={`formatting-controls ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Button
          size="sm"
          variant={showFormatting ? "default" : "outline"}
          onClick={() => onToggleFormatting(!showFormatting)}
          className="gap-2"
        >
          {showFormatting ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {showFormatting ? 'تیپۆگرافی کرا' : 'تیپۆگرافی نەکرا'}
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowGuide(!showGuide)}
                className="gap-2"
              >
                <Info className="h-4 w-4" />
                ڕێنماییەکان
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>کلیک بکە بۆ بینینی ڕێنماییەکانی تیپۆگرافی</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Badge variant={showFormatting ? "default" : "secondary"} className="gap-1">
          <Type className="h-3 w-3" />
          {showFormatting ? 'فۆرمات کراو' : 'دەقی سادە'}
        </Badge>
      </div>

      {showGuide && (
        <div className="bg-secondary/30 p-4 rounded-lg mb-4 border">
          <h4 className="font-semibold mb-3 sorani-text flex items-center gap-2">
            <Type className="h-4 w-4" />
            ڕێنماییەکانی تیپۆگرافی
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {formatExamples.map(({ icon: Icon, label, syntax, example }, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-background rounded border">
                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-muted-foreground">{label}</div>
                  <div className="font-mono text-xs text-primary truncate">{syntax}</div>
                </div>
                <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  {example.length > 15 ? example.substring(0, 15) + '...' : example}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 p-3 bg-primary/5 rounded border-l-4 border-primary">
            <p className="text-sm text-muted-foreground sorani-text">
              <strong>تێبینی:</strong> AI بەکارهێنانی ئەم فۆرماتانە فێردەکرێت بۆ دروستکردنی دەقی جوانتر و خوێندنەوەی ئاسانتر.
            </p>
          </div>
        </div>
      )}

      {showFormatting && (
        <div className="text-center py-2">
          <Badge variant="outline" className="gap-2">
            <Eye className="h-3 w-3" />
            <span className="sorani-text">تیپۆگرافی چالاکە - دەق بە فۆرمات دەردەکەوێت</span>
          </Badge>
        </div>
      )}
    </div>
  );
};
