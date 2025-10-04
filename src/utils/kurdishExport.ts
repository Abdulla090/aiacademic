/**
 * Kurdish Report Export Module
 * Exports Kurdish (UTF-8, RTL) reports as PDF using DOCX intermediate format
 * Supports full Unicode, diacritics, and proper RTL alignment
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  convertInchesToTwip,
  IPropertiesOptions,
} from "docx";
import { v4 as uuidv4 } from "uuid";

// Font configuration for Kurdish text
const KURDISH_FONT = "Noto Naskh Arabic";
const FALLBACK_FONTS = ["Arial", "Times New Roman"];

export interface KurdishReportOptions {
  title: string;
  subtitle?: string;
  content: string | string[]; // Plain text lines or array of lines
  fileName?: string;
  fontSize?: number; // Default 28 (14pt)
  titleFontSize?: number; // Default 40 (20pt)
  includeDateFooter?: boolean;
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
  };
}

export interface KurdishParagraphOptions {
  text: string;
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  alignment?: typeof AlignmentType[keyof typeof AlignmentType];
  isHeading?: boolean;
  headingLevel?: typeof HeadingLevel[keyof typeof HeadingLevel];
}

/**
 * Creates a DOCX document with Kurdish text support
 */
export async function createKurdishDocx(
  options: KurdishReportOptions
): Promise<Buffer> {
  const {
    title,
    subtitle,
    content,
    fontSize = 28,
    titleFontSize = 40,
    includeDateFooter = true,
    metadata = {},
  } = options;

  // Convert content to array if it's a string
  const contentLines = Array.isArray(content)
    ? content
    : content.split("\n").filter((line) => line.trim() !== "");

  // Create document children
  const children: Paragraph[] = [];

  // Add title
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: title,
          font: KURDISH_FONT,
          bold: true,
          size: titleFontSize,
        }),
      ],
    })
  );

  // Add subtitle if provided
  if (subtitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: subtitle,
            font: KURDISH_FONT,
            bold: false,
            size: fontSize + 4,
            italics: true,
          }),
        ],
      })
    );
  }

  // Add content paragraphs
  contentLines.forEach((line) => {
    if (line.trim() === "") {
      // Add empty paragraph for spacing
      children.push(new Paragraph({ spacing: { after: 100 } }));
    } else {
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 150 },
          children: [
            new TextRun({
              text: line,
              font: KURDISH_FONT,
              size: fontSize,
            }),
          ],
        })
      );
    }
  });

  // Add date footer if requested
  if (includeDateFooter) {
    const currentDate = new Date().toLocaleDateString("ku-IQ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { before: 400 },
        children: [
          new TextRun({
            text: `بەروار: ${currentDate}`,
            font: KURDISH_FONT,
            size: fontSize - 4,
            italics: true,
          }),
        ],
      })
    );
  }

  // Create document
  const doc = new Document({
    creator: metadata.author || "AI Academic",
    title: title,
    description: metadata.subject || "Kurdish Report",
    keywords: metadata.keywords?.join(", ") || "Kurdish, Report",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: KURDISH_FONT,
            rightToLeft: true,
          },
        },
      },
    },
  });

  // Generate DOCX buffer
  return await Packer.toBuffer(doc);
}

/**
 * Main export function: Creates Kurdish PDF using docx-pdf
 */
export async function exportKurdishReportToPDF(
  options: KurdishReportOptions
): Promise<Buffer> {
  try {
    // Create DOCX buffer
    const docxBuffer = await createKurdishDocx(options);

    // Save to temporary file
    const tempDir = typeof window === "undefined" ? "/tmp" : ".";
    const tempId = uuidv4();
    const tempDocxPath = `${tempDir}/kurdish-report-${tempId}.docx`;
    const tempPdfPath = `${tempDir}/kurdish-report-${tempId}.pdf`;

    // Write DOCX to file (Node.js only)
    if (typeof window === "undefined") {
      const fs = await import("fs");
      fs.writeFileSync(tempDocxPath, docxBuffer);

      try {
        // Convert DOCX to PDF using docx-pdf
        const docxPdf = require("docx-pdf");
        
        const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
          docxPdf(tempDocxPath, tempPdfPath, (err: Error | null) => {
            if (err) {
              reject(err);
              return;
            }

            try {
              const pdfData = fs.readFileSync(tempPdfPath);
              resolve(pdfData);
            } catch (readErr) {
              reject(readErr);
            }
          });
        });

        // Clean up temp files
        try {
          fs.unlinkSync(tempDocxPath);
          fs.unlinkSync(tempPdfPath);
        } catch (cleanupErr) {
          console.warn("Failed to clean up temp files:", cleanupErr);
        }

        return pdfBuffer;
      } catch (conversionErr) {
        // Clean up temp DOCX on error
        try {
          fs.unlinkSync(tempDocxPath);
        } catch {}
        throw conversionErr;
      }
    } else {
      // Browser environment: return DOCX buffer
      // (PDF conversion requires server-side processing)
      console.warn(
        "PDF conversion not available in browser. Returning DOCX buffer."
      );
      return docxBuffer;
    }
  } catch (error) {
    console.error("Error exporting Kurdish report:", error);
    throw new Error(
      `Failed to export Kurdish report: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Alternative: Export as DOCX only (no PDF conversion)
 * Use this when you want to let users download DOCX directly
 */
export async function exportKurdishReportToDocx(
  options: KurdishReportOptions
): Promise<Buffer> {
  return await createKurdishDocx(options);
}

/**
 * Helper: Download DOCX/PDF in browser
 */
export function downloadKurdishReport(
  buffer: Buffer | Uint8Array,
  fileName: string,
  fileType: "docx" | "pdf" = "pdf"
) {
  // Convert buffer to array buffer for blob
  const arrayBuffer = buffer instanceof Buffer 
    ? buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    : buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    
  const blob = new Blob([arrayBuffer], {
    type:
      fileType === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.${fileType}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create custom Kurdish paragraph with advanced formatting
 */
export function createKurdishParagraph(
  options: KurdishParagraphOptions
): Paragraph {
  const {
    text,
    bold = false,
    italic = false,
    fontSize = 28,
    alignment = AlignmentType.RIGHT,
    isHeading = false,
    headingLevel = HeadingLevel.HEADING_1,
  } = options;

  return new Paragraph({
    alignment,
    bidirectional: true,
    spacing: { after: 150 },
    heading: isHeading ? headingLevel : undefined,
    children: [
      new TextRun({
        text,
        font: KURDISH_FONT,
        bold,
        italics: italic,
        size: fontSize,
      }),
    ],
  });
}
