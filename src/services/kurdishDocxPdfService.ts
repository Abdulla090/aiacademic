/**
 * Enhanced Kurdish PDF Service using DOCX → PDF pipeline
 * Provides better Unicode support and RTL handling than jsPDF
 */

import {
  exportKurdishReportToPDF,
  exportKurdishReportToDocx,
  downloadKurdishReport,
  type KurdishReportOptions,
} from "@/utils/kurdishExport";
import {
  exportKurdishReportWithFallbacks,
  checkAvailableConverters,
} from "@/utils/kurdishExportFallbacks";

export interface ReportSection {
  title: string;
  content: string;
}

export interface ReportExportOptions {
  title: string;
  subtitle?: string;
  sections: ReportSection[];
  fileName?: string;
  format?: "pdf" | "docx";
  useAdvancedPipeline?: boolean; // Use DOCX → PDF pipeline instead of jsPDF
  includeDateFooter?: boolean;
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
  };
}

export class KurdishDocxPdfService {
  private availableConverters: { [key: string]: boolean } = {};

  constructor() {
    this.checkConverters();
  }

  /**
   * Check which PDF conversion methods are available
   */
  private async checkConverters() {
    try {
      this.availableConverters = await checkAvailableConverters();
      console.log("Available Kurdish PDF converters:", this.availableConverters);
    } catch (error) {
      console.warn("Could not check available converters:", error);
    }
  }

  /**
   * Export report using the new DOCX → PDF pipeline
   * This provides better Kurdish text rendering than jsPDF
   */
  async exportReport(options: ReportExportOptions): Promise<Blob> {
    const {
      title,
      subtitle,
      sections,
      fileName = "kurdish-report",
      format = "pdf",
      useAdvancedPipeline = true,
      includeDateFooter = true,
      metadata,
    } = options;

    // Convert sections to content string
    const content = sections
      .map((section) => {
        return `${section.title}\n\n${section.content}\n\n`;
      })
      .join("\n");

    const kurdishOptions: KurdishReportOptions = {
      title,
      subtitle,
      content,
      fileName,
      includeDateFooter,
      metadata,
    };

    try {
      let buffer: Buffer;

      if (format === "docx") {
        // Export as DOCX only
        buffer = await exportKurdishReportToDocx(kurdishOptions);
      } else if (useAdvancedPipeline) {
        // Try advanced pipeline with fallbacks
        const result = await exportKurdishReportWithFallbacks(kurdishOptions);
        buffer = result.buffer;
        console.log(`Kurdish PDF exported using: ${result.method}`);
      } else {
        // Use primary docx-pdf method
        buffer = await exportKurdishReportToPDF(kurdishOptions);
      }

      // Convert buffer to Blob
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      const uint8Array = new Uint8Array(arrayBuffer as ArrayBuffer);
      const blob = new Blob([uint8Array], {
        type:
          format === "docx"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "application/pdf",
      });

      return blob;
    } catch (error) {
      console.error("Kurdish export failed:", error);
      throw new Error(
        `Failed to export Kurdish report: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Export and download report directly in browser
   */
  async exportAndDownload(options: ReportExportOptions): Promise<void> {
    const blob = await this.exportReport(options);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${options.fileName || "kurdish-report"}.${
      options.format || "pdf"
    }`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Convert markdown to plain text (removes formatting)
   */
  private convertMarkdownToPlainText(markdown: string): string {
    let text = markdown;

    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, "");

    // Remove inline code
    text = text.replace(/`([^`]+)`/g, "$1");

    // Remove headers
    text = text.replace(/^#{1,6}\s+(.+)$/gm, "$1");

    // Remove bold and italic
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, "$1");
    text = text.replace(/\*\*(.+?)\*\*/g, "$1");
    text = text.replace(/\*(.+?)\*/g, "$1");

    // Remove blockquotes
    text = text.replace(/^>\s+(.+)$/gm, "$1");

    // Remove list markers
    text = text.replace(/^\s*[-*+]\s+/gm, "");
    text = text.replace(/^\s*\d+\.\s+/gm, "");

    // Remove horizontal rules
    text = text.replace(/^[-*_]{3,}$/gm, "");

    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, "\n\n");

    return text.trim();
  }

  /**
   * Export report with markdown content
   * (converts markdown to plain text for DOCX)
   */
  async exportReportWithMarkdown(
    options: Omit<ReportExportOptions, "sections"> & {
      sections: Array<{ title: string; content: string; isMarkdown?: boolean }>;
    }
  ): Promise<Blob> {
    // Convert markdown sections to plain text
    const plainSections = options.sections.map((section) => ({
      title: section.title,
      content: section.isMarkdown
        ? this.convertMarkdownToPlainText(section.content)
        : section.content,
    }));

    return this.exportReport({
      ...options,
      sections: plainSections,
    });
  }

  /**
   * Check if the advanced DOCX → PDF pipeline is available
   */
  isAdvancedPipelineAvailable(): boolean {
    return Object.values(this.availableConverters).some((available) => available);
  }

  /**
   * Get list of available conversion methods
   */
  getAvailableConverters(): { [key: string]: boolean } {
    return { ...this.availableConverters };
  }
}

// Export singleton instance
export const kurdishDocxPdfService = new KurdishDocxPdfService();

// Export types
export type { KurdishReportOptions };
