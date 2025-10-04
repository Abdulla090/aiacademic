/**
 * QUICK START GUIDE - Kurdish Export Module
 * 
 * Copy-paste these examples into your code to start using the Kurdish export!
 */

import { kurdishDocxPdfService } from '@/services/kurdishDocxPdfService';
import type { ReportSection } from '@/services/kurdishDocxPdfService';

// ====================================================================
// EXAMPLE 1: Simple Export (Most Common Use Case)
// ====================================================================

async function exportSimpleReport() {
  const sections: ReportSection[] = [
    {
      title: "بەشی یەکەم: پێشەکی",
      content: "ئەم ڕاپۆرتە باس لە گرنگی پەروەردە دەکات لە کوردستاندا."
    },
    {
      title: "بەشی دووەم: شیکاری",
      content: "لێرەدا شیکاری زانستی و ڕێژەکانی پێشکەوتن دەخەینەڕوو."
    },
    {
      title: "بەشی سێیەم: دەرەنجام",
      content: "پێویستە سەرمایەگوزاری زیاتر لە بواری پەروەردە بکرێت."
    }
  ];

  await kurdishDocxPdfService.exportAndDownload({
    title: "ڕاپۆرتی پەروەردە لە کوردستان",
    subtitle: "لێکۆڵینەوەیەکی جوگرافی و کۆمەڵایەتی",
    sections: sections,
    fileName: "report-education-kurdistan",
    format: "pdf", // or "docx"
  });
}

// ====================================================================
// EXAMPLE 2: Integration with Existing ReportGenerator Component
// ====================================================================

// In your ReportGenerator.tsx, update the handleDownloadReport function:

async function handleDownloadReportUpdated(
  format: 'text' | 'pdf' | 'docx' = 'text',
  singleSection: ReportSection | null = null
) {
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
      title: 'دروستکردن...',
      description: 'تکایە چاوەڕێ بە...',
    });

    try {
      if (language === 'en') {
        // Keep existing English export logic
        const pdfService = new EnglishPDFService();
        pdfService.addTitle(titleToUse);
        sectionsToExport.forEach(section => {
          pdfService.addSectionTitle(section.title);
          if (section.content) {
            pdfService.addParagraph(section.content);
          }
        });
        pdfService.save(`${titleToUse}.pdf`);
      } else {
        // NEW: Kurdish export using DOCX → PDF pipeline
        await kurdishDocxPdfService.exportAndDownload({
          title: titleToUse,
          sections: sectionsToExport.map(section => ({
            title: section.title,
            content: section.content || '',
          })),
          fileName: titleToUse.substring(0, 50),
          format: format,
          useAdvancedPipeline: true, // Automatically tries fallback methods
          includeDateFooter: true,
          metadata: {
            author: 'AI Academic Hub',
            subject: 'Kurdish Academic Report',
            keywords: ['Kurdish', 'Report', 'Academic'],
          },
        });
      }

      toast({
        title: 'سەرکەوتوو بوو',
        description: `فایلی ${format.toUpperCase()} دابەزێنرا`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'هەڵە',
        description: 'کێشەیەک ڕوویدا لە دروستکردنی فایلەکە',
        variant: 'destructive',
      });
    }
    return;
  }

  // ... rest of your text export logic
}

// ====================================================================
// EXAMPLE 3: Export with Custom Options
// ====================================================================

async function exportCustomReport() {
  const sections: ReportSection[] = [
    { title: "سەرەتا", content: "ناوەڕۆکی سەرەتا..." },
    { title: "ناوەندی", content: "ناوەڕۆکی ناوەندی..." },
    { title: "کۆتایی", content: "ناوەڕۆکی کۆتایی..." },
  ];

  await kurdishDocxPdfService.exportAndDownload({
    title: "ڕاپۆرتی تایبەت",
    subtitle: "بە ڕێکخستنی تایبەت",
    sections: sections,
    fileName: "custom-report",
    format: "pdf",
    useAdvancedPipeline: true, // Try multiple conversion methods
    includeDateFooter: true,
    metadata: {
      author: "ناوی نووسەر",
      subject: "بابەتی ڕاپۆرت",
      keywords: ["کوردی", "ڕاپۆرت", "ئەکادیمی"],
    },
  });
}

// ====================================================================
// EXAMPLE 4: Export Only DOCX (No PDF Conversion)
// ====================================================================

async function exportDocxOnly() {
  const sections: ReportSection[] = [
    { title: "بەشی یەک", content: "ناوەڕۆک..." },
  ];

  // If PDF conversion is not working, export as DOCX
  // Users can open in Word/LibreOffice and save as PDF
  await kurdishDocxPdfService.exportAndDownload({
    title: "ڕاپۆرتی کوردی",
    sections: sections,
    fileName: "kurdish-report",
    format: "docx", // ← Export as DOCX only
  });
}

// ====================================================================
// EXAMPLE 5: Get Blob for Custom Handling
// ====================================================================

async function exportAsBlob() {
  const sections: ReportSection[] = [
    { title: "بەش", content: "ناوەڕۆک" },
  ];

  // Get blob instead of auto-downloading
  const blob = await kurdishDocxPdfService.exportReport({
    title: "ڕاپۆرت",
    sections: sections,
    format: "pdf",
  });

  // Now you can:
  // 1. Upload to server
  // 2. Send via email
  // 3. Store in database
  // 4. Share via link
  // etc.

  console.log("PDF blob size:", blob.size);
  return blob;
}

// ====================================================================
// EXAMPLE 6: Check Available Conversion Methods
// ====================================================================

import { checkAvailableConverters } from '@/utils/kurdishExportFallbacks';

async function checkConverters() {
  const converters = await checkAvailableConverters();
  
  console.log("Available PDF converters:");
  console.log("- docx-pdf:", converters['docx-pdf'] ? "✅" : "❌");
  console.log("- html-pdf-node:", converters['html-pdf-node'] ? "✅" : "❌");
  console.log("- mammoth+pdfmake:", converters['mammoth+pdfmake'] ? "✅" : "❌");
  console.log("- LibreOffice CLI:", converters['libreoffice'] ? "✅" : "❌");

  // If no converters available, suggest DOCX export
  if (!Object.values(converters).some(v => v)) {
    console.log("💡 No PDF converters available. Use format: 'docx' instead.");
  }
}

// ====================================================================
// EXAMPLE 7: Direct API Usage (Low-Level)
// ====================================================================

import { exportKurdishReportToPDF } from '@/utils/kurdishExport';

async function directExport() {
  const pdfBuffer = await exportKurdishReportToPDF({
    title: "ڕاپۆرتی کوردی",
    content: [
      "ناوەڕۆکی یەکەم",
      "ناوەڕۆکی دووەم",
      "ناوەڕۆکی سێیەم",
    ],
    fileName: "direct-export",
    fontSize: 28, // 14pt
    titleFontSize: 40, // 20pt
  });

  // Save to file (Node.js)
  const fs = require('fs');
  fs.writeFileSync('kurdish-report.pdf', pdfBuffer);
}

// ====================================================================
// USAGE IN YOUR COMPONENT
// ====================================================================

// Add this button to your UI:
/*
<Button
  onClick={() => exportSimpleReport()}
  className="gap-2"
>
  <FileText className="w-4 h-4" />
  دابەزاندنی PDF بە کوردی
</Button>
*/

export {
  exportSimpleReport,
  handleDownloadReportUpdated,
  exportCustomReport,
  exportDocxOnly,
  exportAsBlob,
  checkConverters,
  directExport,
};
