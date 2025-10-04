# 🚀 Quick Start - Kurdish PDF Export

## ⚡ Fastest Way to Use

### 1. Import the Service

```typescript
import { kurdishDocxPdfService } from '@/services/kurdishDocxPdfService';
```

### 2. Export Your Report

```typescript
await kurdishDocxPdfService.exportAndDownload({
  title: "ڕاپۆرتی کوردی",
  sections: [
    { title: "بەشی یەکەم", content: "ناوەڕۆک..." },
    { title: "بەشی دووەم", content: "ناوەڕۆک..." },
  ],
  fileName: "kurdish-report",
  format: "pdf", // or "docx"
});
```

### 3. Done! 🎉

The PDF will download automatically with perfect Kurdish text rendering.

---

## 🔧 Integration with Your ReportGenerator

Open: `src/components/ReportGenerator.tsx`

Find the `handleDownloadReport` function (around line 441)

Replace the Kurdish export section with:

```typescript
if (language === 'ku') {
  // Import at top of file
  import { kurdishDocxPdfService } from '@/services/kurdishDocxPdfService';
  
  // In handleDownloadReport function
  await kurdishDocxPdfService.exportAndDownload({
    title: titleToUse,
    sections: sectionsToExport.map(section => ({
      title: section.title,
      content: section.content || '',
    })),
    fileName: titleToUse.substring(0, 50),
    format: format, // 'pdf' or 'docx'
    useAdvancedPipeline: true,
  });
}
```

---

## 📦 What You Get

✅ Perfect Kurdish character rendering (ڕ، ڵ، ێ، ە، ۆ، چ، پ، گ، ژ)
✅ Proper RTL (right-to-left) direction
✅ Diacritical marks preserved
✅ Character connections maintained
✅ Unicode font (Noto Naskh Arabic)
✅ Automatic fallback if primary method fails

---

## 🧪 Test It

```powershell
# Create a test file: test.ts
import { kurdishDocxPdfService } from './src/services/kurdishDocxPdfService';

await kurdishDocxPdfService.exportAndDownload({
  title: "تاقیکردنەوە",
  sections: [
    { title: "بەش", content: "ناوەڕۆک بە کوردی" }
  ],
  fileName: "test-kurdish",
  format: "pdf"
});

# Run it
npx ts-node test.ts
```

---

## 📚 Need More?

- **Full Documentation:** `KURDISH_EXPORT_MODULE.md`
- **Examples:** `KURDISH_EXPORT_EXAMPLES.ts`
- **Summary:** `KURDISH_EXPORT_IMPLEMENTATION_SUMMARY.md`

---

## ❓ Troubleshooting

**PDF not working?**
- Try `format: "docx"` instead
- User can convert DOCX → PDF using Word/LibreOffice

**Wrong font?**
- Ensure `public/kurdish-font/NotoNaskhArabic-Regular.ttf` exists

**Need help?**
- Check the full documentation files listed above

---

That's it! You now have professional Kurdish PDF export! 🎊
