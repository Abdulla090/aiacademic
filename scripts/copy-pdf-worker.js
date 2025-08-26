import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfjsDistPath = path.dirname(fileURLToPath(new URL(import.meta.resolve('pdfjs-dist/package.json'))));
const pdfWorkerPath = path.join(pdfjsDistPath, 'build', 'pdf.worker.min.js');
const destPath = path.join(__dirname, '..', 'public', 'pdf.worker.min.js');

fs.copyFileSync(pdfWorkerPath, destPath);
console.log('Copied pdf.worker.min.js to public directory');