/**
 * AI Content Detection and Humanization Utilities
 * Advanced NLP functions to detect AI-generated patterns and humanize content
 */

export interface AIDetectionResult {
  aiScore: number; // 0-100, higher means more AI-like
  patterns: string[];
  suggestions: string;
  confidence: number;
}

export interface HumanizationOptions {
  tone: 'casual' | 'professional' | 'conversational' | 'friendly' | 'creative';
  formality: number; // 0-100
  personality: number; // 0-100
  creativity: number; // 0-100
  addContractions: boolean;
  addPersonalTouch: boolean;
  varyVocabulary: boolean;
  improveFlow: boolean;
}

// Common AI-generated patterns and phrases
const AI_PATTERNS = {
  // Repetitive phrases that AI models often use
  repetitiveStarters: [
    'in conclusion', 'furthermore', 'moreover', 'additionally', 'in summary',
    'it is important to note', 'it should be noted', 'it is worth mentioning',
    'on the other hand', 'in other words', 'as a result', 'consequently'
  ],
  
  // Overly formal expressions
  formalExpressions: [
    'utilize', 'commence', 'endeavor', 'facilitate', 'implement',
    'demonstrate', 'establish', 'contribute to', 'in order to',
    'with regard to', 'in terms of', 'pertaining to'
  ],
  
  // Robotic sentence structures
  roboticStructures: [
    /^(The|This|That) .+ (is|are|can be|will be|has been) .+ (that|which)/,
    /^(It is|There is|There are) .+ (that|which)/,
    /^(One of the|Some of the|Many of the) .+ (is|are)/,
    /^(In order to|To .+,) .+ (it is|one must|you should)/
  ],
  
  // Lack of personal pronouns and opinions
  impersonalIndicators: [
    'one can observe', 'it can be seen', 'it is evident', 'research shows',
    'studies indicate', 'data suggests', 'analysis reveals'
  ],
  
  // Perfect grammar without natural variations
  perfectGrammarIndicators: [
    // Very long sentences without breaks
    /[^.!?]{150,}/g,
    // Consistent use of complex vocabulary
    /\b(consequently|furthermore|nevertheless|moreover|therefore)\b/gi
  ]
};

// Human-like alternatives and variations
const HUMAN_ALTERNATIVES = {
  repetitiveStarters: {
    'in conclusion': ['To wrap up', 'So, to sum it all up', 'Bottom line', 'At the end of the day'],
    'furthermore': ['Plus', 'Also', 'On top of that', 'What\'s more', 'And here\'s another thing'],
    'moreover': ['Not only that', 'Besides', 'And another thing', 'What\'s more'],
    'additionally': ['Also', 'Plus', 'And', 'On top of that', 'Another thing is'],
    'in summary': ['So basically', 'To sum it up', 'Long story short', 'The gist is'],
    'it is important to note': ['Worth mentioning', 'Here\'s the thing', 'Keep in mind', 'Don\'t forget'],
    'on the other hand': ['But then again', 'However', 'That said', 'But here\'s the flip side'],
    'as a result': ['So', 'Because of this', 'This means', 'That\'s why']
  },
  
  formalExpressions: {
    'utilize': ['use', 'try', 'work with'],
    'commence': ['start', 'begin', 'kick off'],
    'endeavor': ['try', 'attempt', 'give it a shot'],
    'facilitate': ['help', 'make easier', 'assist with'],
    'implement': ['put in place', 'start using', 'roll out'],
    'demonstrate': ['show', 'prove', 'illustrate'],
    'establish': ['set up', 'create', 'build'],
    'in order to': ['to', 'so you can', 'so that'],
    'with regard to': ['about', 'regarding', 'when it comes to'],
    'pertaining to': ['about', 'related to', 'concerning']
  }
};

// Contractions for more natural speech
const CONTRACTIONS = {
  'do not': 'don\'t',
  'does not': 'doesn\'t',
  'did not': 'didn\'t',
  'will not': 'won\'t',
  'would not': 'wouldn\'t',
  'could not': 'couldn\'t',
  'should not': 'shouldn\'t',
  'cannot': 'can\'t',
  'is not': 'isn\'t',
  'are not': 'aren\'t',
  'was not': 'wasn\'t',
  'were not': 'weren\'t',
  'have not': 'haven\'t',
  'has not': 'hasn\'t',
  'had not': 'hadn\'t',
  'it is': 'it\'s',
  'that is': 'that\'s',
  'there is': 'there\'s',
  'here is': 'here\'s',
  'what is': 'what\'s',
  'where is': 'where\'s',
  'who is': 'who\'s',
  'how is': 'how\'s',
  'I am': 'I\'m',
  'you are': 'you\'re',
  'we are': 'we\'re',
  'they are': 'they\'re',
  'I have': 'I\'ve',
  'you have': 'you\'ve',
  'we have': 'we\'ve',
  'they have': 'they\'ve',
  'I will': 'I\'ll',
  'you will': 'you\'ll',
  'we will': 'we\'ll',
  'they will': 'they\'ll'
};

