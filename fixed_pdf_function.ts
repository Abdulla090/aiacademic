  const handleDownload = async (format: 'text' | 'pdf' = 'text') => {
    try {
      if (format === 'pdf') {
        const doc = new jsPDF();
        
        // Use only standard fonts to avoid encoding issues
        doc.setFont('helvetica', 'normal');
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;
        
        // Simple text wrapping function that doesn't rely on jsPDF's problematic splitTextToSize
        const wrapText = (text: string, maxWidth: number) => {
          const words = text.split(' ');
          const lines = [];
          let currentLine = '';
          
          // Estimate character width
          const fontSize = doc.getFontSize() || 12;
          const charWidth = fontSize * 0.6;
          const maxChars = Math.floor(maxWidth / charWidth);
          
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (testLine.length <= maxChars) {
              currentLine = testLine;
            } else {
              if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
              } else {
                // Handle very long words by splitting them
                if (word.length > maxChars) {
                  let remainingWord = word;
                  while (remainingWord.length > maxChars) {
                    lines.push(remainingWord.substring(0, maxChars));
                    remainingWord = remainingWord.substring(maxChars);
                  }
                  if (remainingWord) {
                    currentLine = remainingWord;
                  }
                } else {
                  currentLine = word;
                }
              }
            }
          }
          if (currentLine) {
            lines.push(currentLine);
          }
          return lines;
        };
        
        // Add title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        const titleLines = wrapText(request.topic || 'Article', pageWidth - 20);
        titleLines.forEach(line => {
          doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 12;
        });
        yPosition += 10;
        
        // Reset font
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        
        // Process content line by line
        const lines = (article || '').split('\n');
        
        for (const line of lines) {
          // Check for new page
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
          }
          
          if (line.trim() === '') {
            yPosition += 7;
            continue;
          }
          
          // Handle headers
          const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
          if (headerMatch) {
            const level = headerMatch[1].length;
            const text = headerMatch[2];
            const headerSize = 18 - (level * 2);
            
            doc.setFontSize(headerSize);
            doc.setFont('helvetica', 'bold');
            
            const headerLines = wrapText(text, pageWidth - 20);
            headerLines.forEach(headerLine => {
              if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
              }
              doc.text(headerLine, 20, yPosition);
              yPosition += headerSize * 0.8;
            });
            yPosition += 5;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            continue;
          }
          
          // Handle regular text (remove markdown formatting)
          let cleanLine = line;
          cleanLine = cleanLine.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
          cleanLine = cleanLine.replace(/\*(.*?)\*/g, '$1'); // Italic
          cleanLine = cleanLine.replace(/`(.*?)`/g, '$1'); // Code
          cleanLine = cleanLine.replace(/^\s*[-*+]\s+/, '• '); // List bullets
          cleanLine = cleanLine.replace(/^\s*\d+\.\s+/, '• '); // Numbered lists
          cleanLine = cleanLine.replace(/^\s*>\s+/, '    '); // Blockquotes
          
          const textLines = wrapText(cleanLine, pageWidth - 20);
          textLines.forEach(textLine => {
            if (yPosition > pageHeight - 30) {
              doc.addPage();
              yPosition = 20;
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(12);
            }
            doc.text(textLine, 20, yPosition);
            yPosition += 7;
          });
          yPosition += 3;
        }

        doc.save(`${(request.topic || 'article').substring(0, 50)}.pdf`);
        toast({
          title: 'دابەزاندن',
          description: 'PDF دابەزێنرا'
        });
        return;
      }
      
      // Text download
      const blob = new Blob([article], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(request.topic || 'article').substring(0, 50)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'دابەزاندن',
        description: 'بابەتەکە دابەزێنرا'
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا فایلەکە دابەزێنرێت',
        variant: 'destructive'
      });
    }
  };
