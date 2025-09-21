// Super simple test to see what's actually happening
import { jsPDF } from 'jspdf';

console.log('Testing basic Kurdish text rendering...');

// Create the simplest possible PDF
const doc = new jsPDF();

// Try different approaches
console.log('1. Testing with default font...');
doc.setFont('helvetica');
doc.text('Test Kurdish: سڵاو لە هەموانتان', 20, 20);

console.log('2. Testing with courier...');
doc.setFont('courier');
doc.text('Test Kurdish: سڵاو لە هەموانتان', 20, 40);

console.log('3. Testing with times...');
doc.setFont('times');
doc.text('Test Kurdish: سڵاو لە هەموانتان', 20, 60);

// Save
doc.save('simple-kurdish-test.pdf');
console.log('Simple test PDF saved');