// Personal touches and conversational elements
const PERSONAL_TOUCHES = [
  'In my experience',
  'I\'ve found that',
  'What I think is',
  'From what I can tell',
  'The way I see it',
  'Here\'s what I think',
  'My take on this is',
  'If you ask me',
  'Honestly',
  'To be honest',
  'Let me tell you',
  'You know what?',
  'Actually',
  'Interestingly enough',
  'Surprisingly',
  'What\'s funny is'
];

// Sentence starters for better flow
const FLOW_STARTERS = [
  'And here\'s the thing:',
  'But wait, there\'s more.',
  'Now, here\'s where it gets interesting.',
  'Plot twist:',
  'Here\'s the kicker:',
  'Get this:',
  'Check this out:',
  'Listen to this:',
  'Picture this:',
  'Think about it:',
  'Consider this:',
  'Here\'s something cool:'
];

/**
 * Detect AI-generated patterns in text
 */
export async function detectAIPatterns(text: string): Promise<AIDetectionResult> {
  const patterns: string[] = [];
  let aiScore = 0;
  
  // Check for repetitive starters
  const starterCount = AI_PATTERNS.repetitiveStarters.reduce((count, starter) => {
    const regex = new RegExp(`\\b${starter}\\b`, 'gi');
    const matches = (text.match(regex) || []).length;
    if (matches > 1) {
      patterns.push(`Repetitive use of "${starter}"`);
      aiScore += matches * 5;
    }
    return count + matches;
  }, 0);
  
  // Check for formal expressions
  const formalCount = AI_PATTERNS.formalExpressions.reduce((count, expr) => {
    const regex = new RegExp(`\\b${expr}\\b`, 'gi');
    const matches = (text.match(regex) || []).length;
    if (matches > 0) {
      patterns.push(`Formal expression: "${expr}"`);
      aiScore += matches * 3;
    }
    return count + matches;
  }, 0);
  
  // Check for robotic sentence structures
  AI_PATTERNS.roboticStructures.forEach((pattern) => {
    const matches = text.match(pattern) || [];
    if (matches.length > 0) {
      patterns.push('Robotic sentence structure detected');
      aiScore += matches.length * 8;
    }
  });
  
  // Check for impersonal indicators
  const impersonalCount = AI_PATTERNS.impersonalIndicators.reduce((count, indicator) => {
    const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
    const matches = (text.match(regex) || []).length;
    if (matches > 0) {
      patterns.push(`Impersonal language: "${indicator}"`);
      aiScore += matches * 4;
    }
    return count + matches;
  }, 0);
  
  // Check sentence length variation
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  const lengthVariation = sentences.reduce((variance, s) => {
    return variance + Math.pow(s.length - avgLength, 2);
  }, 0) / sentences.length;
  
  if (lengthVariation < 200) {
    patterns.push('Uniform sentence lengths');
    aiScore += 10;
  }
  
  // Check for lack of contractions
  const words = text.split(/\s+/).length;
  const contractionCount = Object.keys(CONTRACTIONS).reduce((count, phrase) => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    return count + (text.match(regex) || []).length;
  }, 0);
  
  const contractionRate = contractionCount / words * 100;
  if (contractionRate < 0.5) {
    patterns.push('Lack of contractions');
    aiScore += 15;
  }
  
  // Check for personal pronouns
  const personalPronouns = text.match(/\b(I|me|my|mine|we|us|our|ours|you|your|yours)\b/gi) || [];
  const personalRate = personalPronouns.length / words * 100;
  if (personalRate < 1) {
    patterns.push('Lack of personal pronouns');
    aiScore += 10;
  }
  
  // Normalize score to 0-100
  aiScore = Math.min(100, aiScore);
  
  let suggestions = '';
  if (aiScore >= 80) {
    suggestions = 'This text shows strong AI patterns. Consider adding personal touches, varying sentence structure, and using more conversational language.';
  } else if (aiScore >= 60) {
    suggestions = 'Moderate AI detection. Try adding contractions, personal opinions, and more natural flow.';
  } else if (aiScore >= 40) {
    suggestions = 'Low AI detection, but could benefit from more personality and casual language.';
  } else {
    suggestions = 'This text appears quite human-like already!';
  }
  
  return {
    aiScore,
    patterns,
    suggestions,
    confidence: Math.min(100, patterns.length * 10 + 50)
  };
}

/**
 * Humanize content using various techniques (conservative approach)
 */
