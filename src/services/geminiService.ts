export interface GeminiResponse {
  text: string;
}

export type StreamCallback = (chunk: string) => void;
export type StreamingOptions = {
  onChunk?: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  chunkSize?: number;
  delay?: number;
};

export interface CitationStyle {
  type: 'APA' | 'MLA' | 'IEEE';
}

export interface ArticleRequest {
  topic: string;
  length: 'short' | 'medium' | 'long';
  citationStyle: CitationStyle['type'];
  includeReferences: boolean;
  language: string;
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface ReportOutline {
  title: string;
  sections: string[];
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  suggestions: string[];
}

export interface MindMapNode {
  id: string;
  text: string;
  children: MindMapNode[];
  level: number;
  shape?: 'circle' | 'square' | 'diamond';
}

export interface TaskPlan {
  title: string;
  description: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  duration?: string; // estimated time to complete
  category?: string; // study, revision, assignment, etc.
  difficulty?: 'easy' | 'medium' | 'hard';
  resources?: string[]; // required materials/resources
  dailyTime?: string; // recommended daily time
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface PresentationSlide {
  title: string;
  content: string;
  layout: 'title' | 'text' | 'image-right' | 'image-left';
  imageSearchTerm?: string;
}

export interface WritingSuggestion {
  type: 'completion' | 'grammar' | 'vocabulary';
  suggestion: string;
}

export interface NextSentence {
    sentence: string;
}

export interface CitationRequest {
  content: string; // The text content from the file or website
  style: 'APA' | 'MLA' | 'Chicago' | 'IEEE';
}

export interface ResearchResult {
  id: string;
  title: string;
  summary: string;
  credibilityScore: number;
  keyFindings: string[];
  relatedTopics: string[];
  sources: ResearchSource[];
  citations: ResearchCitation[];
}

export interface ResearchSource {
  id: string;
  title: string;
  author: string;
  type: 'academic' | 'government' | 'organization' | 'news' | 'other';
  credibilityScore: number;
  publishDate: string;
  url: string;
}

export interface ResearchCitation {
  id: string;
  format: 'APA' | 'MLA' | 'Chicago';
  citation: string;
}

class GeminiService {
  private apiKey = 'AIzaSyBsMPe_MEasu7x3u9EK85ULYDHZ3oykklM';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  private async makeRequest(prompt: string, model = 'gemini-2.0-flash-exp', streamCallback?: StreamCallback): Promise<GeminiResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    try {
      // If we have a streamCallback, use streaming mode
      if (streamCallback) {
        // For streaming, we need to use the streamGenerateContent endpoint
        const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${this.apiKey}`;
        const response = await fetch(streamUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            }
          })
        });

        if (!response.ok) {
          throw new Error(`API stream request failed: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('ReadableStream not supported');
        }

        const reader = response.body.getReader();
        let fullText = '';

        try {
          // Read the stream
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Convert the chunk to text
            const chunk = new TextDecoder().decode(value);
            
            // Parse the chunk - each line is a separate JSON object
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                  const chunkText = data.candidates[0].content.parts[0].text;
                  fullText += chunkText;
                  streamCallback(chunkText);
                }
              } catch (e) {
                console.error('Error parsing JSON from stream:', e);
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
        
        return { text: fullText };
      } else {
        // Non-streaming mode (original implementation)
        const response = await fetch(`${url}?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            }
          })
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return {
          text: data.candidates[0].content.parts[0].text
        };
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to communicate with AI service');
    }
  }

  async generateArticleStreaming(request: ArticleRequest, options: StreamingOptions): Promise<void> {
    const lengthMap = {
      short: '500-800 words',
      medium: '1000-1500 words',
      long: '2000-3000 words'
    };

    const prompt = `
    Become an expert academic writer who writes scientific articles in ${request.language === 'ku' ? 'Sorani Kurdish' : request.language}.

    Topic: ${request.topic}
    Length: ${lengthMap[request.length]}
    Citation Style: ${request.citationStyle}
    ${request.includeReferences ? 'Add References: Yes' : 'Add References: No'}
    Language: ${request.language}

    The article must have the following structure:
    1. Title - A suitable and clear title
    2. Abstract - A 150-250 word summary that explains the topic
    3. Sections - The main sections of the article (must have at least 3 sections)
    4. Conclusion - Conclusion and recommendations
    ${request.includeReferences ? '5. References - List of references in ' + request.citationStyle + ' style' : ''}

    Instructions:
    - Language: ${request.language}
    - Style: Academic and professional
    - Grammar: Correct and clear
    - The article should be like a real academic paper, not a chat response
    - Make sure the article has an academic structure and contains real information
    - Each section should be at least 200 words
    - Use scientific sentences and words
    - Use conjunctions to connect the sections
    - Use proper markdown formatting for enhanced readability:
      * Use **bold text** for key terms and important concepts
      * Use *italic text* for emphasis and foreign terms
      * Use ## for main section headings (e.g., ## Introduction)
      * Use ### for subsection headings
      * Use bullet points (- or *) for lists
      * Use numbered lists (1., 2., 3.) when sequence matters
      * Use > for important quotes or definitions
      * Use backticks for technical terms or specific terminology
      * Use proper paragraph spacing with empty lines

    Please write the article entirely in ${request.language} with proper markdown formatting.
    `;

    try {
      const response = await this.makeRequest(prompt);
      await this.simulateStreaming(response.text, options);
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('Failed to generate article'));
    }
  }

  async generateArticle(request: ArticleRequest, streamCallback?: StreamCallback): Promise<string> {
    const lengthMap = {
      short: '500-800 words',
      medium: '1000-1500 words',
      long: '2000-3000 words'
    };

    const prompt = `
    Become an expert academic writer who writes scientific articles in ${request.language === 'ku' ? 'Sorani Kurdish' : request.language}.

    Topic: ${request.topic}
    Length: ${lengthMap[request.length]}
    Citation Style: ${request.citationStyle}
    ${request.includeReferences ? 'Add References: Yes' : 'Add References: No'}
    Language: ${request.language}

    The article must have the following structure:
    1. Title - A suitable and clear title
    2. Abstract - A 150-250 word summary that explains the topic
    3. Sections - The main sections of the article (must have at least 3 sections)
    4. Conclusion - Conclusion and recommendations
    ${request.includeReferences ? '5. References - List of references in ' + request.citationStyle + ' style' : ''}

    Instructions:
    - Language: ${request.language}
    - Style: Academic and professional
    - Grammar: Correct and clear
    - The article should be like a real academic paper, not a chat response
    - Make sure the article has an academic structure and contains real information
    - Each section should be at least 200 words
    - Use scientific sentences and words
    - Use conjunctions to connect the sections
    - Use proper markdown formatting for enhanced readability:
      * Use **bold text** for key terms and important concepts
      * Use *italic text* for emphasis and foreign terms
      * Use ## for main section headings (e.g., ## Introduction)
      * Use ### for subsection headings
      * Use bullet points (- or *) for lists
      * Use numbered lists (1., 2., 3.) when sequence matters
      * Use > for important quotes or definitions
      * Use backticks for technical terms or specific terminology
      * Use proper paragraph spacing with empty lines

    Please write the article entirely in ${request.language} with proper markdown formatting.
    `;

    const response = await this.makeRequest(prompt, 'gemini-2.0-flash-exp', streamCallback);
    return response.text;
  }

  async generateReportOutline(topic: string, language: string): Promise<ReportOutline> {
    const prompt = `
    Create a detailed, logical, and well-structured academic report outline for the topic: "${topic}".

    The outline should be in ${language === 'ku' ? 'Sorani Kurdish' : language}. It must include a clear title and a series of relevant sections that flow logically from one to the next.

    IMPORTANT: Respond ONLY with a valid JSON object. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The entire response must be a single JSON object.

    JSON Format:
    {
      "title": "A Relevant and Specific Title for the Report",
      "sections": [
        "Introduction",
        "Background and Context",
        "Key Area of Investigation 1",
        "Key Area of Investigation 2",
        "Analysis and Findings",
        "Conclusion",
        "References"
      ]
    }
    `;

    const response = await this.makeRequest(prompt);
    try {
      const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanedText.match(/(\{[\s\S]*\})/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Failed to find JSON in AI response.");
    } catch (error) {
      console.error("Failed to parse report outline JSON:", error, "Raw response:", response.text);
      // Fallback to a generic structure if parsing fails, but log the error.
      return {
        title: `Report on: ${topic}`,
        sections: ['Introduction', 'Main Body', 'Conclusion', 'References']
      };
    }
  }

  async generateReportSectionStreaming(outline: ReportOutline, sectionName: string, previousSections: ReportSection[], language: string, options: StreamingOptions): Promise<void> {
    const contextText = previousSections.length > 0 
      ? `Previous sections:\n${previousSections.map(s => `${s.title}: ${s.content.substring(0, 200)}...`).join('\n')}`
      : '';

    const prompt = `
    Academic Report: ${outline.title}
    Current Section: ${sectionName}
    
    ${contextText}

    For the section "${sectionName}", write a complete and academic content that has the style of an academic report, not a research paper. The content should be an analysis and summary of information on the topic.

    The content must:
    - Be clear and organized.
    - Contain accurate and correct information.
    - Use academic and formal language.
    - Be written in ${language === 'ku' ? 'Sorani Kurdish' : language}.
    - Be related to the other sections of the report.
    - Use proper markdown formatting for enhanced readability:
      * Use **bold text** for key findings and important concepts
      * Use *italic text* for emphasis and terminology
      * Use ### for any subsection headings within the section
      * Use bullet points (- or *) for listing key points
      * Use numbered lists (1., 2., 3.) when sequence or priority matters
      * Use > for important quotes, definitions, or highlighted information
      * Use proper paragraph spacing with empty lines

    Length: Approximately 300-500 words.
    
    Please write the content as part of an academic report, not as a chat response. Focus on analyzing and presenting information, not on presenting hypotheses and new research methodologies. Use markdown formatting to make the content more readable and professionally structured.
    `;

    try {
      const response = await this.makeRequest(prompt);
      await this.simulateStreaming(response.text, options);
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('Failed to generate section'));
    }
  }

  async generateReportSection(outline: ReportOutline, sectionName: string, previousSections: ReportSection[], language: string, streamCallback?: StreamCallback): Promise<string> {
    const contextText = previousSections.length > 0 
      ? `Previous sections:\n${previousSections.map(s => `${s.title}: ${s.content.substring(0, 200)}...`).join('\n')}`
      : '';

    const prompt = `
    Academic Report: ${outline.title}
    Current Section: ${sectionName}
    
    ${contextText}

    For the section "${sectionName}", write a complete and academic content that has the style of an academic report, not a research paper. The content should be an analysis and summary of information on the topic.

    The content must:
    - Be clear and organized.
    - Contain accurate and correct information.
    - Use academic and formal language.
    - Be written in ${language === 'ku' ? 'Sorani Kurdish' : language}.
    - Be related to the other sections of the report.
    - Use proper markdown formatting for enhanced readability:
      * Use **bold text** for key findings and important concepts
      * Use *italic text* for emphasis and terminology
      * Use ### for any subsection headings within the section
      * Use bullet points (- or *) for listing key points
      * Use numbered lists (1., 2., 3.) when sequence or priority matters
      * Use > for important quotes, definitions, or highlighted information
      * Use proper paragraph spacing with empty lines

    Length: Approximately 300-500 words.
    
    Please write the content as part of an academic report, not as a chat response. Focus on analyzing and presenting information, not on presenting hypotheses and new research methodologies. Use markdown formatting to make the content more readable and professionally structured.
    `;

    const response = await this.makeRequest(prompt, 'gemini-2.0-flash-exp', streamCallback);
    if (typeof response.text === 'string') {
      return response.text;
    }
    // If the response is not a string, return an empty string and log an error.
    console.error("AI response for section was not a string:", response);
    return "";
  }

  async checkGrammar(text: string, language: string): Promise<GrammarCorrection> {
    const prompt = `
    Become an expert in ${language === 'ku' ? 'Sorani Kurdish' : language} grammar. Check the following text and correct any grammar, spelling, and style mistakes:

    "${text}"

    Requirements:
    - Identify and correct grammar mistakes
    - Improve spelling and punctuation
    - Suggest better vocabulary
    - Make sentences clearer and more readable
    - Use conjunctions to connect sentences
    - Ensure the text is in a formal, academic style

    Provide the response in the following JSON format:
    {
      "original": "The original text",
      "corrected": "The corrected text",
      "suggestions": [
        "Suggestion 1: Details about a specific mistake",
        "Suggestion 2: Details about another mistake"
      ]
    }
    
    The response should only be a grammar correction, not a new text. Be sure to identify and correct the mistakes specifically.
    `;

    const response = await this.makeRequest(prompt);
    try {
      return JSON.parse(response.text);
    } catch {
      return {
        original: text,
        corrected: text,
        suggestions: ['No changes needed']
      };
    }
  }

  async checkGrammarDetailed(text: string, language: string = 'ku'): Promise<Array<{
    id: string;
    start: number;
    end: number;
    text: string;
    message: string;
    suggestions: string[];
    type: 'grammar' | 'spelling' | 'style' | 'punctuation';
    severity: 'error' | 'warning' | 'suggestion';
  }>> {
    const languageSettings = language === 'ku' ? 
      'in Sorani Kurdish (کوردی)' : 
      'in English';

    const prompt = `
    Analyze the following text ${languageSettings} and identify ALL grammar, spelling, punctuation, and style issues. Provide detailed analysis for each error.

    Text to analyze:
    "${text}"

    Requirements:
    - Find all grammar mistakes with exact positions
    - Identify spelling errors
    - Check punctuation issues
    - Suggest style improvements
    - Provide multiple suggestions for each error
    - Classify each error by type and severity

    For each error found, provide:
    1. The exact text that has the error
    2. The character position where the error starts and ends
    3. A clear explanation of what's wrong
    4. Multiple suggestions for fixing it
    5. Error type (grammar/spelling/style/punctuation)
    6. Severity level (error/warning/suggestion)

    Return the response as a JSON array in this exact format:
    [
      {
        "text": "exact text with error",
        "start": position_number,
        "end": position_number,
        "message": "explanation of the error",
        "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
        "type": "grammar",
        "severity": "error"
      }
    ]

    If no errors are found, return an empty array: []

    Be thorough and find all issues. Don't miss any errors.
    `;

    try {
      const response = await this.makeRequest(prompt);
      const errors = JSON.parse(response.text);
      
      // Add unique IDs and validate structure
      return errors.map((error: any, index: number) => ({
        id: `error_${Date.now()}_${index}`,
        start: Number(error.start) || 0,
        end: Number(error.end) || 0,
        text: error.text || '',
        message: error.message || 'Grammar issue detected',
        suggestions: Array.isArray(error.suggestions) ? error.suggestions : ['No suggestions available'],
        type: ['grammar', 'spelling', 'style', 'punctuation'].includes(error.type) ? error.type : 'grammar',
        severity: ['error', 'warning', 'suggestion'].includes(error.severity) ? error.severity : 'warning'
      }));
    } catch (error) {
      console.error('Error parsing grammar check response:', error);
      return [];
    }
  }

  async generateMindMap(topic: string): Promise<MindMapNode> {
    const prompt = `
    Generate a mind map for the topic "${topic}" in Sorani Kurdish. The mind map should explore related concepts.

    Structure:
    - A central root node: The main topic.
    - Main branches: 4-6 key concepts related to the main topic.
    - Sub-branches: 2-4 details for each main branch.

    For example, if the topic is "Kurdish Culture", the root node would be "Kurdish Culture", main branches could be "History", "Traditions", "Language", etc., and sub-branches would be details about each.

    IMPORTANT: Respond ONLY with a valid JSON object that follows the structure below. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The entire response must be a single JSON object.

    JSON Format:
    {
      "id": "root",
      "text": "The Main Topic",
      "level": 0,
      "children": [
        {
          "id": "1",
          "text": "First Branch",
          "level": 1,
          "children": [
            {"id": "1.1", "text": "Sub-branch detail", "level": 2, "children": []},
            {"id": "1.2", "text": "Another detail", "level": 2, "children": []}
          ]
        },
        {
          "id": "2",
          "text": "Second Branch",
          "level": 1,
          "children": [
            {"id": "2.1", "text": "Detail for second branch", "level": 2, "children": []}
          ]
        }
      ]
    }
    `;

    const response = await this.makeRequest(prompt);
    try {
      // The response might be wrapped in markdown, so let's try to extract it.
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        // Basic validation
        if (parsedResponse && parsedResponse.id && parsedResponse.text && Array.isArray(parsedResponse.children)) {
            return parsedResponse;
        }
      }
      throw new Error('Invalid or non-JSON response from AI.');
    } catch (e) {
      console.error("Failed to parse mind map JSON:", e);
      console.error("Raw AI response:", response.text);
      // Return a structure that indicates an error, but is still a valid MindMapNode
      return {
        id: 'root',
        text: 'Error Generating Mind Map',
        level: 0,
        children: [
            { id: 'error-1', text: 'Could not generate mind map from AI.', level: 1, children: [] },
            { id: 'error-2', text: 'Please try a different topic.', level: 1, children: [] }
        ]
      };
    }
  }

  async summarizeText(text: string, length: 'short' | 'medium' | 'detailed'): Promise<string> {
    const lengthMap = {
      short: '2-3 sentences',
      medium: '1 paragraph',
      detailed: '2-3 paragraphs'
    };

    const prompt = `
    Summarize the following text in Sorani Kurdish:

    "${text}"

    Summary length: ${lengthMap[length]}
    
    Requirements:
    - Preserve the most important points
    - Use clear and concise language
    - Do not lose the main meaning
    - Write in Sorani Kurdish
    
    The summary should be like a short report, not a chat response. Make sure it contains the important information.
    `;

    const response = await this.makeRequest(prompt);
    return response.text;
  }

  async paraphraseText(text: string): Promise<string> {
    const prompt = `
    Rewrite the following text in a different way, but with the same meaning:

    "${text}"

    Requirements:
    - The main meaning should remain the same
    - Change the words and sentences
    - Use a different writing style
    - Use Sorani Kurdish
    
    The rewritten text should be like a rewritten academic text, not a chat response. Make sure the meaning remains the same, but in a different way.
    `;

    const response = await this.makeRequest(prompt);
    return response.text;
  }

  async generateSmartTaskPlan(
    projectTitle: string, 
    deadline: string, 
    details: string, 
    taskType: string = 'study',
    currentLevel: string = 'beginner',
    availableHoursPerDay: number = 2,
    preferredStudyTimes: string[] = ['morning'],
    subjects?: string[],
    documentContent?: string
  ): Promise<TaskPlan[]> {
    const today = new Date();
    const targetDate = new Date(deadline);
    const daysAvailable = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const taskTypePrompts = {
      exam: `Create an intensive exam preparation plan with spaced repetition, practice tests, and review sessions.`,
      study: `Create a comprehensive study plan with learning phases, practice, and consolidation.`,
      assignment: `Create a project completion plan with research, drafting, editing, and final review phases.`,
      workout: `Create a progressive fitness plan with warm-up, main exercises, and recovery periods.`,
      work: `Create a professional work plan with planning, execution, review, and delivery phases.`,
      research: `Create a structured research plan with literature review, data collection, analysis, and writing phases.`,
      language: `Create a language learning plan with vocabulary, grammar, speaking, and listening practice.`,
      skill: `Create a skill development plan with foundation building, practice, and mastery phases.`
    };

    const prompt = `
    You are an expert planning AI. Create a MAGICAL, highly intelligent plan for: "${projectTitle}"
    
    📋 PROJECT DETAILS:
    - Type: ${taskType.toUpperCase()}
    - Deadline: ${deadline} (${daysAvailable} days available)
    - Current Level: ${currentLevel}
    - Available Study Time: ${availableHoursPerDay} hours/day
    - Preferred Times: ${preferredStudyTimes.join(', ')}
    - Subjects/Topics: ${subjects?.join(', ') || 'Not specified'}
    - Additional Details: ${details}

    ${documentContent ? `
    📖 DOCUMENT CONTENT ANALYSIS:
    Based on the uploaded documents, here is the key content to create a plan around:
    
    ${documentContent}
    
    🎯 MAGIC INSTRUCTION: Analyze the document content above and create a highly personalized plan that:
    - Addresses the specific topics, concepts, and requirements mentioned in the documents
    - Follows the structure and learning objectives outlined in the materials
    - Creates tasks that directly relate to the document content
    - Identifies key chapters, sections, or concepts that need focused attention
    - Builds upon the knowledge presented in the documents progressively
    ` : ''}

    🎯 PLANNING STRATEGY:
    ${taskTypePrompts[taskType as keyof typeof taskTypePrompts] || taskTypePrompts.study}

    📚 INTELLIGENT FEATURES TO INCLUDE:
    - Spaced repetition for long-term retention
    - Progressive difficulty scaling
    - Buffer time for unexpected delays
    - Regular review and consolidation sessions
    - Milestone checkpoints
    - Active recall techniques
    - Variety in learning methods
    - Rest and recovery periods
    - Emergency catch-up plans

    ⚡ MAGIC HAPPENS HERE - Make the plan:
    1. ADAPTIVE: Adjusts based on available time and difficulty
    2. SCIENTIFIC: Uses proven learning techniques
    3. REALISTIC: Accounts for human limitations and motivation
    4. COMPREHENSIVE: Covers all necessary aspects
    5. MOTIVATING: Includes achievements and milestones

    🎨 CRITICAL: RESPOND WITH VALID JSON ONLY - NO MARKDOWN, NO EXPLANATIONS!
    
    Required JSON Format (respond with this exact structure):
    [
      {
        "title": "Engaging task title with emojis",
        "description": "Detailed description with specific actions, techniques, and expected outcomes. Include WHY this step is important.",
        "deadline": "YYYY-MM-DD",
        "priority": "high",
        "status": "pending",
        "duration": "2 hours",
        "category": "learning",
        "difficulty": "medium",
        "resources": ["textbook chapter 3", "practice problems", "flashcards"],
        "dailyTime": "morning 9-11 AM"
      }
    ]
    
    IMPORTANT: 
    - Do NOT wrap in code blocks
    - Do NOT include any text before or after the JSON array
    - Start directly with [ and end with ]
    - Use only double quotes for strings
    - Ensure valid JSON syntax
    
    IMPORTANT RULES:
    ✅ Create ${Math.min(Math.max(daysAvailable, 5), 20)} tasks spread strategically across ${daysAvailable} days
    ✅ Start with easier tasks and progress to harder ones
    ✅ Include regular review sessions (spaced repetition)
    ✅ Add buffer time before the deadline
    ✅ Balance intensive work with rest periods
    ✅ Include milestone celebrations
    ✅ Make each task specific and actionable
    ✅ Add variety to prevent burnout
    
    Remember: This isn't just a task list - it's a MAGICAL LEARNING EXPERIENCE! 🌟
    `;

    const response = await this.makeRequest(prompt);
    try {
      let cleanText = response.text.trim();
      
      // Remove markdown code blocks if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Remove any leading/trailing whitespace
      cleanText = cleanText.trim();
      
      // Try to find JSON array in the response if it's mixed with other text
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }
      
      console.log('Attempting to parse cleaned text:', cleanText.substring(0, 200) + '...');
      
      const parsed = JSON.parse(cleanText);
      
      // Ensure it's an array
      if (!Array.isArray(parsed)) {
        console.error('Parsed result is not an array:', parsed);
        return [];
      }
      
      // Ensure all tasks have required fields
      return parsed.map((task: any) => ({
        title: task.title || 'Untitled Task',
        description: task.description || 'No description provided',
        deadline: task.deadline || new Date().toISOString().split('T')[0],
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        duration: task.duration || '1 hour',
        category: task.category || 'study',
        difficulty: task.difficulty || 'medium',
        resources: task.resources || [],
        dailyTime: task.dailyTime || 'flexible'
      }));
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw response text:', response.text);
      
      // Return a fallback basic plan if parsing fails
      const today = new Date();
      const targetDate = new Date(deadline);
      const daysAvailable = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return [
        {
          title: `📚 Start ${projectTitle}`,
          description: `Begin working on ${projectTitle}. Break down the main components and create a detailed outline.`,
          deadline: new Date(Date.now() + Math.max(1, Math.floor(daysAvailable * 0.2)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'high' as const,
          status: 'pending' as const,
          duration: '2 hours',
          category: 'planning',
          difficulty: 'medium' as const,
          resources: ['notebook', 'research materials'],
          dailyTime: 'morning'
        },
        {
          title: `⚡ Main Work Phase`,
          description: `Focus on the core work of ${projectTitle}. Apply concentrated effort during your most productive hours.`,
          deadline: new Date(Date.now() + Math.max(2, Math.floor(daysAvailable * 0.7)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'high' as const,
          status: 'pending' as const,
          duration: `${availableHoursPerDay} hours`,
          category: 'execution',
          difficulty: 'hard' as const,
          resources: ['all necessary materials'],
          dailyTime: preferredStudyTimes[0] || 'morning'
        },
        {
          title: `✅ Review and Finalize`,
          description: `Review all work, make final adjustments, and prepare for submission/completion of ${projectTitle}.`,
          deadline: deadline,
          priority: 'medium' as const,
          status: 'pending' as const,
          duration: '1 hour',
          category: 'review',
          difficulty: 'easy' as const,
          resources: ['completed work', 'checklist'],
          dailyTime: 'flexible'
        }
      ];
    }
  }

  // Keep the original method for backwards compatibility
  async generateTaskPlan(projectTitle: string, deadline: string, details: string): Promise<TaskPlan[]> {
    return this.generateSmartTaskPlan(projectTitle, deadline, details);
  }

  async generateFlashcards(text: string): Promise<Flashcard[]> {
    const prompt = `
    Based on the following text, generate a set of flashcards. Each flashcard should have a "question" and a concise "answer".

    Text: "${text}"

    IMPORTANT: Respond ONLY with a valid JSON array of objects. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The entire response must be a single JSON array.

    JSON Format:
    [
      {
        "question": "What is the capital of Iraq?",
        "answer": "Baghdad"
      },
      {
        "question": "What is the main river in Iraq?",
        "answer": "The Tigris"
      }
    ]
    `;

    const response = await this.makeRequest(prompt);
    try {
      // Clean the response by removing markdown and extracting the JSON array
      const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanedText.match(/(\[[\s\S]*\])/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      console.error("Failed to find JSON in AI response:", response.text);
      return [];
    } catch (error) {
      console.error("Failed to parse quiz JSON:", error, "Raw response:", response.text);
      return [];
    }
  }

  async generateQuiz(text: string): Promise<QuizQuestion[]> {
    const prompt = `
    Based on the following text, generate a multiple-choice quiz. Each question should have four options and one correct answer.

    Text: "${text}"

    IMPORTANT: Respond ONLY with a valid JSON array of objects. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The entire response must be a single JSON array.

    JSON Format:
    [
      {
        "question": "Which of these is a primary color?",
        "options": ["Green", "Orange", "Blue", "Purple"],
        "correctAnswer": "Blue"
      },
      {
        "question": "What is 2 + 2?",
        "options": ["3", "4", "5", "6"],
        "correctAnswer": "4"
      }
    ]
    `;

    const response = await this.makeRequest(prompt);
    try {
      // Clean the response by removing markdown and extracting the JSON array
      const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanedText.match(/(\[[\s\S]*\])/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      console.error("Failed to find JSON in AI response:", response.text);
      return [];
    } catch (error) {
      console.error("Failed to parse quiz JSON:", error, "Raw response:", response.text);
      return [];
    }
  }

  async generatePresentation(
    text: string,
    slideCount: number,
    style: string,
    core: string
  ): Promise<PresentationSlide[]> {
    const prompt = `
    As an expert presentation designer, create a visually stunning and professional presentation based on the following text.

    Text: "${text}"
    Number of Slides: ${slideCount}
    Presentation Style: ${style}
    Core Focus: ${core}

    Instructions:
    - Generate a complete presentation with a title slide, content slides, and a concluding slide.
    - For each slide, provide a title, content, and a layout ('title', 'text', 'image-right', 'image-left').
    - The design should be clean, modern, and professional. Use strong typography and a clear hierarchy.
    - For slides with images, provide a relevant and concise "imageSearchTerm" (e.g., "data analysis", "team collaboration"). Do NOT provide a full URL.
    - Ensure the content is well-structured, concise, and easy to understand.

    IMPORTANT: Respond ONLY with a valid JSON array of objects. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The entire response must be a single JSON array.

    JSON Format:
    [
      {
        "title": "Presentation Title",
        "content": "A brief introduction to the topic.",
        "layout": "title"
      },
      {
        "title": "Key Point 1",
        "content": "Detailed explanation of the first key point.",
        "layout": "text"
      },
      {
        "title": "Visual for Key Point 2",
        "content": "Content related to the image.",
        "layout": "image-right",
        "imageSearchTerm": "business meeting"
      }
    ]
    `;

    const response = await this.makeRequest(prompt, 'gemini-2.5-flash');
    try {
      const jsonMatch = response.text.match(/(\[[\s\S]*\])/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error("Failed to parse presentation JSON:", error, "Raw response:", response.text);
      return [];
    }
  }

  async getWritingSuggestion(text: string): Promise<WritingSuggestion> {
    const prompt = `
    You are an AI writing supervisor. Analyze the following text and provide a suggestion to improve it. The suggestion can be a sentence completion, a grammar correction, or a vocabulary enhancement.

    Text: "${text}"

    IMPORTANT: Respond ONLY with a valid JSON object. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The entire response must be a single JSON object.

    JSON Format:
    {
      "type": "completion" | "grammar" | "vocabulary",
      "suggestion": "The suggested text."
    }
    `;

    const response = await this.makeRequest(prompt);
    try {
      const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanedText.match(/(\{[\s\S]*\})/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Failed to find JSON in AI response.");
    } catch (error) {
      console.error("Failed to parse writing suggestion JSON:", error, "Raw response:", response.text);
      throw error;
    }
  }

  async generateNextSentence(topic: string, currentText: string): Promise<NextSentence> {
    const prompt = `
    You are an AI writing partner. Your task is to write the very next sentence of the text provided, based on the overall topic.

    Topic: "${topic}"

    Current Text:
    "${currentText}"

    Instructions:
    - Write only one single, coherent sentence that logically follows the current text.
    - Maintain a consistent tone and style.
    - Do not repeat information.
    - Do not add any extra text, explanations, or labels.

    IMPORTANT: Respond ONLY with a valid JSON object containing the next sentence.

    JSON Format:
    {
      "sentence": "The single, complete next sentence."
    }
    `;

    const response = await this.makeRequest(prompt);
    try {
      const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanedText.match(/(\{[\s\S]*\})/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Failed to find JSON in AI response.");
    } catch (error) {
      console.error("Failed to parse next sentence JSON:", error, "Raw response:", response.text);
      throw error;
    }
  }

  private async simulateStreaming(text: string, options: StreamingOptions): Promise<void> {
    const { onChunk, onComplete, onError, chunkSize = 3, delay = 50 } = options;
    
    try {
      // Split text into words to make streaming more natural
      const words = text.split(' ');
      let currentChunk = '';
      
      for (let i = 0; i < words.length; i++) {
        // Add word to current chunk
        currentChunk += (currentChunk ? ' ' : '') + words[i];
        
        // Send chunk when we reach the desired chunk size or at the end
        if ((i + 1) % chunkSize === 0 || i === words.length - 1) {
          onChunk?.(currentChunk);
          currentChunk = '';
          
          // Add delay to simulate real-time streaming
          if (i < words.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      onComplete?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Streaming error'));
    }
  }

  async generateCitation(request: CitationRequest): Promise<string> {
    const prompt = `
    You are an expert academic librarian skilled in generating citations in various styles.
    Generate a citation for the following content in ${request.style} style.
    
    Content:
    "${request.content}"
    
    Instructions:
    - Provide only the citation text.
    - Do not include any explanations or extra text.
    - Ensure the citation is correctly formatted according to ${request.style} guidelines.
    - If the content is insufficient to create a full citation, do your best with the available information.
    `;

    const response = await this.makeRequest(prompt);
    return response.text.trim();
  }

  async chatWithFile(fileContent: string, message: string): Promise<string> {
    const prompt = `
    You are an intelligent assistant that can answer questions based on the provided file content.
    The user has uploaded a file and is asking a question about it.

    File Content:
    """
    ${fileContent}
    """

    User's Question: "${message}"

    Instructions:
    - Answer the user's question based *only* on the information in the file content.
    - If the answer is in the file, provide the answer and a reference to the page or section where the information can be found (if possible).
    - If the answer is not in the file, say that you cannot find the answer in the provided document.
    - Be concise and clear in your response.
    `;

    const response = await this.makeRequest(prompt);
    return response.text.trim();
  }

  private async makeFileRequest(prompt: string, fileData: { mimeType: string; data: string }): Promise<GeminiResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: fileData
              }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        text: data.candidates[0].content.parts[0].text
      };
    } catch (error) {
      console.error('Gemini File API Error:', error);
      throw new Error('Failed to communicate with AI service for file processing');
    }
  }

  async extractTextFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to base64 for sending to Gemini
      const base64 = btoa(String.fromCharCode(...uint8Array));
      
      const prompt = `
      Please extract all text content from this PDF document. 
      Return only the plain text content, organized in a readable format.
      Focus on:
      - Main headings and sections
      - Key topics and concepts
      - Important details and requirements
      - Learning objectives or goals
      
      Provide clean, well-structured text that can be used for academic planning.
      `;

      const response = await this.makeFileRequest(prompt, {
        mimeType: 'application/pdf',
        data: base64
      });

      return response.text || 'Could not extract text from PDF';
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  async extractTextFromMultipleFiles(files: File[]): Promise<string> {
    try {
      const extractedTexts: string[] = [];
      
      for (const file of files) {
        if (file.type === 'application/pdf') {
          const text = await this.extractTextFromPDF(file);
          extractedTexts.push(`\n=== ${file.name} ===\n${text}\n`);
        } else if (file.type === 'text/plain' || file.name.endsWith('.md')) {
          const text = await file.text();
          extractedTexts.push(`\n=== ${file.name} ===\n${text}\n`);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Handle Word documents using the existing fileReader
          const { readFileContent } = await import('@/lib/fileReader');
          const text = await readFileContent(file) as string;
          extractedTexts.push(`\n=== ${file.name} ===\n${text}\n`);
        }
      }
      
      return extractedTexts.join('\n');
    } catch (error) {
      console.error('Multi-file extraction error:', error);
      throw new Error('Failed to extract text from files');
    }
  }

  async extractTextFromImage(base64Image: string, language: 'ku' | 'en'): Promise<string> {
    try {
      // Enhanced Kurdish OCR prompt with grammar reference table
      const prompt = language === 'ku' 
        ? `You are an expert Kurdish Sorani OCR system using advanced language understanding. Extract text from this image with perfect accuracy.

LANGUAGE: Kurdish Sorani (کوردی سۆرانی)

CRITICAL: PRESERVE ORIGINAL FORMATTING AND LINE BREAKS!
- Maintain the exact line structure as shown in the image
- Each line in the image should be a separate line in the output
- Do NOT put all text on one line
- Preserve verse/poetry structure if present
- Keep paragraph breaks and spacing as they appear

KURDISH GRAMMAR REFERENCE TABLE - USE THIS TO AVOID MISTAKES:

COMMON VERBS (correct forms):
- مردم (mirdim) = I died
- کردم (kirdim) = I did  
- هاتم (hatim) = I came
- چووم (çûm) = I went
- بووم (bûm) = I was/became
- دیتم (dîtim) = I saw
- وتم (witim) = I said
- خواردم (xwardim) = I ate
- نووسیم (nûsîm) = I wrote
- خوێندم (xwêndim) = I read

COMMON WORDS (correct spellings):
- کە (ke) = that/which
- لە (le) = in/from  
- بە (be) = with/by
- بۆ (bo) = for/to
- دە (de) = prefix meaning "continuous"
- نە (ne) = not
- من (min) = I/me
- تۆ (to) = you
- ئەو (ew) = he/she/that
- ئێمە (ême) = we
- ئێوە (êwe) = you (plural)
- ئەوان (ewan) = they

KURDISH LETTERS & COMBINATIONS:
- ە (schwa) - not ه or ە with spaces
- ێ (ê) - not ي or ی  
- ۆ (ô) - not و or ۆ with spaces
- وە (we) - Kurdish diphthong, keep together
- ژ (zh) - Kurdish specific letter
- ڕ (rr) - Kurdish rolled R
- ڵ (ll) - Kurdish doubled L
- چ (ch) - Kurdish CH sound
- گ (g) - Kurdish G
- پ (p) - Kurdish P
- ک (k) - Kurdish K, not Arabic ك

GRAMMAR RULES:
1. Past tense verbs often end in -م (-im): مردم، کردم، هاتم
2. Kurdish uses ە for many vowels, not ه
3. Present tense marker is دە- (de-): دەکەم، دەڕۆم
4. Negative is نا- (na-): ناکەم، ناڕۆم
5. Kurdish compound verbs: دەرهێنان، پێشکەش کردن

Extract the text with correct Kurdish grammar, spelling, AND ORIGINAL LINE BREAKS:`
        : `Extract all text from this image in English. Return only the extracted text exactly as it appears.`;

      const imageData = base64Image.split(',')[1];
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageData
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 8192,
        }
      };

      let lastError;
      const maxRetries = 3;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            }
          );

          if (response.status === 429) {
            const errorData = await response.json().catch(() => ({}));
            const retryAfter = errorData.error?.details?.find((d: any) => 
              d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
            )?.retryDelay;
            
            if (retryAfter && attempt < maxRetries - 1) {
              const waitTime = retryAfter.endsWith('s') 
                ? parseInt(retryAfter) * 1000 
                : Math.pow(2, attempt) * 1000;
              
              console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OCR API Error Response:', response.status, errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          if (!extractedText.trim()) {
            throw new Error('No text found in the image');
          }

          // For Kurdish, apply grammar fixes while preserving line structure
          if (language === 'ku') {
            return extractedText
              // Fix common verb forms that get misread
              .replace(/مەردم/g, 'مردم')        // mirdim (I died) - fix extra ە
              .replace(/مەردەم/g, 'مردم')      // mirdim (I died) - fix wrong vowels
              .replace(/کەردم/g, 'کردم')       // kirdim (I did) - fix ە to nothing
              .replace(/کەردەم/g, 'کردم')     // kirdim (I did) - fix wrong vowels
              .replace(/هاتەم/g, 'هاتم')       // hatim (I came) - fix extra ە
              .replace(/چووەم/g, 'چووم')       // çûm (I went) - fix extra ە
              .replace(/بووەم/g, 'بووم')       // bûm (I was) - fix extra ە
              .replace(/دیتەم/g, 'دیتم')       // dîtim (I saw) - fix extra ە
              .replace(/وتەم/g, 'وتم')         // witim (I said) - fix extra ە
              .replace(/خواردەم/g, 'خواردم')    // xwardim (I ate) - fix extra ە
              .replace(/نووسیەم/g, 'نووسیم')   // nûsîm (I wrote) - fix extra ە
              .replace(/خوێندەم/g, 'خوێندم')    // xwêndim (I read) - fix extra ە
              
              // Fix common word mistakes
              .replace(/کەە/g, 'کە')          // ke (that) - fix double ە
              .replace(/لەە/g, 'لە')          // le (from) - fix double ə  
              .replace(/بەە/g, 'بە')          // be (with) - fix double ə
              .replace(/دەە/g, 'دە')          // de (prefix) - fix double ə
              .replace(/نەە/g, 'نە')          // ne (not) - fix double ə
              
              // Fix letter spacing and combination issues (but preserve line breaks)
              .replace(/ک ە/g, 'کە')          // ke (that)
              .replace(/ل ە/g, 'لە')          // le (from)
              .replace(/ب ە/g, 'بە')          // be (with)
              .replace(/د ە/g, 'دە')          // de (prefix)
              .replace(/ن ە/g, 'نە')          // ne (not)
              .replace(/م ن/g, 'من')          // min (I)
              .replace(/ت ۆ/g, 'تۆ')          // to (you)
              .replace(/ئ ەو/g, 'ئەو')        // ew (he/she)
              
              // Fix Kurdish specific letters that get misread
              .replace(/وه\b/g, 'وە')         // we diphthong at word end
              .replace(/ره\b/g, 'ڕە')         // rre at word end  
              .replace(/یه\b/g, 'یە')         // ye at word end
              
              // Clean up spaces within lines but preserve line structure
              .replace(/[ \t]+/g, ' ')        // Multiple spaces/tabs -> single space (within lines)
              .replace(/[ \t]*\n[ \t]*/g, '\n') // Clean spaces around line breaks but keep breaks
              .replace(/\n{3,}/g, '\n\n')     // Max 2 consecutive line breaks
              .trim();                        // Only trim start/end of entire text
          }
          
          return extractedText.trim();

        } catch (error) {
          lastError = error;
          console.error(`OCR attempt ${attempt + 1} failed:`, error);
          
          if (attempt < maxRetries - 1) {
            const waitTime = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      console.error('OCR API Error:', lastError);
      throw new Error(`Failed to extract text from image. Please try again.`);
    } catch (error) {
      console.error('OCR API Error:', error);
      throw new Error('Failed to extract text from image. Please try again.');
    }
  }

  private getRetryDelay(errorText: string): number | null {
    try {
      const errorData = JSON.parse(errorText);
      const retryInfo = errorData.error?.details?.find((detail: any) => 
        detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
      );
      if (retryInfo?.retryDelay) {
        // Parse delay like "49s" to milliseconds
        const match = retryInfo.retryDelay.match(/(\d+)s/);
        return match ? parseInt(match[1]) * 1000 : null;
      }
    } catch (e) {
      // Ignore parsing errors
    }
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test method to validate OCR functionality
  async testOCRConnection(): Promise<string> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Say 'OCR connection test successful'" }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Test failed';
    } catch (error) {
      console.error('OCR Connection Test Error:', error);
      throw error;
    }
  }

  async translateText(prompt: string): Promise<string> {
    try {
      const response = await this.makeRequest(prompt);
      return response.text;
    } catch (error) {
      console.error('Translation Error:', error);
      throw error;
    }
  }

  async researchQuery(query: string): Promise<ResearchResult> {
    try {
      const researchPrompt = `
You are an AI Research Assistant. Please conduct comprehensive research on the following query: "${query}"

Provide a detailed response in JSON format with the following structure:
{
  "title": "A concise title for the research",
  "summary": "A comprehensive 2-3 paragraph summary of the topic",
  "credibilityScore": "A score from 0-100 based on available reliable sources",
  "keyFindings": [
    "Key finding 1",
    "Key finding 2", 
    "Key finding 3",
    "Key finding 4"
  ],
  "relatedTopics": [
    "Related topic 1",
    "Related topic 2",
    "Related topic 3",
    "Related topic 4",
    "Related topic 5"
  ],
  "sources": [
    {
      "title": "Source title",
      "author": "Author name",
      "type": "academic|government|organization|news|other",
      "credibilityScore": 0-100,
      "publishDate": "YYYY-MM-DD",
      "url": "https://example.com"
    }
  ],
  "citations": [
    {
      "format": "APA",
      "citation": "APA formatted citation"
    },
    {
      "format": "MLA", 
      "citation": "MLA formatted citation"
    },
    {
      "format": "Chicago",
      "citation": "Chicago formatted citation"
    }
  ]
}

Please ensure:
1. The research is factual and based on credible sources
2. Key findings are specific and actionable
3. Related topics help users explore further
4. Sources are from reputable academic, government, or organizational sources
5. Citations follow proper formatting standards
6. All content is appropriate for academic use
7. If the query is in Kurdish, respond in Kurdish; if in English, respond in English
8. Maintain high academic standards and objectivity

Query: "${query}"
`;

      const response = await this.makeRequest(researchPrompt);
      
      // Try to parse JSON response
      try {
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const researchData = JSON.parse(jsonMatch[0]);
          
          // Add IDs and validate structure
          const result: ResearchResult = {
            id: Date.now().toString(),
            title: researchData.title || 'Research Result',
            summary: researchData.summary || 'Summary not available',
            credibilityScore: researchData.credibilityScore || 75,
            keyFindings: researchData.keyFindings || [],
            relatedTopics: researchData.relatedTopics || [],
            sources: (researchData.sources || []).map((source: any, index: number) => ({
              id: (index + 1).toString(),
              title: source.title || 'Unknown Source',
              author: source.author || 'Unknown Author',
              type: source.type || 'other',
              credibilityScore: source.credibilityScore || 70,
              publishDate: source.publishDate || new Date().toISOString().split('T')[0],
              url: source.url || '#'
            })),
            citations: (researchData.citations || []).map((citation: any, index: number) => ({
              id: (index + 1).toString(),
              format: citation.format || 'APA',
              citation: citation.citation || 'Citation not available'
            }))
          };
          
          return result;
        }
      } catch (parseError) {
        console.warn('Could not parse JSON response, using fallback');
      }

      // Fallback if JSON parsing fails
      return {
        id: Date.now().toString(),
        title: query,
        summary: response.text.slice(0, 500) + '...',
        credibilityScore: 75,
        keyFindings: [
          'Research completed using AI analysis',
          'Multiple perspectives considered',
          'Academic sources referenced',
          'Comprehensive overview provided'
        ],
        relatedTopics: [
          'Further research needed',
          'Related academic studies',
          'Current developments',
          'Future implications',
          'Practical applications'
        ],
        sources: [
          {
            id: '1',
            title: 'AI Generated Research Summary',
            author: 'AI Research Assistant',
            type: 'other' as const,
            credibilityScore: 75,
            publishDate: new Date().toISOString().split('T')[0],
            url: '#'
          }
        ],
        citations: [
          {
            id: '1',
            format: 'APA' as const,
            citation: 'AI Research Assistant. (' + new Date().getFullYear() + '). Research Analysis of "' + query + '". AI Academic Hub.'
          }
        ]
      };

    } catch (error) {
      console.error('Research Query Error:', error);
      throw new Error('Unable to complete research query. Please try again.');
    }
  }

  async fixTextStructure(prompt: string): Promise<{ text: string }> {
    try {
      const response = await this.makeRequest(prompt);
      return { text: response.text };
    } catch (error) {
      console.error('Text Structure Fix Error:', error);
      throw new Error('Unable to fix text structure. Please try again.');
    }
  }
}

export const geminiService = new GeminiService();

// Export research function for direct use
export const researchQuery = (query: string) => geminiService.researchQuery(query);