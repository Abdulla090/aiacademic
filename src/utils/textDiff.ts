export interface DiffPart {
  type: 'added' | 'removed' | 'changed' | 'unchanged';
  text: string;
  originalText?: string; // For changed parts, store original text
}

export class TextDiffGenerator {
  static generateDiff(originalText: string, fixedText: string): DiffPart[] {
    // Split texts into words for better comparison
    const originalWords = originalText.split(/(\s+)/);
    const fixedWords = fixedText.split(/(\s+)/);
    
    const result: DiffPart[] = [];
    let originalIndex = 0;
    let fixedIndex = 0;
    
    while (originalIndex < originalWords.length || fixedIndex < fixedWords.length) {
      // If we've reached the end of original text, everything else is added
      if (originalIndex >= originalWords.length) {
        while (fixedIndex < fixedWords.length) {
          result.push({
            type: 'added',
            text: fixedWords[fixedIndex]
          });
          fixedIndex++;
        }
        break;
      }
      
      // If we've reached the end of fixed text, everything else is removed
      if (fixedIndex >= fixedWords.length) {
        while (originalIndex < originalWords.length) {
          result.push({
            type: 'removed',
            text: originalWords[originalIndex]
          });
          originalIndex++;
        }
        break;
      }
      
      const originalWord = originalWords[originalIndex];
      const fixedWord = fixedWords[fixedIndex];
      
      // Check if words are identical
      if (originalWord === fixedWord) {
        result.push({
          type: 'unchanged',
          text: originalWord
        });
        originalIndex++;
        fixedIndex++;
        continue;
      }
      
      // Check if this is a substitution (similar length words)
      if (Math.abs(originalWord.length - fixedWord.length) <= 2 && 
          this.calculateSimilarity(originalWord, fixedWord) > 0.5) {
        result.push({
          type: 'changed',
          text: fixedWord,
          originalText: originalWord
        });
        originalIndex++;
        fixedIndex++;
        continue;
      }
      
      // Look ahead to find matches
      const originalLookahead = this.findNextMatch(originalWords, originalIndex, fixedWord, 5);
      const fixedLookahead = this.findNextMatch(fixedWords, fixedIndex, originalWord, 5);
      
      if (originalLookahead === -1 && fixedLookahead === -1) {
        // Neither word found ahead, treat as change
        result.push({
          type: 'changed',
          text: fixedWord,
          originalText: originalWord
        });
        originalIndex++;
        fixedIndex++;
      } else if (originalLookahead !== -1 && (fixedLookahead === -1 || originalLookahead <= fixedLookahead)) {
        // Fixed word found in original text ahead, current original words are removed
        while (originalIndex < originalLookahead) {
          result.push({
            type: 'removed',
            text: originalWords[originalIndex]
          });
          originalIndex++;
        }
      } else {
        // Original word found in fixed text ahead, current fixed words are added
        while (fixedIndex < fixedLookahead) {
          result.push({
            type: 'added',
            text: fixedWords[fixedIndex]
          });
          fixedIndex++;
        }
      }
    }
    
    return this.mergeConsecutiveParts(result);
  }
  
  private static findNextMatch(words: string[], startIndex: number, targetWord: string, maxLookahead: number): number {
    for (let i = startIndex + 1; i < Math.min(startIndex + maxLookahead + 1, words.length); i++) {
      if (words[i] === targetWord) {
        return i;
      }
    }
    return -1;
  }
  
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
  
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  private static mergeConsecutiveParts(parts: DiffPart[]): DiffPart[] {
    const merged: DiffPart[] = [];
    let current: DiffPart | null = null;
    
    for (const part of parts) {
      if (current && current.type === part.type && current.type !== 'changed') {
        current.text += part.text;
      } else {
        if (current) merged.push(current);
        current = { ...part };
      }
    }
    
    if (current) merged.push(current);
    return merged;
  }
  
  static renderDiffAsHTML(diffParts: DiffPart[]): string {
    return diffParts.map(part => {
      switch (part.type) {
        case 'added':
          return `<span class="bg-green-100 text-green-800 px-1 rounded">${this.escapeHtml(part.text)}</span>`;
        case 'removed':
          return `<span class="bg-red-100 text-red-800 line-through px-1 rounded">${this.escapeHtml(part.text)}</span>`;
        case 'changed':
          return `<span class="bg-yellow-100 text-yellow-800 px-1 rounded" title="Changed from: ${this.escapeHtmlAttribute(part.originalText || '')}">${this.escapeHtml(part.text)}</span>`;
        case 'unchanged':
          return this.escapeHtml(part.text);
        default:
          return this.escapeHtml(part.text);
      }
    }).join('');
  }
  
  private static escapeHtml(text: string): string {
    const htmlEntityMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    
    return text.replace(/[&<>"']/g, (char) => htmlEntityMap[char]);
  }

  private static escapeHtmlAttribute(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}