export async function humanizeContent(text: string, options: HumanizationOptions): Promise<string> {
  let humanizedText = text;
  
  // Add contractions (only if enabled and formality is low enough)
  if (options.addContractions && options.formality < 70) {
    Object.entries(CONTRACTIONS).forEach(([formal, contraction]) => {
      // Only replace if it's not in a very formal context
      const regex = new RegExp(`\\b${formal}\\b`, 'gi');
      humanizedText = humanizedText.replace(regex, (match, offset) => {
        // Don't replace in formal contexts like "This study does not show..."
        const context = text.slice(Math.max(0, offset - 20), offset + formal.length + 20).toLowerCase();
        if (context.includes('study') || context.includes('research') || context.includes('analysis')) {
          return match; // Keep formal in academic contexts
        }
        return contraction;
      });
    });
  }
  
  // Replace only the most obviously formal expressions (conservatively)
  if (options.varyVocabulary && options.creativity > 40) {
    const conservativeReplacements = {
      'utilize': 'use',
      'commence': 'start',
      'endeavor': 'try',
      'facilitate': 'help',
      'in order to': 'to',
      'with regard to': 'about',
      'pertaining to': 'about'
    };
    
    Object.entries(conservativeReplacements).forEach(([formal, casual]) => {
      const regex = new RegExp(`\\b${formal}\\b`, 'gi');
      // Only replace occasionally to avoid over-processing
      humanizedText = humanizedText.replace(regex, (match) => {
        return Math.random() < 0.7 ? casual : match;
      });
    });
  }
  
  // Add very subtle personal touches (only occasionally)
  if (options.addPersonalTouch && options.personality > 50) {
    const sentences = humanizedText.split(/(?<=[.!?])\s+/);
    const personalityFactor = options.personality / 100;
    
    // Only add personal touches to a few sentences, not many
    for (let i = 0; i < sentences.length; i++) {
      if (Math.random() < personalityFactor * 0.05) { // Much lower probability
        const subtleTouches = [
          'Actually, ',
          'Interestingly, ',
          'What\'s notable is that ',
          'It turns out that '
        ];
        const touch = subtleTouches[Math.floor(Math.random() * subtleTouches.length)];
        sentences[i] = `${touch}${sentences[i].toLowerCase()}`;
      }
    }
    
    humanizedText = sentences.join(' ');
  }
  
  // Very conservative flow improvements (minimal changes)
  if (options.improveFlow && options.creativity > 60) {
    // Only occasionally add flow connectors
    humanizedText = humanizedText.replace(/\. ([A-Z])/g, (match, letter) => {
      if (Math.random() < 0.05) { // Very low probability
        const connectors = ['. Also, ', '. Plus, ', '. And '];
        return connectors[Math.floor(Math.random() * connectors.length)] + letter.toLowerCase();
      }
      return match;
    });
  }
  
  // Clean up formatting but preserve structure
  humanizedText = humanizedText
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?])/g, '$1')
    .trim();
  
  return humanizedText;
}

/**
 * Get vocabulary alternatives for words
 */
export function getVocabularyAlternatives(word: string): string[] {
  const alternatives: { [key: string]: string[] } = {
    'said': ['mentioned', 'noted', 'explained', 'told me', 'pointed out'],
    'important': ['crucial', 'key', 'vital', 'essential', 'critical'],
    'good': ['great', 'awesome', 'solid', 'excellent', 'fantastic'],
    'bad': ['terrible', 'awful', 'horrible', 'not great', 'disappointing'],
    'big': ['huge', 'massive', 'enormous', 'giant', 'substantial'],
    'small': ['tiny', 'little', 'compact', 'minor', 'minimal'],
    'very': ['really', 'extremely', 'super', 'incredibly', 'quite'],
    'really': ['truly', 'genuinely', 'seriously', 'honestly', 'definitely']
  };
  
  return alternatives[word.toLowerCase()] || [];
}

/**
 * Add emotional expressions based on context
 */
export function addEmotionalExpressions(text: string, emotionLevel: number): string {
  if (emotionLevel < 30) return text;
  
  const emotions = {
    positive: ['Amazing!', 'Incredible!', 'Wow!', 'That\'s awesome!', 'Love it!'],
    negative: ['Ugh.', 'That\'s frustrating.', 'Not ideal.', 'Disappointing.', 'Yikes.'],
    surprise: ['Surprisingly,', 'Believe it or not,', 'Plot twist:', 'Who would have thought?'],
    emphasis: ['Seriously,', 'No joke,', 'For real,', 'I kid you not,', 'Honestly,']
  };
  
  // Add emotional expressions at random points
  const sentences = text.split(/(?<=[.!?])\s+/);
  const emotionFactor = emotionLevel / 100;
  
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < emotionFactor * 0.1) {
      const emotionType = Object.keys(emotions)[Math.floor(Math.random() * Object.keys(emotions).length)] as keyof typeof emotions;
      const expression = emotions[emotionType][Math.floor(Math.random() * emotions[emotionType].length)];
      sentences[i] = `${expression} ${sentences[i]}`;
    }
  }
  
  return sentences.join(' ');
}