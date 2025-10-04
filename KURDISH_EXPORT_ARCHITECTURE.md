# Kurdish Export System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     YOUR APPLICATION                                 │
│                  (ReportGenerator.tsx)                               │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          │ User clicks "Export PDF"
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│              kurdishDocxPdfService.exportAndDownload()              │
│                                                                      │
│  • Takes report title and sections                                   │
│  • Handles format selection (PDF/DOCX)                              │
│  • Manages download to browser                                       │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    createKurdishDocx()                               │
│                                                                      │
│  • Creates DOCX document structure                                   │
│  • Applies Noto Naskh Arabic font                                    │
│  • Sets RTL direction and alignment                                  │
│  • Handles Kurdish character encoding                                │
│  • Generates proper paragraph spacing                                │
│                                                                      │
│  Output: DOCX Buffer (perfect Kurdish rendering) ✓                  │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          │ If format === 'pdf'
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   DOCX → PDF Conversion                              │
│                 (Multiple Methods with Auto-Fallback)                │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬─────────────────┐
        │                 │                 │                 │
        ▼                 ▼                 ▼                 ▼
   ┌────────┐      ┌────────────┐    ┌───────────┐    ┌──────────┐
   │ Method │      │  Method 2  │    │ Method 3  │    │ Method 4 │
   │   1    │      │            │    │           │    │          │
   │        │      │            │    │           │    │          │
   │ docx   │      │ html-pdf   │    │ mammoth + │    │LibreOffice│
   │ -pdf   │──✗──▶│   -node    │─✗─▶│  pdfmake  │─✗─▶│   CLI    │
   │        │      │            │    │           │    │          │
   │ (Node) │      │(Puppeteer) │    │  (Both)   │    │ (Server) │
   └────┬───┘      └─────┬──────┘    └─────┬─────┘    └────┬─────┘
        │                │                  │                │
        │ Success        │ Success          │ Success        │ Success
        │                │                  │                │
        └────────────────┴──────────────────┴────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PDF Buffer Output                               │
│                                                                      │
│  ✓ Kurdish characters intact (ڕ، ڵ، ێ، ە، ۆ، چ، پ، گ، ژ)          │
│  ✓ RTL direction preserved                                           │
│  ✓ Diacritics maintained                                             │
│  ✓ Character connections proper                                      │
│  ✓ Professional formatting                                           │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Browser Download                                  │
│                                                                      │
│  User receives: kurdish-report.pdf                                   │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                          DATA FLOW EXAMPLE
═══════════════════════════════════════════════════════════════════════

Input (JavaScript Object):
┌────────────────────────────────────────────────────────────────┐
│ {                                                              │
│   title: "ڕاپۆرتی تاقیکردنەوە",                               │
│   sections: [                                                  │
│     { title: "بەشی یەکەم", content: "ناوەڕۆک..." },          │
│     { title: "بەشی دووەم", content: "ناوەڕۆک..." }           │
│   ]                                                            │
│ }                                                              │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
DOCX Document (Internal Structure):
┌────────────────────────────────────────────────────────────────┐
│ Document {                                                     │
│   font: "Noto Naskh Arabic"                                    │
│   direction: RTL                                               │
│   sections: [                                                  │
│     Paragraph { text: "ڕاپۆرتی تاقیکردنەوە", bold, large }   │
│     Paragraph { text: "بەشی یەکەم", heading }                 │
│     Paragraph { text: "ناوەڕۆک...", normal }                  │
│     ...                                                        │
│   ]                                                            │
│ }                                                              │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
PDF Output (Visual Representation):
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                      ەوەدرکیقات تۆڕاپ                         │
│                     ══════════════                             │
│                                                                │
│  مکەی شەب                                                      │
│  ─────────                                                     │
│  ...کۆڕەواڵ                                                   │
│                                                                │
│  مەەوود شەب                                                    │
│  ─────────                                                     │
│  ...کۆڕەواڵ                                                   │
│                                                                │
│                                        ٢٠٢٥/١٠/٠٧ :راوەب     │
└────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                         COMPARISON TABLE
═══════════════════════════════════════════════════════════════════════

