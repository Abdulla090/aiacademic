/**
 * Kurdish Export Module - Main Index
 * 
 * Import everything you need from this single file
 */

// Core export functions
export {
  exportKurdishReportToPDF,
  exportKurdishReportToDocx,
  createKurdishDocx,
  downloadKurdishReport,
  createKurdishParagraph,
  type KurdishReportOptions,
  type KurdishParagraphOptions,
} from './utils/kurdishExport';

// Fallback converters
export {
  exportKurdishReportViaMammoth,
  exportKurdishReportViaLibreOffice,
  exportKurdishReportViaHtmlPdf,
  exportKurdishReportWithFallbacks,
  checkAvailableConverters,
} from './utils/kurdishExportFallbacks';

// High-level service (recommended)
export {
  KurdishDocxPdfService,
  kurdishDocxPdfService,
  type ReportSection,
  type ReportExportOptions,
} from './services/kurdishDocxPdfService';

/**
 * Quick Usage:
 * 
 * import { kurdishDocxPdfService } from './kurdish-export';
 * 
 * await kurdishDocxPdfService.exportAndDownload({
 *   title: "ڕاپۆرت",
 *   sections: [{title: "بەش", content: "ناوەڕۆک"}],
 *   format: "pdf"
 * });
 */
