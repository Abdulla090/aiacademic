import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface RichTextRendererProps {
  content: string;
  isStreaming?: boolean;
  showCopyButton?: boolean;
  className?: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ 
  content, 
  isStreaming = false, 
  showCopyButton = true,
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      // Strip markdown formatting for plain text copy
      const plainText = content
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/#{1,6}\s*(.*?)$/gm, '$1')
        .replace(/^\s*[-*+]\s+/gm, '• ')
        .replace(/^\s*\d+\.\s+/gm, '• ');
      
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      toast({
        title: 'کۆپی کرا',
        description: 'دەقەکە کۆپی کرا بۆ کلیپبۆرد'
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا دەقەکە کۆپی بکرێت',
        variant: 'destructive'
      });
    }
  };

  const renderFormattedText = (text: string): React.ReactNode => {
    if (!text) return null;

    // Split text into lines for processing
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentListItems: string[] = [];
    let currentListType: 'ul' | 'ol' | null = null;
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = '';

    const flushList = () => {
      if (currentListItems.length > 0) {
        elements.push(
          currentListType === 'ol' ? (
            <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-1 my-4 pr-6">
              {currentListItems.map((item, index) => (
                <li key={index} className="text-base leading-relaxed">
                  {formatInlineText(item)}
                </li>
              ))}
            </ol>
          ) : (
            <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-4 pr-6">
              {currentListItems.map((item, index) => (
                <li key={index} className="text-base leading-relaxed">
                  {formatInlineText(item)}
                </li>
              ))}
            </ul>
          )
        );
        currentListItems = [];
        currentListType = null;
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <pre key={`code-${elements.length}`} className="bg-muted p-4 rounded-lg overflow-x-auto my-4 border">
            <code className={`text-sm ${codeBlockLanguage ? `language-${codeBlockLanguage}` : ''}`}>
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        );
        codeBlockContent = [];
        codeBlockLanguage = '';
      }
    };

    lines.forEach((line, lineIndex) => {
      // Handle code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
          codeBlockLanguage = line.trim().substring(3);
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Handle headers
      if (line.match(/^#{1,6}\s+/)) {
        flushList();
        const level = line.match(/^#{1,6}/)?.[0].length || 1;
        const text = line.replace(/^#{1,6}\s+/, '');
        const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
        
        elements.push(
          <HeaderTag 
            key={`header-${elements.length}`} 
            className={`font-bold my-4 ${
              level === 1 ? 'text-2xl' : 
              level === 2 ? 'text-xl' : 
              level === 3 ? 'text-lg' : 
              'text-base'
            }`}
          >
            {formatInlineText(text)}
          </HeaderTag>
        );
        return;
      }

      // Handle unordered lists
      const ulMatch = line.match(/^\s*[-*+]\s+(.+)/);
      if (ulMatch) {
        if (currentListType !== 'ul') {
          flushList();
          currentListType = 'ul';
        }
        currentListItems.push(ulMatch[1]);
        return;
      }

      // Handle ordered lists
      const olMatch = line.match(/^\s*\d+\.\s+(.+)/);
      if (olMatch) {
        if (currentListType !== 'ol') {
          flushList();
          currentListType = 'ol';
        }
        currentListItems.push(olMatch[1]);
        return;
      }

      // Handle blockquotes
      if (line.trim().startsWith('>')) {
        flushList();
        const quoteText = line.replace(/^\s*>\s*/, '');
        elements.push(
          <blockquote 
            key={`quote-${elements.length}`} 
            className="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-muted/30 rounded-r-lg"
          >
            <p className="text-base leading-relaxed italic">
              {formatInlineText(quoteText)}
            </p>
          </blockquote>
        );
        return;
      }

      // Handle horizontal rules
      if (line.trim().match(/^[-*_]{3,}$/)) {
        flushList();
        elements.push(
          <hr key={`hr-${elements.length}`} className="my-6 border-border" />
        );
        return;
      }

      // Handle empty lines
      if (line.trim() === '') {
        flushList();
        if (elements.length > 0) {
          elements.push(<br key={`br-${elements.length}`} />);
        }
        return;
      }

      // Handle regular paragraphs
      flushList();
      elements.push(
        <p key={`p-${elements.length}`} className="text-base leading-relaxed my-2">
          {formatInlineText(line)}
        </p>
      );
    });

    // Flush any remaining list or code block
    flushList();
    flushCodeBlock();

    return elements;
  };

  const formatInlineText = (text: string): React.ReactNode => {
    if (!text) return null;

    const result: React.ReactNode[] = [];
    let currentIndex = 0;

    // Regex patterns for different formatting
    const patterns = [
      { name: 'strong', regex: /\*\*([^*]+)\*\*/g, component: (match: string, content: string, key: number) => <strong key={key}>{content}</strong> },
      { name: 'em', regex: /\*([^*]+)\*/g, component: (match: string, content: string, key: number) => <em key={key}>{content}</em> },
      { name: 'code', regex: /`([^`]+)`/g, component: (match: string, content: string, key: number) => <code key={key} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{content}</code> },
      { name: 'del', regex: /~~([^~]+)~~/g, component: (match: string, content: string, key: number) => <del key={key}>{content}</del> },
      { name: 'u', regex: /__([^_]+)__/g, component: (match: string, content: string, key: number) => <u key={key}>{content}</u> },
      { name: 'link', regex: /\[([^\]]+)\]\(([^)]+)\)/g, component: (match: string, linkText: string, url: string, key: number) => (
        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">
          {linkText}
        </a>
      )},
    ] as const;

    // Type guard to differentiate link pattern
    function isLinkPattern(pattern: typeof patterns[number]): pattern is typeof patterns[5] {
        return pattern.name === 'link';
    }

    // Find all matches
    const allMatches: Array<{start: number, end: number, replacement: React.ReactNode}> = [];

    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      
      while ((match = regex.exec(text)) !== null) {
        if (isLinkPattern(pattern)) {
          // Link pattern - has 2 capture groups
          if (match[1] && match[2]) {
            allMatches.push({
              start: match.index,
              end: match.index + match[0].length,
              replacement: pattern.component(match[0], match[1], match[2], allMatches.length)
            });
          }
        } else {
          // Other patterns - have 1 capture group
          if (match[1]) {
            allMatches.push({
              start: match.index,
              end: match.index + match[0].length,
              replacement: pattern.component(match[0], match[1], allMatches.length)
            });
          }
        }
      }
    });

    // Sort matches by start position
    allMatches.sort((a, b) => a.start - b.start);

    // Remove overlapping matches (keep the first one)
    const validMatches = [];
    let lastEnd = 0;
    for (const match of allMatches) {
      if (match.start >= lastEnd) {
        validMatches.push(match);
        lastEnd = match.end;
      }
    }

    // Build the result
    currentIndex = 0;
    validMatches.forEach((match, index) => {
      // Add text before the match
      if (match.start > currentIndex) {
        const beforeText = text.substring(currentIndex, match.start);
        if (beforeText) {
          result.push(beforeText);
        }
      }
      
      // Add the formatted match
      result.push(match.replacement);
      currentIndex = match.end;
    });

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.substring(currentIndex);
      if (remainingText) {
        result.push(remainingText);
      }
    }

    return result.length > 0 ? result : text;
  };

  return (
    <div className={`rich-text-content relative ${className}`}>
      {showCopyButton && content && (
        <div className="flex justify-end mb-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="gap-2"
            disabled={!content}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                کۆپی کرا
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                کۆپی
              </>
            )}
          </Button>
        </div>
      )}
      
      <div className="formatted-content">
        {renderFormattedText(content)}
        
        {/* Blinking cursor for streaming */}
        {isStreaming && (
          <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-pulse" />
        )}
      </div>
    </div>
  );
};
