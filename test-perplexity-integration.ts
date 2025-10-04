/**
 * Test script for Perplexity API Integration
 * 
 * This file demonstrates the new Perplexity API integration for academic research.
 * You can run this to test the research functionality.
 */

import { researchQuery } from './src/services/perplexityService';

async function testPerplexityResearch() {
  console.log('🧪 Testing Perplexity API Integration for Academic Research\n');
  console.log('=' .repeat(60));
  
  try {
    // Test query
    const query = 'What are the latest developments in artificial intelligence for education?';
    console.log(`\n📚 Research Query: "${query}"\n`);
    console.log('🔍 Searching academic sources via Perplexity API...\n');
    
    // Make research query
    const result = await researchQuery(query);
    
    // Display results
    console.log('✅ Research Completed Successfully!\n');
    console.log('=' .repeat(60));
    console.log(`\n📖 Title: ${result.title}`);
    console.log(`\n🎯 Credibility Score: ${result.credibilityScore}%`);
    console.log(`\n📝 Summary:\n${result.summary.slice(0, 300)}...\n`);
    
    console.log(`\n🔑 Key Findings (${result.keyFindings.length}):`);
    result.keyFindings.forEach((finding, i) => {
      console.log(`   ${i + 1}. ${finding.slice(0, 100)}...`);
    });
    
    console.log(`\n📚 Sources (${result.sources.length}):`);
    result.sources.forEach((source, i) => {
      console.log(`   ${i + 1}. ${source.title} (${source.type}) - Credibility: ${source.credibilityScore}%`);
      console.log(`      URL: ${source.url}`);
    });
    
    console.log(`\n📎 Citations:`);
    result.citations.forEach((citation, i) => {
      console.log(`   ${i + 1}. ${citation.format}: ${citation.citation.slice(0, 80)}...`);
    });
    
    console.log('\n' + '=' .repeat(60));
    console.log('✨ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\nError details:', error instanceof Error ? error.message : error);
  }
}

// Run the test
console.log('\n🚀 Starting Perplexity API Integration Test...\n');
testPerplexityResearch();
