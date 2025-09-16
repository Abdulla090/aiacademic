#!/usr/bin/env node

/**
 * Script to automatically update all feature pages to use responsive design
 * This script updates the container classes in all page components
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const pagesDir = 'src/pages';
const excludePages = ['LandingPage.tsx', 'Dashboard.tsx', 'NotFound.tsx', 'About.tsx'];

// Pattern to match the current container structure
const oldPattern = /<main className="container mx-auto px-4 py-8">/g;
const newPattern = '<main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">';

// Secondary pattern for headers
const oldHeaderPattern = /<div className="mb-6 flex justify-between items-center">/g;
const newHeaderPattern = '<div className="mb-6 sm:mb-8 flex justify-between items-center">';

// Alternative container pattern
const oldContainerPattern = /<main className="container mx-auto px-4 py-8 max-w-6xl">/g;
const newContainerPattern = '<main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-6xl">';

function updatePageFiles() {
  console.log('🔄 Starting responsive design update for all feature pages...');
  
  // Get all page files
  const pageFiles = fs.readdirSync(pagesDir)
    .filter(file => file.endsWith('.tsx'))
    .filter(file => !excludePages.includes(file))
    .map(file => path.join(pagesDir, file));

  console.log(`📄 Found ${pageFiles.length} page files to update`);

  let updatedCount = 0;

  pageFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let hasChanges = false;

      // Update main container classes
      if (oldPattern.test(content)) {
        content = content.replace(oldPattern, newPattern);
        hasChanges = true;
      }

      // Update alternative container pattern
      if (oldContainerPattern.test(content)) {
        content = content.replace(oldContainerPattern, newContainerPattern);
        hasChanges = true;
      }

      // Update header spacing
      if (oldHeaderPattern.test(content)) {
        content = content.replace(oldHeaderPattern, newHeaderPattern);
        hasChanges = true;
      }

      // Update standalone mb-6 to be responsive
      const oldMbPattern = /className="mb-6"/g;
      if (oldMbPattern.test(content)) {
        content = content.replace(oldMbPattern, 'className="mb-6 sm:mb-8"');
        hasChanges = true;
      }

      if (hasChanges) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated: ${path.basename(filePath)}`);
        updatedCount++;
      } else {
        console.log(`⏭️  No changes needed: ${path.basename(filePath)}`);
      }

    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error.message);
    }
  });

  console.log(`\n🎉 Responsive design update complete!`);
  console.log(`📊 Updated ${updatedCount} out of ${pageFiles.length} page files`);
}

// Run the update
if (require.main === module) {
  updatePageFiles();
}

module.exports = { updatePageFiles };