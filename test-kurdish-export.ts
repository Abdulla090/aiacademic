/**
 * Test file for Kurdish Export functionality
 * Run with: npm run test or node --loader ts-node/esm test-kurdish-export.ts
 */

import { exportKurdishReportToPDF, exportKurdishReportToDocx } from "./utils/kurdishExport";
import { kurdishDocxPdfService } from "./services/kurdishDocxPdfService";
import { writeFileSync } from "fs";

// Test data
const kurdishTestData = {
  title: "ڕاپۆرتی تاقیکردنەوە",
  subtitle: "نموونەی دەقی کوردی بە ڕێنووسی عەرەبی",
  content: [
    "سەرەتا",
    "ئەم ڕاپۆرتە نموونەیەکی تاقیکردنەوەیە بۆ سیستەمی دەرهێنانی فایلی PDF بە زمانی کوردی.",
    "",
    "بەشی یەکەم: پێناسە",
    "زمانی کوردی یەکێکە لە زمانە ئێرانییەکان کە بە نووسینی عەرەبی دەنووسرێت.",
    "تایبەتمەندییەکانی دەقی کوردی:",
    "- نووسینی ڕاست بۆ چەپ (RTL)",
    "- پیتە تایبەتەکانی وەک: ڕ، ڵ، ێ، ە، ۆ، ووچ، پ، گ، ژ",
    "- خاڵەکان و نیشانەکانی دیاکریتیک",
    "",
    "بەشی دووەم: تاقیکردنەوەکان",
    "ئەم سیستەمە دەبێت توانای ئەمانەی هەبێت:",
    "١. پاراستنی پیتە کوردییەکان",
    "٢. ڕێکخستنی دروست لە ئاراستەی ڕاست بۆ چەپ",
    "٣. پاراستنی خاڵەکان و نیشانەکان",
    "٤. پەیوەندیکردنی پیتەکان بە شێوەی دروست",
    "",
    "دەرئەنجام",
    "ئەگەر ئەم دەقە بە شێوەیەکی دروست لە فایلی PDF دا نیشان دراوە، واتە سیستەمەکە کاردەکات!",
    "",
    "بەروار: ٢٠٢٥/١٠/٠٧",
  ],
};

async function testKurdishExport() {
  console.log("🧪 Starting Kurdish Export Tests...\n");

  try {
    // Test 1: Export as DOCX
    console.log("📄 Test 1: Exporting as DOCX...");
    const docxBuffer = await exportKurdishReportToDocx(kurdishTestData);
    writeFileSync("test-kurdish-report.docx", docxBuffer);
    console.log("✅ DOCX export successful! File saved: test-kurdish-report.docx\n");

    // Test 2: Export as PDF using primary method
    console.log("📄 Test 2: Exporting as PDF (docx-pdf)...");
    try {
      const pdfBuffer = await exportKurdishReportToPDF(kurdishTestData);
      writeFileSync("test-kurdish-report-primary.pdf", pdfBuffer);
      console.log("✅ PDF export (primary method) successful! File saved: test-kurdish-report-primary.pdf\n");
    } catch (error) {
      console.log("⚠️  Primary PDF export failed:", error instanceof Error ? error.message : error);
      console.log("   (This is expected if docx-pdf is not available)\n");
    }

    // Test 3: Using the service with sections
    console.log("📄 Test 3: Exporting using kurdishDocxPdfService...");
    const sections = [
      { title: "بەشی یەکەم", content: "ناوەڕۆکی بەشی یەکەم" },
      { title: "بەشی دووەم", content: "ناوەڕۆکی بەشی دووەم" },
      { title: "بەشی سێیەم", content: "ناوەڕۆکی بەشی سێیەم" },
    ];

    const blob = await kurdishDocxPdfService.exportReport({
      title: "ڕاپۆرتی سێ بەش",
      sections,
      fileName: "test-three-sections",
      format: "docx", // Start with DOCX for testing
      includeDateFooter: true,
    });

    // Convert blob to buffer and save
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    writeFileSync("test-kurdish-service.docx", buffer);
    console.log("✅ Service export successful! File saved: test-kurdish-service.docx\n");

    // Test 4: Check available converters
    console.log("📄 Test 4: Checking available converters...");
    const { checkAvailableConverters } = await import("./utils/kurdishExportFallbacks");
    const converters = await checkAvailableConverters();
    console.log("Available converters:", converters);
    console.log("");

    console.log("🎉 All tests completed!");
    console.log("\n📝 Summary:");
    console.log("   - test-kurdish-report.docx (DOCX export)");
    console.log("   - test-kurdish-report-primary.pdf (PDF export, if available)");
    console.log("   - test-kurdish-service.docx (Service export)");
    console.log("\nOpen these files to verify Kurdish text rendering!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  testKurdishExport().catch(console.error);
}

export { testKurdishExport };
