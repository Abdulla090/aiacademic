/**
 * Kurdish Export Fallback Converters
 * Alternative methods for DOCX → PDF conversion
 */

import { KurdishReportOptions, createKurdishDocx } from "./kurdishExport";
import { v4 as uuidv4 } from "uuid";

/**
 * Fallback Method 1: Using mammoth + pdfmake
 * Converts DOCX → HTML → PDF
 */
export async function exportKurdishReportViaMammoth(
  options: KurdishReportOptions
): Promise<Buffer> {
  try {
    // Create DOCX buffer
    const docxBuffer = await createKurdishDocx(options);

    // Convert DOCX to HTML using mammoth
    const mammoth = require("mammoth");
    const result = await mammoth.convertToHtml({ buffer: docxBuffer });
    const html = result.value;

    // Create PDF from HTML using pdfmake
    const pdfMake = require("pdfmake/build/pdfmake");
    const pdfFonts = require("pdfmake/build/vfs_fonts");
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    // Parse HTML to pdfmake document definition
    const htmlToPdfmake = require("html-to-pdfmake");
    const content = htmlToPdfmake(html);

    const docDefinition = {
      content: content,
      defaultStyle: {
        font: "NotoNaskhArabic",
        fontSize: 14,
        alignment: "right",
      },
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
    };

    // Generate PDF
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    return new Promise((resolve, reject) => {
      pdfDocGenerator.getBuffer((buffer: Buffer) => {
        resolve(buffer);
      });
    });
  } catch (error) {
    console.error("Mammoth conversion failed:", error);
    throw new Error(
      `Mammoth fallback conversion failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Fallback Method 2: Using LibreOffice CLI
 * Requires LibreOffice to be installed on the server
 */
export async function exportKurdishReportViaLibreOffice(
  options: KurdishReportOptions
): Promise<Buffer> {
  if (typeof window !== "undefined") {
    throw new Error("LibreOffice conversion requires server-side environment");
  }

  try {
    const fs = await import("fs");
    const { execSync } = await import("child_process");
    const path = await import("path");

    // Create DOCX buffer
    const docxBuffer = await createKurdishDocx(options);

    // Setup temp directories
    const tempDir = "/tmp";
    const tempId = uuidv4();
    const inputPath = path.join(tempDir, `kurdish-report-${tempId}.docx`);
    const outputDir = tempDir;

    // Write DOCX to temp file
    fs.writeFileSync(inputPath, docxBuffer);

    try {
      // Convert using LibreOffice
      // Check for LibreOffice installation
      let libreOfficePath = "libreoffice";
      
      // Try common Windows paths
      const windowsPaths = [
        "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
        "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
      ];

      if (process.platform === "win32") {
        const foundPath = windowsPaths.find((p) => fs.existsSync(p));
        if (foundPath) {
          libreOfficePath = `"${foundPath}"`;
        }
      }

      // Execute conversion
      execSync(
        `${libreOfficePath} --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`,
        { timeout: 30000 }
      );

      // Read generated PDF
      const outputPath = inputPath.replace(/\.docx$/, ".pdf");
      const pdfBuffer = fs.readFileSync(outputPath);

      // Clean up temp files
      try {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      } catch (cleanupErr) {
        console.warn("Failed to clean up LibreOffice temp files:", cleanupErr);
      }

      return pdfBuffer;
    } catch (execErr) {
      // Clean up input file on error
      try {
        fs.unlinkSync(inputPath);
      } catch {}
      throw execErr;
    }
  } catch (error) {
    console.error("LibreOffice conversion failed:", error);
    throw new Error(
      `LibreOffice fallback conversion failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Fallback Method 3: Using html-pdf-node
 * Converts DOCX → HTML → PDF using Puppeteer
 */
export async function exportKurdishReportViaHtmlPdf(
  options: KurdishReportOptions
): Promise<Buffer> {
  try {
    // Create DOCX buffer
    const docxBuffer = await createKurdishDocx(options);

    // Convert DOCX to HTML using mammoth
    const mammoth = require("mammoth");
    const result = await mammoth.convertToHtml({ buffer: docxBuffer });
    let html = result.value;

    // Wrap HTML with Kurdish font styles
    html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ku">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic&display=swap');
          body {
            font-family: 'Noto Naskh Arabic', Arial, sans-serif;
            direction: rtl;
            text-align: right;
            font-size: 14pt;
            line-height: 1.6;
            margin: 40px;
          }
          h1, h2, h3, h4, h5, h6 {
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          p {
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    // Generate PDF using html-pdf-node
    const htmlPdf = require("html-pdf-node");
    
    const pdfOptions = {
      format: "A4",
      margin: {
        top: "40px",
        right: "40px",
        bottom: "40px",
        left: "40px",
      },
    };

    const file = { content: html };
    const pdfBuffer = await htmlPdf.generatePdf(file, pdfOptions);

    return pdfBuffer;
  } catch (error) {
    console.error("html-pdf-node conversion failed:", error);
    throw new Error(
      `HTML-PDF fallback conversion failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Smart converter: Tries multiple methods in order
 */
export async function exportKurdishReportWithFallbacks(
  options: KurdishReportOptions
): Promise<{ buffer: Buffer; method: string }> {
  const methods = [
    {
      name: "docx-pdf",
      fn: async () => {
        const { exportKurdishReportToPDF } = await import("./kurdishExport");
        return await exportKurdishReportToPDF(options);
      },
    },
    {
      name: "html-pdf-node",
      fn: () => exportKurdishReportViaHtmlPdf(options),
    },
    {
      name: "mammoth+pdfmake",
      fn: () => exportKurdishReportViaMammoth(options),
    },
    {
      name: "libreoffice",
      fn: () => exportKurdishReportViaLibreOffice(options),
    },
  ];

  let lastError: Error | null = null;

  for (const method of methods) {
    try {
      console.log(`Trying Kurdish PDF export method: ${method.name}`);
      const buffer = await method.fn();
      console.log(`Successfully exported using: ${method.name}`);
      return { buffer, method: method.name };
    } catch (error) {
      console.warn(`Method ${method.name} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  // All methods failed - return DOCX as last resort
  console.warn(
    "All PDF conversion methods failed. Returning DOCX instead.",
    lastError
  );
  const { createKurdishDocx } = await import("./kurdishExport");
  const docxBuffer = await createKurdishDocx(options);
  return { buffer: docxBuffer, method: "docx-only" };
}

/**
 * Check which conversion methods are available
 */
export async function checkAvailableConverters(): Promise<{
  [key: string]: boolean;
}> {
  const results: { [key: string]: boolean } = {
    "docx-pdf": false,
    "mammoth+pdfmake": false,
    "html-pdf-node": false,
    libreoffice: false,
  };

  // Check docx-pdf
  try {
    require.resolve("docx-pdf");
    results["docx-pdf"] = true;
  } catch {}

  // Check mammoth + pdfmake
  try {
    require.resolve("mammoth");
    require.resolve("pdfmake");
    require.resolve("html-to-pdfmake");
    results["mammoth+pdfmake"] = true;
  } catch {}

  // Check html-pdf-node
  try {
    require.resolve("html-pdf-node");
    results["html-pdf-node"] = true;
  } catch {}

  // Check LibreOffice (only in Node.js)
  if (typeof window === "undefined") {
    try {
      const { execSync } = require("child_process");
      execSync(
        process.platform === "win32"
          ? "where soffice.exe"
          : "which libreoffice",
        { stdio: "ignore" }
      );
      results["libreoffice"] = true;
    } catch {}
  }

  return results;
}
