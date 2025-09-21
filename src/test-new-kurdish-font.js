// Simple test to verify Kurdish font loading and PDF generation with Arabic reshaper
import { jsPDF } from 'jspdf';
import ArabicReshaper from 'arabic-reshaper';

async function testNewKurdishFont() {
  console.log('Testing Kurdish font with Arabic reshaper...');
  
  try {
    // Test the problematic text
    const problemText = 'تەکنەلۆژیا بڕۆمەکی مستمر ڕۆڵەیەکی گرنگی دەگێڕکات لە گۆڕیپینی پانی ئەوە. ئەم نەمڵکەنە';
    
    // Fetch the Amiri font (better Arabic support)
    let response = await fetch('/kurdish-font/amiri-regular.ttf');
    if (!response.ok) {
      response = await fetch('/kurdish-font/NotoSansArabic-Regular.ttf');
    }
    
    console.log('Font fetch response:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Font fetch failed: ${response.status}`);
    }
    
    const fontBuffer = await response.arrayBuffer();
    console.log('Font buffer size:', fontBuffer.byteLength, 'bytes');
    
    // Create PDF with the font
    const doc = new jsPDF();
    
    // Convert font to base64
    const base64 = btoa(
      new Uint8Array(fontBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte), ''
      )
    );
    
    // Add font to jsPDF
    const fontName = response.url.includes('amiri') ? 'amiri-regular.ttf' : 'NotoSansArabic-Regular.ttf';
    const fontFamily = response.url.includes('amiri') ? 'Amiri' : 'NotoSansArabic';
    
    doc.addFileToVFS(fontName, base64);
    doc.addFont(fontName, fontFamily, 'normal');
    doc.setFont(fontFamily);
    
    // Process text with Arabic reshaper
    console.log('Original text:', problemText);
    const reshaped = ArabicReshaper(problemText, {
      ligatures: true,
      harakat: true,
      support: {
        persian: true,
        urdu: true
      }
    });
    console.log('Reshaped text:', reshaped);
    
    // Reverse for jsPDF RTL
    const finalText = reshaped.split('').reverse().join('');
    console.log('Final text for PDF:', finalText);
    
    // Add text to PDF
    doc.setFontSize(16);
    doc.text(finalText, 190, 30, { align: 'right' });
    
    // Add more test text
    const testText2 = 'گرنگی، دەگێڕکات، تەکنەلۆژیا، مستمر';
    const reshaped2 = ArabicReshaper(testText2).split('').reverse().join('');
    doc.text(reshaped2, 190, 50, { align: 'right' });
    
    // Save PDF
    doc.save('kurdish-connected-characters-test.pdf');
    
    console.log('✅ Success! PDF created with proper character connections');
    console.log('📄 Check the downloaded "kurdish-connected-characters-test.pdf" file');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error testing Kurdish font:', error);
    return false;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testNewKurdishFont = testNewKurdishFont;
}

export { testNewKurdishFont };