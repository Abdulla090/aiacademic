/**
 * Kurdish Export Integration Example
 * 
 * This file demonstrates how to integrate the new Kurdish DOCX → PDF export
 * into your existing ReportGenerator component.
 * 
 * USAGE:
 * 1. Import the new service in your ReportGenerator.tsx:
 *    import { kurdishDocxPdfService, type ReportSection } from '@/services/kurdishDocxPdfService';
 * 
 * 2. Replace the existing Kurdish PDF export logic in handleDownloadReport function
 * 
 * 3. Enjoy proper Kurdish text rendering with full Unicode support!
 */

// Example integration in ReportGenerator.tsx handleDownloadReport function:

/*
const handleDownloadReport = async (format: 'text' | 'pdf' | 'docx' = 'text', singleSection: ReportSection | null = null) => {
  const sectionsToExport = singleSection ? [singleSection] : sections;
  const titleToUse = singleSection ? singleSection.title : outline?.title || 'Report';

  if (sectionsToExport.length === 0) {
    toast({
      title: 'هەڵە',
      description: 'ڕاپۆرتەکە بەتاڵە',
      variant: 'destructive',
    });
    return;
  }

  if (format === 'pdf' || format === 'docx') {
    toast({
      title: format === 'pdf' ? 'دروستکردنی PDF' : 'دروستکردنی DOCX',
      description: 'تکایە چاوەڕێ بە...',
    });

    try {
      if (language === 'en') {
        // Keep existing English export
        const pdfService = new EnglishPDFService();
        pdfService.addTitle(titleToUse);
        sectionsToExport.forEach(section => {
          pdfService.addSectionTitle(section.title);
          if (section.content) {
            pdfService.addParagraph(section.content);
          }
        });
        pdfService.save(`${titleToUse.substring(0, 50).replace(/[^a-zA-Z0-9\s]/g, '')}.pdf`);
      } else {
        // NEW: Use enhanced Kurdish DOCX → PDF pipeline
        await kurdishDocxPdfService.exportAndDownload({
          title: titleToUse,
          sections: sectionsToExport.map(section => ({
            title: section.title,
            content: section.content || '',
          })),
          fileName: titleToUse.substring(0, 50).replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, ''),
          format: format,
          useAdvancedPipeline: true, // Use fallback converters if primary method fails
          includeDateFooter: true,
          metadata: {
            author: 'AI Academic Hub',
            subject: 'Kurdish Report',
            keywords: ['Kurdish', 'Report', 'Academic'],
          },
        });
      }

      toast({
        title: 'سەرکەوتوو بوو',
        description: format === 'pdf' ? 'فایلی PDF دابەزێنرا' : 'فایلی DOCX دابەزێنرا',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'هەڵە',
        description: 'کێشە لە دروستکردنی فایل',
        variant: 'destructive',
      });
    }
    return;
  }

  // ... rest of text export logic
};
*/

// Alternative: Export as DOCX only (no PDF conversion)
// This is useful if PDF conversion is not working or not available

/*
// Add DOCX export button to your UI:
<Button
  onClick={() => handleDownloadReport('docx')}
  variant="outline"
  className="gap-2"
>
  <FileText className="w-4 h-4" />
  دابەزاندنی DOCX
</Button>
*/

// Server-side API endpoint example (if you want to handle conversion on the server):

/*
// src/api/export-kurdish.ts

import { exportKurdishReportToPDF } from '@/utils/kurdishExport';
import type { KurdishReportOptions } from '@/utils/kurdishExport';

export async function POST(request: Request) {
  try {
    const options: KurdishReportOptions = await request.json();
    
    const pdfBuffer = await exportKurdishReportToPDF(options);
    
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${options.fileName || 'report'}.pdf"`,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Export failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
*/

// Check available converters before exporting:

/*
import { checkAvailableConverters } from '@/utils/kurdishExportFallbacks';

const converters = await checkAvailableConverters();
console.log('Available converters:', converters);

if (!converters['docx-pdf'] && !converters['html-pdf-node']) {
  // Fallback to DOCX export only
  await kurdishDocxPdfService.exportAndDownload({
    ...options,
    format: 'docx', // Export as DOCX instead of PDF
  });
}
*/

export {};