Feature                  │  jsPDF (Old)  │  Kurdish Export (New)
─────────────────────────┼───────────────┼──────────────────────────
Kurdish Characters (ڕڵێ)  │      ❌       │          ✅
RTL Direction            │      ⚠️       │          ✅
Diacritics               │      ❌       │          ✅
Character Connections    │      ❌       │          ✅
Unicode Support          │      ⚠️       │          ✅
Font Control             │      ⚠️       │          ✅
Multiple Export Formats  │      ❌       │       ✅ (PDF/DOCX)
Fallback Methods         │      ❌       │       ✅ (4 methods)
Type Safety              │      ⚠️       │          ✅
Documentation            │      ⚠️       │          ✅


═══════════════════════════════════════════════════════════════════════
                         FILE STRUCTURE
═══════════════════════════════════════════════════════════════════════

src/
├── utils/
│   ├── kurdishExport.ts          ← Core export engine
│   └── kurdishExportFallbacks.ts ← Alternative converters
├── services/
│   └── kurdishDocxPdfService.ts  ← High-level API
└── kurdish-export.ts             ← Unified exports

Documentation/
├── KURDISH_EXPORT_MODULE.md              ← Full documentation
├── KURDISH_EXPORT_IMPLEMENTATION_SUMMARY.md
├── QUICK_START_KURDISH_EXPORT.md         ← This is all you need!
├── KURDISH_EXPORT_ARCHITECTURE.md        ← You are here
└── KURDISH_EXPORT_EXAMPLES.ts            ← 7 usage examples


═══════════════════════════════════════════════════════════════════════
                    TECHNOLOGY STACK DIAGRAM
═══════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
│                                                                 │
│  ReportGenerator.tsx  →  kurdishDocxPdfService                  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────┐
│                      Service Layer                              │
│                                                                 │
│  kurdishDocxPdfService.ts                                       │
│  • Export management                                            │
│  • Format handling                                              │
│  • Download helpers                                             │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────┐
│                      Core Layer                                 │
│                                                                 │
│  kurdishExport.ts                                               │
│  • DOCX generation (docx package)                               │
│  • Font handling (Noto Naskh Arabic)                            │
│  • RTL/Unicode processing                                       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────┐
│                   Conversion Layer                              │
│                                                                 │
│  kurdishExportFallbacks.ts                                      │
│  • docx-pdf                                                     │
│  • html-pdf-node                                                │
│  • mammoth + pdfmake                                            │
│  • LibreOffice CLI                                              │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────┐
│                    External Dependencies                        │
│                                                                 │
│  npm packages: docx, docx-pdf, uuid, mammoth, pdfmake, etc.    │
└─────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                         DECISION TREE
═══════════════════════════════════════════════════════════════════════

                    User clicks "Export"
                           │
                           ▼
                   What format?
                    ┌────┴────┐
                    │         │
                   PDF      DOCX
                    │         │
                    │         └─────────────────┐
                    ▼                           ▼
            Try docx-pdf               Create DOCX
                    │                     Buffer
                    │                           │
              Success?                          ▼
               ┌──┴──┐                      Download
              Yes    No                         │
               │     │                          ▼
               │     └──▶ Try html-pdf-node    DONE!
               │              │
               │        Success?
               │         ┌──┴──┐
               │        Yes    No
               │         │     │
               │         │     └──▶ Try mammoth+pdfmake
               │         │              │
               │         │        Success?
               │         │         ┌──┴──┐
               │         │        Yes    No
               │         │         │     │
               │         │         │     └──▶ Try LibreOffice
               │         │         │              │
               │         │         │        Success?
               │         │         │         ┌──┴──┐
               │         │         │        Yes    No
               │         │         │         │     │
               └─────────┴─────────┴─────────┘     └──▶ Export DOCX
                           │                              instead
                           ▼
                      Download PDF
                           │
                           ▼
                         DONE!
```

This architecture ensures:
- ✅ Maximum compatibility (4 conversion methods)
- ✅ Automatic fallback on failure
- ✅ Perfect Kurdish text rendering
- ✅ Easy integration
- ✅ Type-safe TypeScript
